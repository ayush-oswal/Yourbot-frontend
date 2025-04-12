'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Upload, Send, BarChart2 } from 'lucide-react'
import { toast, Toaster } from 'react-hot-toast'
import { signOut } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Code } from 'lucide-react'
import { SignOutButton } from '@/components/auth-button'

interface ChatbotData {
  id: string
  name: string
  description: string
}

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function ChatbotPage() {
  const params = useParams()
  const id = params.id as string
  const [chatbotData, setChatbotData] = useState<ChatbotData | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [textInput, setTextInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const chatboxRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false);

  const fetchChatbotData = async (id: string) => {
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chatbot/${id}/`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
    }).then(res => res.json());

    setChatbotData(response);
  }

  const syncAuth = async () => {
    try {
        const token = await fetch('/api/syncauth').then(res => res.json());

        if (!token) {
          signOut({ callbackUrl: '/' })
          redirect('/signin')
        }

        localStorage.setItem('authToken', token);
    } catch (error) {
        console.error('Error syncing auth:', error)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        await syncAuth();
        await fetchChatbotData(id);
      }
    };
  
    fetchData();
    setMounted(true);
  }, [id]);

  
  useEffect(() => {
    if (chatboxRef.current) {
      chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight
    }
  }, [messages])
  
  if (!mounted) return null;


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && selectedFile.type === 'application/pdf' && selectedFile.size <= 3 * 1024 * 1024) {
      setFile(selectedFile)
    } else {
      toast.error('Please select a PDF file smaller than 3MB')
    }
  }

  const getPresignedUrl = async (type: 'file' | 'text') => {
    try {
      const url = type === 'file' ? `${process.env.NEXT_PUBLIC_API_URL}/file/` : `${process.env.NEXT_PUBLIC_API_URL}/text/`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to get presigned URL')
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting presigned URL:', error)
      throw error
    }
  }

  const uploadToS3 = async (url: string, data: File | string) => {
    try {
      const response = await fetch(url, {
        method: 'PUT',
        body: data,
        headers: data instanceof File ? {
            'Content-Type': 'application/pdf',
        } : {
          'Content-Type': 'text/plain',
        },
      })
      
      if (!response.ok) {
        throw new Error('Failed to upload to S3')
      }
      
      return true
    } catch (error) {
      console.error('Error uploading to S3:', error)
      throw error
    }
  }

  
  const notifyServer = async (key: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/process/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          key,
          chatbot_id: id,
        }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to notify server about upload')
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error notifying server:', error)
      throw error
    }
  }

  const handleSubmit = async (type: 'file' | 'text') => {
    setIsSubmitting(true)
    try {
      if (type === 'file' && file) {
        const { key, upload_url } = await getPresignedUrl('file')
        
        const response = await uploadToS3(upload_url, file)
        
        if(response) await notifyServer(key)
        
        toast.success('File uploaded successfully, you\'ll be notified when it\'s processed')
        setFile(null)
      } else if (type === 'text' && textInput.trim()) {
        const { key, upload_url } = await getPresignedUrl('text')
        
        const response = await uploadToS3(upload_url, textInput)
        
        if(response) await notifyServer(key)
        
        toast.success('Text added successfully, you\'ll be notified when it\'s processed')
        setTextInput('')
      }
    } catch (error) {
      console.error('Error in submission:', error)
      toast.error('An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-blue-50 text-blue-900 font-light">
      <Toaster />
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Add to Knowledge Base</h2>
            <p className="text-md font-bold text-gray-600 mb-4 text-center">For efficient retrieval, include nouns that describe who or what the content is about (e.g. people, companies, products, topics)</p>
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-xl font-semibold mb-2">Upload File</h3>
              <Input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="mb-4"
              />
              <Button
                onClick={() => handleSubmit('file')}
                disabled={!file || isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload PDF
              </Button>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-2">Add Text</h3>
              <Textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Enter text to add to the knowledge base..."
                className="mb-4"
                maxLength={1000}
              />
              <Button
                onClick={() => handleSubmit('text')}
                disabled={!textInput.trim() || isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Add Text
              </Button>
            </div>
          </div>
          <div>
          <div>
            {chatbotData ? (
              <ChatBox id={id} chatbotData={chatbotData} />
            ) : (
            <div className="flex h-screen items-center justify-center">
              <div className="animate-spin text-blue-600">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="40" height="40" rx="8" fill="#3B82F6"/>
                  <path d="M12 20C12 15.5817 15.5817 12 20 12C24.4183 12 28 15.5817 28 20C28 24.4183 24.4183 28 20 28" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M20 28C17.7909 28 16 26.2091 16 24C16 21.7909 17.7909 20 20 20C22.2091 20 24 21.7909 24 24C24 26.2091 22.2091 28 20 28Z" fill="white"/>
                </svg>
              </div>
            </div>
            )}
          </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function Header() {
    return (
      <motion.header
        className="bg-white bg-opacity-70 backdrop-blur-md shadow-md"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="40" height="40" rx="8" fill="#3B82F6"/>
              <path d="M12 20C12 15.5817 15.5817 12 20 12C24.4183 12 28 15.5817 28 20C28 24.4183 24.4183 28 20 28" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <path d="M20 28C17.7909 28 16 26.2091 16 24C16 21.7909 17.7909 20 20 20C22.2091 20 24 21.7909 24 24C24 26.2091 22.2091 28 20 28Z" fill="white"/>
            </svg>
            <h1 className="text-2xl font-semibold">Yourbot</h1>
          </Link>
          <SignOutButton />
        </div>
      </motion.header>
    )
  }

function ChatBox({ id, chatbotData }: { id: string, chatbotData: ChatbotData }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [currentMessage, setCurrentMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatboxRef = useRef<HTMLDivElement>(null);
    const [embedOpen, setEmbedOpen] = useState(false);
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  
    useEffect(() => {
      if (chatboxRef.current) {
        chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
      }
    }, [messages]);
  
    const handleSendMessage = async () => {
      if (currentMessage.trim() && currentMessage.length <= 400 && !isLoading) {
        const userMessage: Message = { role: 'user', content: currentMessage };
        setMessages(prev => [...prev, userMessage]);
        setCurrentMessage('');
        setIsLoading(true);
  
        const assistantMessage: Message = { role: 'assistant', content: '' };
        setMessages(prev => [...prev, assistantMessage]);
  
        try {
          const previousMessages = messages.map(msg => ({
            role: msg.role,
            content: msg.content
          }));

          const response = await fetch(`${backendUrl}/inference/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify({
              chatbot_id: id,
              query: currentMessage,
              previous_messages: previousMessages
            })
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
  
          const reader = response.body?.getReader();
          if (!reader) {
            throw new Error('Failed to get stream reader');
          }
  
          const decoder = new TextDecoder();
          let done = false;
  
          while (!done) {
            const { value, done: doneReading } = await reader.read();
            done = doneReading;
  
            if (value) {
              const chunk = decoder.decode(value, { stream: true });
              
              setMessages(prev => {
                const lastMessage = prev[prev.length - 1];
                if (lastMessage.role === 'assistant') {
                  return [
                    ...prev.slice(0, -1), 
                    { ...lastMessage, content: lastMessage.content + chunk }
                  ];
                }
                return prev;
              });
            }
          }
        } catch (error) {
          console.error('Error during streaming:', error);
          
          setMessages(prev => {
            const lastMessage = prev[prev.length - 1];
            if (lastMessage.role === 'assistant') {
              return [
                ...prev.slice(0, -1),
                { ...lastMessage, content: 'Error: Failed to get response. Please try again.' }
              ];
            }
            return prev;
          });
        } finally {
          setIsLoading(false);
        }
      }
    };
  
    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Chat with {chatbotData?.name}</h2>
          <div className="flex gap-2">
    <Button
      onClick={() => window.location.href = `/chatbot/${id}/analyze`}
      variant="outline"
      className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
    >
      <BarChart2 className="w-4 h-4 mr-2" />
      Analyze
    </Button>
    <Button
      onClick={() => setEmbedOpen(true)}
      variant="outline"
      className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
    >
      <Code className="w-4 h-4 mr-2" />
      Embed
    </Button>
    <Dialog open={embedOpen} onOpenChange={setEmbedOpen}>
  <DialogContent className="max-w-2xl">
    <DialogHeader>
      <DialogTitle>Embed Your Chatbot</DialogTitle>
    </DialogHeader>
    <div className="space-y-4">
      <p>To embed this chatbot in your website, use the following code:</p>
      <div className="bg-gray-100 p-4 rounded-md">
        <pre className="whitespace-pre-wrap text-sm">
{`// Initialize the chat with previous messages (optional)
const previousMessages = [
  { role: 'user', content: 'Your message here' },
  { role: 'assistant', content: 'Bot response here' }
];

// Make API call
fetch('${backendUrl}/inference/external/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    chatbot_id: '${id}',
    query: 'User message here',
    api_key: '[YOUR_API_KEY]',
    previous_messages: previousMessages
  })
})
.then(response => {
  // Handle streaming response
  const reader = response.body.getReader();
  // Process the stream...
});`}
        </pre>
      </div>
      <p className="text-sm text-gray-600">
        Note: The response is streamed, so you'll need to handle the response using a ReadableStream reader.
        Previous messages are optional but help maintain conversation context.
      </p>
    </div>
  </DialogContent>
</Dialog>
  </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div 
            ref={chatboxRef} 
            className="h-96 mb-4 bg-white rounded-lg shadow-md p-6 max-h-96 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-blue-600 [&::-webkit-scrollbar-thumb]:rounded-full"
          >
            {messages.map((message, index) => (
              <div
                key={index}
                className={`mb-4 ${
                  message.role === 'user' ? 'text-right' : 'text-left'
                }`}
              >
                <div
                  className={`inline-block p-2 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-blue-900'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.content === '' && (
              <div className="flex items-center justify-center">
                <div className="animate-bounce mx-1 h-2 w-2 rounded-full bg-blue-600"></div>
                <div className="animate-bounce delay-75 mx-1 h-2 w-2 rounded-full bg-blue-600"></div>
                <div className="animate-bounce delay-150 mx-1 h-2 w-2 rounded-full bg-blue-600"></div>
              </div>
            )}
          </div>
          <div className="flex">
            <Input
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              placeholder="Type your message..."
              maxLength={400}
              className="flex-grow mr-2"
              disabled={isLoading}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSendMessage();
                }
              }}
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={!currentMessage.trim() || isLoading} 
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }