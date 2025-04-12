'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, MessageSquare, X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Message {
    role: 'user' | 'assistant'
    content: string
  }

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [currentMessage, setCurrentMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const chatboxRef = useRef<HTMLDivElement | null>(null)
  
  useEffect(() => {
    if (chatboxRef.current && isOpen) {
      chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight
    }
  }, [messages, isOpen])
  
  const toggleChat = () => {
    setIsOpen(!isOpen)
  }
  
  const handleSendMessage = async () => {
    if (currentMessage.trim() && currentMessage.length <= 400 && !isLoading) {
      const userMessage: Message = { role: 'user', content: currentMessage }
      setMessages(prev => [...prev, userMessage])
      setCurrentMessage('')
      setIsLoading(true)
      
      const assistantMessage: Message = { role: 'assistant', content: '' }
      setMessages(prev => [...prev, assistantMessage])
      
      try {
        const previousMessages = messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_YOURBOT_API_URL}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chatbot_id: `${process.env.NEXT_PUBLIC_YOURBOT_CHATBOT_ID}`,
            query: currentMessage,
            api_key: `${process.env.NEXT_PUBLIC_YOURBOT_API_KEY}`,
            previous_messages: previousMessages
          })
        })
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const reader = response.body?.getReader()
        if (!reader) {
          throw new Error('Failed to get stream reader')
        }
        
        const decoder = new TextDecoder()
        let done = false
        
        while (!done) {
          const { value, done: doneReading } = await reader.read()
          done = doneReading
          
          if (value) {
            const chunk = decoder.decode(value, { stream: true })
            
            setMessages(prev => {
              const lastMessage = prev[prev.length - 1]
              if (lastMessage.role === 'assistant') {
                return [
                  ...prev.slice(0, -1),
                  { ...lastMessage, content: lastMessage.content + chunk }
                ]
              }
              return prev
            })
          }
        }
      } catch (error) {
        console.error('Error during streaming:', error)
        
        setMessages(prev => {
          const lastMessage = prev[prev.length - 1]
          if (lastMessage.role === 'assistant') {
            return [
              ...prev.slice(0, -1),
              { ...lastMessage, content: 'Error: Failed to get response. Please try again.' }
            ]
          }
          return prev
        })
      } finally {
        setIsLoading(false)
      }
    }
  }
  
  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat toggle button */}
      <motion.button
        onClick={toggleChat}
        className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg flex items-center justify-center"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="relative">
          <div className="flex items-center">
            <svg width="24" height="24" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={isOpen ? "hidden" : "block"}>
              <rect width="40" height="40" rx="8" fill="white"/>
              <path d="M12 20C12 15.5817 15.5817 12 20 12C24.4183 12 28 15.5817 28 20C28 24.4183 24.4183 28 20 28" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"/>
              <path d="M20 28C17.7909 28 16 26.2091 16 24C16 21.7909 17.7909 20 20 20C22.2091 20 24 21.7909 24 24C24 26.2091 22.2091 28 20 28Z" fill="#3B82F6"/>
            </svg>
            <span className={`ml-2 ${isOpen ? "hidden" : "block"}`}>Live Preview</span>
            <X className={`w-6 h-6 ${isOpen ? "block" : "hidden"}`} />
          </div>
        </div>
      </motion.button>
      
      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute bottom-16 right-0 w-80 md:w-96 bg-white rounded-lg shadow-xl overflow-hidden"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            {/* Chat header */}
            <div className="bg-blue-600 text-white p-4 flex items-center">
              <svg width="24" height="24" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
                <rect width="40" height="40" rx="8" fill="white"/>
                <path d="M12 20C12 15.5817 15.5817 12 20 12C24.4183 12 28 15.5817 28 20C28 24.4183 24.4183 28 20 28" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"/>
                <path d="M20 28C17.7909 28 16 26.2091 16 24C16 21.7909 17.7909 20 20 20C22.2091 20 24 21.7909 24 24C24 26.2091 22.2091 28 20 28Z" fill="#3B82F6"/>
              </svg>
              <h3 className="font-medium">Yourbot Assistant</h3>
            </div>
            
            {/* Chat messages */}
            <div 
              ref={chatboxRef}
              className="h-64 p-4 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-blue-600 [&::-webkit-scrollbar-thumb]:rounded-full"
            >
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 my-6">
                  <MessageSquare className="w-12 h-12 mx-auto mb-2 text-blue-600 opacity-50" />
                  <p>Ask me anything about Yourbot!</p>
                </div>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={index}
                    className={`mb-4 ${
                      message.role === 'user' ? 'text-right' : 'text-left'
                    }`}
                  >
                    <div
                      className={`inline-block p-2 rounded-lg max-w-[80%] ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-blue-900'
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))
              )}
              {isLoading && messages[messages.length - 1]?.content === '' && (
                <div className="flex items-center justify-center">
                  <div className="animate-bounce mx-1 h-2 w-2 rounded-full bg-blue-600"></div>
                  <div className="animate-bounce delay-75 mx-1 h-2 w-2 rounded-full bg-blue-600"></div>
                  <div className="animate-bounce delay-150 mx-1 h-2 w-2 rounded-full bg-blue-600"></div>
                </div>
              )}
            </div>
            
            {/* Chat input */}
            <div className="p-4 border-t">
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}