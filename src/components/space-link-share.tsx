import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Check, Share2, AlertTriangle } from "lucide-react"
import confetti from 'canvas-confetti'
import { useStore } from '@/Hooks/useStore'
import { removeRecord } from '@/Hooks/undername'
import { useNavigate } from 'react-router-dom'

export function SpaceLinkShare() {
  const [showLink, setShowLink] = useState(false)
  const [copied, setCopied] = useState(false)
  const navigate = useNavigate()
  
  // Get shareLink from global store
  const shareLink = useStore((state) => state.shareLink)
  const formattedName = useStore((state) => state.formattedName)
  const undername = useStore((state) => state.undername)
  

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLink(true)
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      })
    }, 1000)

    // Log the Arweave link
    console.log('Arweave Share Link:', shareLink)
    console.log('Formatted Name:', formattedName)

    return () => clearTimeout(timer)
  }, [shareLink, formattedName])

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const handleDelete = async () => {
    if (!undername) {
      console.error('No undername found to delete')
      return
    }
    
    try {
      await removeRecord(undername)
      navigate('/')
    } catch (err) {
      console.error('Failed to delete space:', err)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 space-y-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Here's your space permalink</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {showLink ? (
            <div className="animate-fade-in">
              <Input 
                value={shareLink} 
                readOnly 
                className="text-center font-medium mb-2"
              />
              {formattedName && (
                <Input 
                  value={formattedName} 
                  readOnly 
                  className="text-center font-medium text-gray-500"
                />
              )}
            </div>
          ) : (
            <div className="h-10 bg-gray-200 animate-pulse rounded"></div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button 
            onClick={copyToClipboard}
            className="w-full max-w-xs"
          >
            {copied ? (
              <>
                <Check className="mr-2 h-4 w-4" /> Copied!
              </>
            ) : (
              <>
                <Share2 className="mr-2 h-4 w-4" /> Share your space
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
      
      <div className="w-full max-w-md">
        <div className="text-sm font-semibold text-red-600 mb-2">Danger Zone</div>
        <Button 
          variant="destructive" 
          className="w-full"
          onClick={handleDelete}
        >
          <AlertTriangle className="mr-2 h-4 w-4" />
          Delete your space
        </Button>
      </div>
    </div>
  )
}