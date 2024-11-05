'use client'
import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Twitter, Instagram, Linkedin, Github, Youtube, Dribbble, Figma, FileText, Plus, Trash2, Edit } from 'lucide-react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { HexColorPicker } from "react-colorful"
import { uploadHtmlFile } from '@/Hooks/uploadsite'
import { ConnectButton, useConnection } from "arweave-wallet-kit"

interface BentoItem {
  id: string
  type: 'social' | 'image' | 'embed' | 'text'
  content: {
    platform?: string
    username?: string
    url?: string
    text?: string
    imageUrl?: string
  }
  icon: React.ReactNode
  bgColor: string
  textColor: string
  width: number
  height: number
  shape: 'square' | 'rounded' | 'circle'
}

const initialItems: BentoItem[] = [
  { id: '1', type: 'social', content: { platform: 'Twitter', username: '@example', url: 'https://twitter.com/example' }, icon: <Twitter className="h-6 w-6 text-black" />, bgColor: '#E6F3FF', textColor: '#000000', width: 1, height: 1, shape: 'rounded' },
  { id: '2', type: 'social', content: { platform: 'Instagram', username: '@example', url: 'https://instagram.com/example' }, icon: <Instagram className="h-6 w-6 text-black" />, bgColor: '#FFEDF0', textColor: '#000000', width: 1, height: 1, shape: 'rounded' },
  { id: '3', type: 'image', content: { imageUrl: 'https://source.unsplash.com/random/400x400' }, icon: <FileText className="h-6 w-6 text-black" />, bgColor: '#F0F0F0', textColor: '#000000', width: 2, height: 2, shape: 'rounded' },
  { id: '4', type: 'embed', content: { url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' }, icon: <Youtube className="h-6 w-6 text-black" />, bgColor: '#FFEEEE', textColor: '#000000', width: 2, height: 1, shape: 'rounded' },
  { id: '5', type: 'text', content: { text: 'Welcome to my linkspace profile!' }, icon: <FileText className="h-6 w-6 text-black" />, bgColor: '#E6FFE6', textColor: '#000000', width: 2, height: 1, shape: 'rounded' },
]

const socialPlatforms = [
  { name: 'Twitter', icon: <Twitter className="h-6 w-6" /> },
  { name: 'Instagram', icon: <Instagram className="h-6 w-6" /> },
  { name: 'LinkedIn', icon: <Linkedin className="h-6 w-6" /> },
  { name: 'GitHub', icon: <Github className="h-6 w-6" /> },
  { name: 'YouTube', icon: <Youtube className="h-6 w-6" /> },
  { name: 'Dribbble', icon: <Dribbble className="h-6 w-6" /> },
  { name: 'Figma', icon: <Figma className="h-6 w-6" /> },
]

const dialogContentStyles = {
  backgroundColor: 'white',
  color: 'black',
}

const inputStyles = {
  backgroundColor: 'white',
  color: 'black',
  border: '1px solid #e2e8f0', // light gray border
}

const textareaStyles = {
  backgroundColor: 'white',
  color: 'black',
  border: '1px solid #e2e8f0',
}

// Add this helper function to extract Tenor GIF ID
const getTenorId = (url: string) => {
  const match = url.match(/tenor\.com\/view\/[^-]+-gif-(\d+)/);
  return match ? match[1] : null;
};

export function EnhancedBentoProfileComponent() {
  const { connected } = useConnection()

  const [name, setName] = useState('John Doe')
  const [bio, setBio] = useState('Welcome to my linkspace profile!')
  const [items, setItems] = useState<BentoItem[]>(initialItems)
  const [bgType, setBgType] = useState<'color' | 'image' | 'gif'>('color')
  const [bgColor, setBgColor] = useState('#F3E8FF')
  const [bgImage, setBgImage] = useState('')
  const [bgGif, setBgGif] = useState('')
  const [editingItem, setEditingItem] = useState<BentoItem | null>(null)
  // const [showColorPicker, setShowColorPicker] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [showBgEditor, setShowBgEditor] = useState(false)
  const [profileImage, setProfileImage] = useState('https://i.pinimg.com/originals/1a/ab/17/1aab17124bee3720d418fdc9fd0c9816.jpg')

  const handleAddItem = () => {
    const newItem: BentoItem = {
      id: Date.now().toString(),
      type: 'text',
      content: { text: 'New item' },
      icon: <FileText className="h-6 w-6" />,
      bgColor: '#F0F0F0',
      textColor: '#000000',
      width: 1,
      height: 1,
      shape: 'rounded'
    }
    setItems([...items, newItem])
    setEditingItem(newItem)
  }

  const handleDeleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id))
  }

  const handleEditItem = (item: BentoItem) => {
    setEditingItem(item)
  }

  const handleSaveItem = (updatedItem: BentoItem) => {
    setItems(items.map(item => item.id === updatedItem.id ? updatedItem : item))
    setEditingItem(null)
  }

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const newItems = Array.from(items)
    const [reorderedItem] = newItems.splice(result.source.index, 1)
    newItems.splice(result.destination.index, 0, reorderedItem)

    setItems(newItems)
  }

  const renderItemContent = (item: BentoItem) => {
    switch (item.type) {
      case 'social':
        return (
          <a href={item.content.url} target="_blank" rel="noopener noreferrer" className="w-full h-full flex flex-col items-center justify-center text-black">
            {item.icon}
            <h3 className="font-semibold mt-2 text-black">{item.content.platform}</h3>
            <p className="text-sm text-black">{item.content.username}</p>
            <Button className="mt-2 text-white" style={{ backgroundColor: item.textColor }}>
              Follow
            </Button>
          </a>
        )
      case 'image':
        return (
          <div className="w-full h-full relative">
            <img
              src={item.content.imageUrl || ''}
              alt="Bento item image"
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
        )
      case 'embed':
        const isYouTube = item.content.url?.includes('youtube.com') || item.content.url?.includes('youtu.be');
        const isTenor = item.content.url?.includes('tenor.com/view/');
        
        if (isYouTube) {
          const videoId = item.content.url?.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i)?.[1];
          const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&enablejsapi=1`;
          return (
            <iframe
              src={embedUrl}
              className="w-full h-full rounded-lg"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          );
        } else if (isTenor) {
          const tenorId = getTenorId(item.content.url || '');
          if (tenorId) {
            return (
              <div className="tenor-gif-embed w-full h-full" data-postid={tenorId} data-share-method="host">
                <iframe 
                  src={`https://tenor.com/embed/${tenorId}?autoplay=1`}
                  className="w-full h-full rounded-lg"
                  frameBorder="0"
                  allowFullScreen
                />
              </div>
            );
          }
        }
        return (
          <iframe
            src={item.content.url}
            className="w-full h-full rounded-lg"
            allowFullScreen
          />
        );
      case 'text':
        return <p className="text-sm text-black">{item.content.text}</p>
      default:
        return null
    }
  }

  const getBackgroundStyle = (): React.CSSProperties => {
    switch (bgType) {
      case 'color':
        return { backgroundColor: bgColor }
      case 'image':
        return { 
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }
      case 'gif':
        return { 
          backgroundColor: 'transparent',
          position: 'relative' as const
        }
    }
  }

  useEffect(() => {
    // This effect will run on the client-side after hydration
    setItems(initialItems)
  }, [])

  useEffect(() => {
    if (bgType === 'gif' && bgGif) {
      // Small delay to ensure the DOM is ready
      setTimeout(loadTenorScript, 100);
    }
  }, [bgGif, bgType]);

  const loadTenorScript = () => {
    // Remove any existing Tenor script first
    const existingScript = document.querySelector('script[src="https://tenor.com/embed.js"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Create and append new script
    const script = document.createElement('script');
    script.src = 'https://tenor.com/embed.js';
    script.async = true;
    document.body.appendChild(script);
  };

  const generateStaticHTML = () => {
    // Add background-specific styles
    const getBackgroundStyles = () => {
      switch (bgType) {
        case 'color':
          return `background-color: ${bgColor};`;
        case 'image':
          return `
            background-image: url('${bgImage}');
            background-size: cover;
            background-position: center;
          `;
        case 'gif':
          return `background-color: transparent;`; // We'll handle GIF separately
      }
    };

    const minimalStyles = `
      @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css');
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { 
        font-family: system-ui, -apple-system, sans-serif;
        min-height: 100vh;
        ${getBackgroundStyles()}
        padding: 2rem;
        position: relative;
      }
      .background-container {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 0;
        overflow: hidden;
      }
      .background-container > div {
        width: 100% !important;
        height: 100% !important;
      }
      .container { 
        position: relative;
        z-index: 10;
        max-width: 64rem;
        margin: 0 auto;
        background: white;
        border-radius: 0.75rem;
        box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
        padding: 2rem;
      }
      .profile-header {
        display: flex;
        align-items: center;
        gap: 2rem;
        margin-bottom: 2rem;
      }
      .avatar-container {
        position: relative;
        width: 8rem;
        height: 8rem;
        flex-shrink: 0;
      }
      .avatar {
        width: 100%;
        height: 100%;
        border-radius: 9999px;
        object-fit: cover;
        background: #f4f4f5;
        background-position: center;
        background-size: cover;
      }
      .profile-info {
        flex-grow: 1;
      }
      .profile-name {
        font-size: 1.875rem;
        font-weight: 700;
        margin-bottom: 0.5rem;
        color: black;
      }
      .profile-bio {
        color: #4b5563;
        line-height: 1.5;
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 1rem;
        margin-bottom: 2rem;
      }
      .item {
        position: relative;
        height: 100%;
        border: none;
        padding: 1rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        min-height: 150px;
        transition: all 0.2s ease;
      }
      .item:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
      }
      .item.loading {
        animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
      }
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: .7; }
      }
      .social-link {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-decoration: none;
        color: inherit;
      }
      .platform-icon {
        font-size: 1.5rem;
        margin-bottom: 0.5rem;
      }
      .platform-name {
        font-weight: 600;
        margin: 0.5rem 0;
      }
      .username {
        font-size: 0.875rem;
        opacity: 0.8;
      }
      .follow-button {
        margin-top: 0.5rem;
        padding: 0.5rem 1rem;
        border-radius: 0.375rem;
        border: none;
        color: white;
        cursor: pointer;
        font-weight: 500;
        transition: opacity 0.2s ease;
      }
      .follow-button:hover {
        opacity: 0.9;
      }
      .embed-placeholder {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #6b7280;
        background-size: cover;
        background-position: center;
        border-radius: 0.5rem;
        min-height: 200px;
        cursor: pointer;
        text-decoration: none;
        transition: opacity 0.2s ease;
      }
      .embed-placeholder:hover {
        opacity: 0.9;
      }
      .item a {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        text-decoration: none;
        color: inherit;
      }
    `.replace(/\s+/g, ' ').trim();

    // Create the background HTML based on type
    const backgroundHTML = bgType === 'gif' && bgGif ? `
      <div class="background-container">
        ${bgGif}
      </div>
    ` : '';

    // Helper function to get social icon class
    const getSocialIconClass = (platform: string) => {
      const icons: { [key: string]: string } = {
        'Twitter': 'fab fa-twitter',
        'Instagram': 'fab fa-instagram',
        'LinkedIn': 'fab fa-linkedin',
        'GitHub': 'fab fa-github',
        'YouTube': 'fab fa-youtube',
        'Dribbble': 'fab fa-dribbble',
        'Figma': 'fab fa-figma'
      };
      return icons[platform] || 'fas fa-link';
    };

    // Generate minimal HTML for each item
    const itemsHTML = items.map(item => {
      let content = '';
      const itemStyle = `
        background-color: ${item.bgColor};
        color: ${item.textColor};
        grid-column: span ${item.width};
        grid-row: span ${item.height};
        border-radius: ${item.shape === 'circle' ? '50%' : item.shape === 'rounded' ? '0.5rem' : '0'};
      `;

      switch (item.type) {
        case 'social':
          content = `
            <a href="${item.content.url}" class="social-link" target="_blank" rel="noopener">
              <i class="${getSocialIconClass(item.content.platform || '')} platform-icon"></i>
              <h3 class="platform-name">${item.content.platform}</h3>
              <p class="username">${item.content.username}</p>
              <button class="follow-button" style="background-color: ${item.textColor}">
                Follow
              </button>
            </a>
          `;
          break;
        case 'text':
          content = `<p style="color: ${item.textColor}">${item.content.text}</p>`;
          break;
        case 'image':
          content = `
            <a href="${item.content.imageUrl}" 
               class="embed-placeholder loading" 
               data-image="${item.content.imageUrl}"
               target="_blank" 
               rel="noopener">
            </a>
          `;
          break;
        case 'embed':
          const isYouTube = item.content.url?.includes('youtube.com') || item.content.url?.includes('youtu.be');
          const isTenor = item.content.url?.includes('tenor.com/view/');
          
          if (isYouTube) {
            const videoId = item.content.url?.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i)?.[1];
            const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&enablejsapi=1`;
            content = `
              <iframe
                src="${embedUrl}"
                class="w-full h-full rounded-lg"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
              ></iframe>
            `;
          } else if (isTenor) {
            const tenorId = getTenorId(item.content.url || '');
            if (tenorId) {
              content = `
                <div class="tenor-gif-embed w-full h-full" data-postid="${tenorId}" data-share-method="host">
                  <iframe 
                    src="https://tenor.com/embed/${tenorId}?autoplay=1"
                    class="w-full h-full rounded-lg"
                    frameborder="0"
                    allowfullscreen
                  ></iframe>
                </div>
              `;
            }
          } else {
            content = `
              <a href="${item.content.url}" 
                 class="embed-placeholder loading" 
                 target="_blank" 
                 rel="noopener">
              </a>
            `;
          }
          break;
      }

      return `
        <div class="item" style="${itemStyle}">
          ${content}
        </div>
      `;
    }).join('');

    // Update the script part to handle the new structure
    const scriptContent = `
      window.addEventListener('load', () => {
        const loadImage = (url, element) => {
          if (!url) return;
          const img = new Image();
          img.onload = () => {
            element.style.backgroundImage = \`url(\${url})\`;
            element.classList.remove('loading');
          };
          img.src = url;
        };

        // Load avatar
        const avatar = document.querySelector('.avatar');
        loadImage(avatar.dataset.image, avatar);

        // Load image content
        document.querySelectorAll('.embed-placeholder[data-image]').forEach(placeholder => {
          loadImage(placeholder.dataset.image, placeholder);
        });

        // Load YouTube thumbnails
        document.querySelectorAll('.embed-placeholder[data-youtube="true"]').forEach(placeholder => {
          const videoId = placeholder.href.match(/(?:youtube\\.com\\/(?:[^\\/]+\\/.+\\/|(?:v|e(?:mbed)?)\\/|.*[?&]v=)|youtu\\.be\\/)([^"&?\\/ ]{11})/i)?.[1];
          if (videoId) {
            loadImage(\`https://img.youtube.com/vi/\${videoId}/maxresdefault.jpg\`, placeholder);
          }
        });
      });

      // Initialize YouTube API
      var tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      var firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      var players = [];
      
      function onYouTubeIframeAPIReady() {
        document.querySelectorAll('iframe[src*="youtube.com"]').forEach((iframe, index) => {
          players[index] = new YT.Player(iframe, {
            events: {
              'onReady': function(event) {
                event.target.mute();
                event.target.playVideo();
              }
            }
          });
        });
      }
    `;

    // Complete HTML document with background support
    const html = `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${name}'s Space</title>
        <style>${minimalStyles}</style>
        <script type="text/javascript" async src="https://tenor.com/embed.js"></script>
      </head>
      <body>
        ${backgroundHTML}
        <div class="container">
          <div class="profile-header">
            <div class="avatar-container">
              <div class="avatar loading" data-image="${profileImage}"></div>
            </div>
            <div class="profile-info">
              <h1 class="profile-name">${name}</h1>
              <p class="profile-bio">${bio}</p>
            </div>
          </div>
          <div class="grid">
            ${itemsHTML}
          </div>
        </div>
        <script>
          ${scriptContent}
          // Add background image loading for GIF preview
          ${bgType === 'image' ? `
            window.addEventListener('load', () => {
              const img = new Image();
              img.onload = () => {
                document.body.style.backgroundImage = 'url("${bgImage}")';
              };
              img.src = '${bgImage}';
            });
          ` : ''}
        </script>
      </body>
      </html>`;

    // Instead of creating and downloading blob, return the HTML string
    return html;
  };

  const handleShareSpace = async () => {
    // Generate HTML first
    const html = generateStaticHTML();
    
    // Upload the HTML content
    try {
      // Convert HTML string to File object
      const htmlBlob = new Blob([html], { type: 'text/html' });
      const htmlFile = new File([htmlBlob], 'space.html', { type: 'text/html' });
      const result = await uploadHtmlFile(htmlFile);
      console.log('Upload result:', result);
    } catch (error) {
      console.error('Error uploading HTML:', error);
    }
  };

  return (
    <div style={getBackgroundStyle()} className="min-h-screen p-8">
      {bgType === 'gif' && bgGif && (
        <div 
          dangerouslySetInnerHTML={{ __html: bgGif }} 
          className="absolute inset-0 w-full h-full overflow-hidden"
          style={{
            zIndex: 0,
           ['& div' as any]: {
              width: '100% !important',
              height: '100% !important'
            }
          }}
        />
      )}
      <div className="relative z-10 max-w-4xl mx-auto bg-white rounded-lg shadow-xl p-8">
        <div className="flex items-center gap-8 mb-8">
          <div className="relative w-32 h-32">
            <img
              src={profileImage}
              alt="Profile picture"
              className="w-full h-full rounded-full object-cover"
            />
            <Button
              size="icon"
              variant="ghost"
              className="absolute bottom-0 right-0 bg-white rounded-full"
              onClick={() => setEditingItem({ id: 'profile', type: 'image', content: { imageUrl: profileImage }, icon: <FileText className="h-6 w-6" />, bgColor: '#F0F0F0', textColor: '#000000', width: 1, height: 1, shape: 'circle' })}
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-grow">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-3xl font-bold mb-2 bg-white"
              style={inputStyles}
            />
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="text-gray-600 bg-white"
              style={textareaStyles}
              rows={2}
            />
          </div>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="items">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="grid grid-cols-4 gap-4 mb-8"
              >
                {items.map((item, index) => (
                  <Draggable key={item.id} draggableId={item.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={{
                          ...provided.draggableProps.style,
                          gridColumn: `span ${item.width}`,
                          gridRow: `span ${item.height}`,
                        }}
                      >
                        <Card 
                          style={{ backgroundColor: item.bgColor }} 
                          className={`relative h-full border-0 ${
                            item.shape === 'square' ? '' :
                            item.shape === 'rounded' ? 'rounded-lg' : 'rounded-full'
                          }`}
                        >
                          <CardContent className="p-4 flex flex-col items-center justify-center h-full">
                            {renderItemContent(item)}
                            <div className="absolute top-1 right-1 flex">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="mr-1"
                                onClick={() => handleEditItem(item)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleDeleteItem(item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        <Card className="bg-gray-100 flex items-center justify-center cursor-pointer mb-8 border-0" onClick={handleAddItem}>
          <CardContent className="p-4 flex flex-col items-center">
            <Plus className="h-8 w-8 text-gray-400" />
            <p className="mt-2 text-gray-600">Add new item</p>
          </CardContent>
        </Card>

        <div className="flex justify-between items-center mb-4">
          <Button onClick={() => setShowBgEditor(true)}>
            Edit Background
          </Button>
          <div className="flex gap-2">
            {/* {!connected ? (
              <>
                <Button 
                  className="bg-gray-400 cursor-not-allowed text-white" 
                  disabled
                >
                  <FileText className="mr-2 h-4 w-4" /> Share This Space
                </Button>
                <ConnectButton/>
              </>
            ) : ( */}
              <Button 
                className="bg-blue-500 hover:bg-blue-600 text-white" 
                onClick={handleShareSpace}
              >
                <FileText className="mr-2 h-4 w-4" /> Share This Space
              </Button>
            
          </div>
        </div>

        <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
          <DialogContent className="max-w-3xl bg-white" style={dialogContentStyles}>
            <DialogHeader>
              <DialogTitle>{editingItem?.id === 'profile' ? 'Edit Profile Picture' : 'Edit Bento Item'}</DialogTitle>
            </DialogHeader>
            {editingItem && (
              <div className="grid gap-4 py-4">
                {editingItem.id === 'profile' ? (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="profileImage" className="text-right">
                      Profile Image URL
                    </Label>
                    <Input
                      id="profileImage"
                      value={profileImage}
                      className="col-span-3 bg-white"
                      style={inputStyles}
                      onChange={(e) => setProfileImage(e.target.value)}
                    />
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="type" className="text-right">
                        Type
                      </Label>
                      <Select
                        value={editingItem.type}
                        onValueChange={(value: 'social' | 'image' | 'embed' | 'text') => setEditingItem({ ...editingItem, type: value })}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select a type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="social">Social</SelectItem>
                          <SelectItem value="image">Image</SelectItem>
                          <SelectItem value="embed">Embed</SelectItem>
                          <SelectItem value="text">Text</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {editingItem.type === 'social' && (
                      <>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="platform" className="text-right">
                            Platform
                          </Label>
                          <Select
                            value={editingItem.content.platform}
                            onValueChange={(value) => {
                              const platform = socialPlatforms.find(p => p.name === value)
                              setEditingItem({ 
                                ...editingItem, 
                                content: { ...editingItem.content, platform: value },
                                icon: platform ? platform.icon : <FileText className="h-6 w-6" />
                              })
                            }}
                          >
                            <SelectTrigger className="col-span-3">
                              <SelectValue placeholder="Select a platform" />
                            </SelectTrigger>
                            <SelectContent>
                              {socialPlatforms.map((platform) => (
                                <SelectItem key={platform.name} value={platform.name}>
                                  {platform.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="username" className="text-right">
                            Username
                          </Label>
                          <Input
                            id="username"
                            value={editingItem.content.username || ''}
                            className="col-span-3 bg-white"
                            style={inputStyles}
                            onChange={(e) => setEditingItem({ ...editingItem, content: { ...editingItem.content, username: e.target.value } })}
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="url" className="text-right">
                            URL
                          </Label>
                          <Input
                            id="url"
                            value={editingItem.content.url || ''}
                            className="col-span-3 bg-white"
                            style={inputStyles}
                            onChange={(e) => setEditingItem({ ...editingItem, content: { ...editingItem.content, url: e.target.value } })}
                          />
                        </div>
                      </>
                    )}
                    {editingItem.type === 'image' && (
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="imageUrl" className="text-right">
                          Image URL
                        </Label>
                        <Input
                          id="imageUrl"
                          value={editingItem.content.imageUrl || ''}
                          className="col-span-3 bg-white"
                          style={inputStyles}
                          onChange={(e) => setEditingItem({ ...editingItem, content: { ...editingItem.content, imageUrl: e.target.value } })}
                        />
                      </div>
                    )}
                    {editingItem.type === 'embed' && (
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="embedUrl" className="text-right">
                          Embed URL
                        </Label>
                        <Input
                          id="embedUrl"
                          value={editingItem.content.url || ''}
                          className="col-span-3 bg-white"
                          style={inputStyles}
                          onChange={(e) => setEditingItem({ ...editingItem, content: { ...editingItem.content, url: e.target.value } })}
                        />
                      </div>
                    )}
                    {editingItem.type === 'text' && (
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="text" className="text-right">
                          Text
                        </Label>
                        <Textarea
                          id="text"
                          value={editingItem.content.text || ''}
                          className="col-span-3 bg-white"
                          style={textareaStyles}
                          onChange={(e) => setEditingItem({ ...editingItem, content: { ...editingItem.content, text: e.target.value } })}
                        />
                      </div>
                    )}
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="bgColor" className="text-right">
                        Background Color
                      </Label>
                      <Input
                        id="bgColor"
                        type="color"
                        value={editingItem.bgColor}
                        className="col-span-3"
                        onChange={(e) => setEditingItem({ ...editingItem, bgColor: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="textColor" className="text-right">
                        Text Color
                      </Label>
                      <Input
                        id="textColor"
                        type="color"
                        value={editingItem.textColor}
                        className="col-span-3"
                        onChange={(e) => setEditingItem({ ...editingItem, textColor: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="shape" className="text-right">
                        Shape
                      </Label>
                      <Select
                        value={editingItem.shape}
                        onValueChange={(value: 'square' | 'rounded' | 'circle') => setEditingItem({ ...editingItem, shape: value })}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select a shape" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="square">Square</SelectItem>
                          <SelectItem value="rounded">Rounded</SelectItem>
                          <SelectItem value="circle">Circle</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="width" className="text-right">
                        Width
                      </Label>
                      <Slider
                        id="width"
                        min={1}
                        max={4}
                        step={1}
                        value={[editingItem.width]}
                        onValueChange={(value) => setEditingItem({ ...editingItem, width: value[0] })}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="height" className="text-right">
                        Height
                      </Label>
                      <Slider
                        id="height"
                        min={1}
                        max={4}
                        step={1}
                        value={[editingItem.height]}
                        onValueChange={(value) => setEditingItem({ ...editingItem, height: value[0] })}
                        className="col-span-3"
                      />
                    </div>
                  </>
                )}
              </div>
            )}
            <div className="flex justify-between">
              {editingItem?.id !== 'profile' && (
                <Button variant="destructive" onClick={() => handleDeleteItem(editingItem!.id)}>
                  Delete
                </Button>
              )}
              <Button onClick={() => {
                if (editingItem?.id === 'profile') {
                  setProfileImage(editingItem.content.imageUrl || '/placeholder.svg')
                } else {
                  handleSaveItem(editingItem!)
                }
                setEditingItem(null)
              }}>
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showBgEditor} onOpenChange={setShowBgEditor}>
          <DialogContent className="max-w-3xl bg-white" style={dialogContentStyles}>
            <DialogHeader>
              <DialogTitle>Edit Background</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue={bgType} onValueChange={(value) => setBgType(value as 'color' | 'image' | 'gif')}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="color">Color</TabsTrigger>
                <TabsTrigger value="image">Image</TabsTrigger>
                <TabsTrigger value="gif">GIF</TabsTrigger>
              </TabsList>
              <TabsContent value="color">
                <div className="flex flex-col items-center gap-4">
                  <HexColorPicker color={bgColor} onChange={setBgColor} />
                  <Input
                    type="text"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-full bg-white"
                    style={inputStyles}
                  />
                </div>
              </TabsContent>
              <TabsContent value="image">
                <div className="flex flex-col gap-4">
                  <Label htmlFor="bgImage">Background Image URL</Label>
                  <Input
                    id="bgImage"
                    value={bgImage}
                    onChange={(e) => setBgImage(e.target.value)}
                    placeholder="Enter image URL"
                    className="bg-white"
                    style={inputStyles}
                  />
                </div>
              </TabsContent>
              <TabsContent value="gif">
                <div className="flex flex-col gap-4">
                  <Label htmlFor="bgGif">GIF Embed Code</Label>
                  <Textarea
                    id="bgGif"
                    value={bgGif}
                    onChange={(e) => setBgGif(e.target.value)}
                    placeholder="Enter GIF embed code"
                    rows={4}
                    className="bg-white"
                    style={textareaStyles}
                  />
                </div>
              </TabsContent>
            </Tabs>
            <Button onClick={() => setShowBgEditor(false)}>Save Changes</Button>
          </DialogContent>
        </Dialog>

        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-3xl bg-white" style={dialogContentStyles}>
            <DialogHeader>
              <DialogTitle>Profile Preview</DialogTitle>
            </DialogHeader>
            <div style={getBackgroundStyle()} className="p-8 rounded-lg relative">
              {bgType === 'gif' && bgGif && (
                <div 
                  dangerouslySetInnerHTML={{ __html: bgGif }} 
                  className="absolute inset-0 w-full h-full overflow-hidden"
                  style={{
                    zIndex: 0,
                    ['& div' as any]: { // This targets Tenor's container
                      width: '100% !important',
                      height: '100% !important'
                    }
                  }}
                />
              )}
              <div className="bg-white rounded-lg shadow-xl p-8">
                <div className="flex items-center gap-8 mb-8">
                  <div className="relative w-32 h-32">
                    <img
                      src={profileImage}
                      alt="Profile picture"
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{name}</h1>
                    <p className="text-gray-600">{bio}</p>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        gridColumn: `span ${item.width}`,
                        gridRow: `span ${item.height}`,
                      }}
                    >
                      <Card 
                        style={{ backgroundColor: item.bgColor }} 
                        className={`h-full ${
                          item.shape === 'square' ? '' :
                          item.shape === 'rounded' ? 'rounded-lg' : 'rounded-full'
                        }`}
                      >
                        <CardContent className="p-4 flex flex-col items-center justify-center h-full">
                          {renderItemContent(item)}
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}