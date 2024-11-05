'use client'
import { useState, useEffect } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useStore } from '@/Hooks/useStore'
import { useNavigate } from 'react-router-dom'
import { getAllUsers, getUserByAddress } from '@/Hooks/undername'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { useActiveAddress } from "@arweave-wallet-kit/react"

export function LinkGenerator() {
  const [name, setName] = useState('')
  const [existingNames, setExistingNames] = useState<string[]>([])
  const [isNameTaken, setIsNameTaken] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const setUserName = useStore((state) => state.setUserName)
  const setFormattedLink = useStore((state) => state.setFormattedLink)
  const setFormattedName = useStore((state) => state.setFormattedName)
  const setUnderName = useStore((state) => state.setUndername)
  const setShareLink = useStore((state) => state.setShareLink)
  const navigate = useNavigate()
  const activeAddress = useActiveAddress()
  const formattedName = name ? `ar://${name}_linkspace` : ''
  
  useEffect(() => {
    const checkExistingUser = async () => {
      if (activeAddress) {
        try {
          const userResponse = await getUserByAddress(activeAddress)
          if (userResponse.success) {
            // User exists, set their name and navigate to share page
            setUserName(userResponse.undername)
            setUnderName(userResponse.undername)
            setFormattedLink(`ar://${userResponse.undername}_linkspace`)
            setFormattedName(`https://${userResponse.undername}_linkspace.ar-io.dev/`)
            setShareLink(`https://${userResponse.undername}_linkspace.ar-io.dev/`)
            navigate('/share')
            return // Exit early as user already has a name
          }
        } catch (err) {
          console.error('Error checking existing user:', err)
        }
      }
      
      // If no existing user is found, proceed with fetching all names
      fetchExistingNames()
    }
//@ts-ignore
    const fetchExistingNames = async () => {
      try {
        const response = await getAllUsers()
        if (response.success && Array.isArray(response.result)) {
          console.log('Available names:', response.result)
          setExistingNames(response.result)
        } else {
          console.error('Invalid response format:', response)
          setError('Failed to fetch existing names')
        }
      } catch (err) {
        console.error('Error fetching names:', err)
        setError('Failed to fetch existing names')
      } finally {
        setIsLoading(false)
      }
    }
    
    checkExistingUser()
  }, [activeAddress, navigate, setUserName, setFormattedLink, setFormattedName, setShareLink])

  useEffect(() => {
    if (name && existingNames.length > 0) {
      const isTaken = existingNames.includes(name)
      console.log(`Checking name "${name}"`, isTaken ? 'TAKEN' : 'AVAILABLE')
      setIsNameTaken(isTaken)
    }
  }, [name, existingNames])
  
  const validateAndFormatName = (input: string) => {
    const formatted = input
      .toLowerCase()
      .replace(/\s+/g, '')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/^-+|-+$/g, '')
    
    console.log('Formatted input:', formatted)
    
    if (formatted.length < 3 && formatted.length > 0) {
      setError('Name must be at least 3 characters long')
    } else if (formatted.length > 63) {
      setError('Name must be less than 63 characters')
    } else {
      setError(null)
    }

    return formatted
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedInput = validateAndFormatName(e.target.value)
    setName(formattedInput)
  }
  
  const handleGrabLink = () => {
    if (!isNameTaken && name && !error && name.length >= 3) {
      console.log('Claiming name:', name)
      console.log('Current existing names:', existingNames)
      console.log('Storing formatted link:', formattedName)
      
      setUserName(name)
      setFormattedLink(formattedName)
      setFormattedName(formattedName)
      
      navigate('/create')
    }
  }
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div>Loading existing names...</div>
      </div>
    )
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
              onChange={handleNameChange}
              aria-label="Enter your name"
              minLength={3}
              maxLength={63}
              disabled={isLoading || existingNames.length === 0}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              _linkspace.ar-io.dev/
            </div>
          </div>
          
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          )}
          
          {isNameTaken && name && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This name is already taken. Please choose another one.
              </AlertDescription>
            </Alert>
          )}
          
          {name && (
            <Button 
              className="w-full py-6 text-lg"
              onClick={handleGrabLink}
              disabled={isNameTaken || !!error || name.length < 3}
            >
              {isNameTaken ? 'Name Already Taken' : 
               error ? 'Invalid Name' :
               'Grab my link'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}