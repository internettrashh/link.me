import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useStore } from '@/Hooks/useStore'
import { useNavigate } from 'react-router-dom'
export function LinkGenerator() {
  const [name, setName] = useState('')
  const setUserName = useStore((state) => state.setUserName)
  const navigate = useNavigate()
  const formattedName = name ? `ar://${name}_linkspace` : ''
  
  const handleGrabLink = () => {
    setUserName(name)
    console.log(`Claiming link: ${formattedName}`)
    navigate('/create') 
    // You might want to make an API call here or perform other actions
  }
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            First, claim your unique link
          </h1>
          <p className="text-muted-foreground text-lg">
            The good ones are still available!
          </p>
        </div>
        
        {name && (
          <Card className="border-2">
            <CardContent className="p-4">
              <div className="font-mono text-xl break-all text-primary">
                {formattedName}
              </div>
            </CardContent>
          </Card>
        )}
        
        <div className="space-y-4">
          <div className="relative">
            <Input
              className="w-full pl-4 pr-20 py-6 text-lg bg-background border-2 text-center"
              placeholder="your-name"
              value={name}
              onChange={(e) => setName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              aria-label="Enter your name"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              _linkspace
            </div>
          </div>
          
          {name && (
            <Button 
              className="w-full py-6 text-lg"
              onClick={handleGrabLink}
            >
              Grab my link
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}