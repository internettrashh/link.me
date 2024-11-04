import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusCircle, Linkedin, Instagram, Twitter, Music, Dribbble, MapPin, Sun, Moon } from 'lucide-react'

interface LinkItem {
  icon: React.ReactNode
  title: string
  subtitle?: string
  action?: string
  images?: string[]
  size: 'small' | 'medium' | 'large'
  orientation: 'square' | 'horizontal' | 'vertical'
  bgColor?: string
  content?: React.ReactNode
}

const links: LinkItem[] = [
  { 
    icon: <Linkedin className="h-6 w-6 text-[#0077B5]" />, 
    title: "Let's connect", 
    subtitle: "linkedin.com",
    size: 'small', 
    orientation: 'square',
    bgColor: 'bg-blue-50 dark:bg-blue-950'
  },
  { 
    icon: <Instagram className="h-6 w-6 text-[#E4405F]" />, 
    title: "@rxmana", 
    images: [
      "/placeholder.svg?height=80&width=80",
      "/placeholder.svg?height=80&width=80",
      "/placeholder.svg?height=80&width=80",
      "/placeholder.svg?height=80&width=80"
    ],
    size: 'medium', 
    orientation: 'vertical',
    action: "Follow 993"
  },
  { 
    icon: <Twitter className="h-6 w-6 text-[#1DA1F2]" />, 
    title: "Thoughts etc", 
    subtitle: "@rxmana",
    size: 'small', 
    orientation: 'square',
    action: "Follow",
    bgColor: 'bg-blue-50 dark:bg-blue-950'
  },
  { 
    icon: <Music className="h-6 w-6 text-[#1DB954]" />, 
    title: "Summer '23", 
    subtitle: "20 songs",
    size: 'medium', 
    orientation: 'vertical',
    action: "Play",
    bgColor: 'bg-green-50 dark:bg-green-950',
    images: [
      "/placeholder.svg?height=60&width=60",
      "/placeholder.svg?height=60&width=60",
      "/placeholder.svg?height=60&width=60",
      "/placeholder.svg?height=60&width=60"
    ]
  },
  { 
    icon: <Dribbble className="h-6 w-6 text-[#EA4C89]" />, 
    title: "@rxmana", 
    size: 'small', 
    orientation: 'square',
    action: "Follow",
    bgColor: 'bg-pink-50 dark:bg-pink-950'
  },
  { 
    icon: <MapPin className="h-6 w-6 text-red-500" />, 
    title: "Hamburg, Germany", 
    size: 'medium', 
    orientation: 'horizontal',
    content: (
      <div className="w-full h-32 bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden">
        <img 
          src="/placeholder.svg?height=128&width=256" 
          alt="Map of Hamburg" 
          width={256} 
          height={128} 
          className="w-full h-full object-cover" 
        />
      </div>
    )
  },
]

export function ProfilePageComponent() {
  const [view, setView] = useState<'desktop' | 'mobile'>('mobile')
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    document.documentElement.classList.toggle('dark')
  }

  const getCardClass = (size: LinkItem['size'], orientation: LinkItem['orientation']) => {
    const baseClass = "overflow-hidden"
    if (view === 'mobile') {
      if (size === 'small') return `${baseClass} col-span-1`
      if (size === 'medium' && orientation === 'vertical') return `${baseClass} col-span-1 row-span-2`
      if (size === 'medium' && orientation === 'horizontal') return `${baseClass} col-span-2`
      if (size === 'large') return `${baseClass} col-span-2 row-span-2`
    } else {
      if (size === 'small') return `${baseClass} col-span-1 row-span-1`
      if (size === 'medium' && orientation === 'horizontal') return `${baseClass} col-span-2 row-span-1`
      if (size === 'medium' && orientation === 'vertical') return `${baseClass} col-span-1 row-span-2`
      if (size === 'large') return `${baseClass} col-span-2 row-span-2`
    }
    return baseClass
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 dark:bg-gray-950">
      <Card className={`w-full ${view === 'desktop' ? 'max-w-5xl' : 'max-w-sm'}`}>
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-4 mb-6">
            <div className="relative w-24 h-24">
              <img
                src="/placeholder.svg"
                alt="Profile picture"
                className="rounded-full object-cover w-full h-full"
              />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold dark:text-white">Romana</h1>
              <p className="text-muted-foreground">
                🖊️ Product Designer
              </p>
            </div>
          </div>

          <div className="mb-6 flex justify-between items-center">
            <Tabs value={view} onValueChange={(v) => setView(v as 'desktop' | 'mobile')}>
              <TabsList>
                <TabsTrigger value="desktop">Desktop</TabsTrigger>
                <TabsTrigger value="mobile">Mobile</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full"
            >
              {theme === 'light' ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </Button>
          </div>

          <div className={`grid gap-4 ${view === 'desktop' ? 'grid-cols-4' : 'grid-cols-2'}`}>
            {links.map((link, index) => (
              <Card key={index} className={`${getCardClass(link.size, link.orientation)} ${link.bgColor || ''}`}>
                <CardContent className="p-4 flex flex-col h-full">
                  <div className="flex items-center gap-2 mb-2">
                    {link.icon}
                    <div>
                      <h2 className="font-semibold text-sm dark:text-white">{link.title}</h2>
                      {link.subtitle && <p className="text-xs text-muted-foreground">{link.subtitle}</p>}
                    </div>
                  </div>
                  {link.images && (
                    <div className="flex-grow grid grid-cols-2 gap-2 my-2">
                      {link.images.map((img, i) => (
                        <img 
                          key={i} 
                          src={img} 
                          alt="" 
                          width={80} 
                          height={80} 
                          className="rounded object-cover w-full h-full" 
                        />
                      ))}
                    </div>
                  )}
                  {link.content && (
                    <div className="flex-grow my-2">
                      {link.content}
                    </div>
                  )}
                  {link.action && (
                    <Button variant="secondary" size="sm" className="mt-auto self-start text-xs">
                      {link.action}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
      <Button size="icon" className="fixed bottom-4 right-4 rounded-full">
        <PlusCircle className="h-6 w-6" />
      </Button>
    </div>
  )
}

export default ProfilePageComponent;