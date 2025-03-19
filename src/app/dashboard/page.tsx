'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Plus, Eye, EyeOff } from 'lucide-react'
import { SignOutButton } from '@/components/auth-button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"
import { signOut } from 'next-auth/react';
import { redirect } from 'next/navigation';


interface Chatbot {
  id: string
  name: string
  description: string
  userId: string  
  user: any
  queries: any
}

interface UserData {
  id: string
  email: string
  username: string
  apiKey: string
  tokens: number
  createdAt: string
  chatbots: Chatbot[]
}

export default function DashboardPage() {
  const [isApiKeyVisible, setIsApiKeyVisible] = useState(false)
  const [userData, setUserData] = useState<UserData | null>()
  const [mounted, setMounted] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    const refreshUserData = async () => {
      try {

        const token = await fetch('/api/syncauth').then(res => res.json());
        console.log(token);
        if (!token) {
          signOut({ callbackUrl: '/signin' })
        }

        localStorage.setItem('authToken', token);

        const UserData = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        }).then(res => res.json());
  
        setUserData(UserData);
      } catch (error) {
        console.error("Error refreshing user data:", error);
      }
    };
    refreshUserData().then(() => setMounted(true));
  }, [refreshCount])

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-blue-50 text-blue-900 font-light">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Welcome username={userData?.username || ''} />
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <ChatbotList chatbots={userData?.chatbots || []} onEdit={() => setRefreshCount(prev => prev + 1)} />
          <UserInfo tokens={userData?.tokens || 0} apiKey={userData?.apiKey || '' } isApiKeyVisible={isApiKeyVisible} setIsApiKeyVisible={setIsApiKeyVisible} />
        </div>
        <CreateChatbotButton onCreate={() => setRefreshCount(prev => prev + 1)} />
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

function Welcome({ username }: { username: string }) {
  return (
    <motion.div
      className="text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-3xl font-semibold mb-4">Welcome, {username}!</h2>
      <p className="text-xl text-blue-700">Manage your chatbots and account information below.</p>
    </motion.div>
  )
}

function ChatbotList({ chatbots, onEdit }: { chatbots: Chatbot[], onEdit: () => void }) {
  const [editOpen, setEditOpen] = useState(false);
  const [selectedChatbot, setSelectedChatbot] = useState<Chatbot | null>(null);

  return (
    <motion.div
      className="bg-white rounded-lg shadow-md p-6 max-h-96 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-blue-600 [&::-webkit-scrollbar-thumb]:rounded-full"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-2xl font-semibold mb-4">Your Chatbots</h3>
      {chatbots.length === 0 ? (
        <p>You haven't created any chatbots yet.</p>
      ) : (
        <ul className="space-y-4">
          {chatbots.map((chatbot) => (
            <motion.li
              key={chatbot.id}
              className="bg-blue-50 rounded-lg p-4"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div 
                className="flex justify-between items-start cursor-pointer"
                onClick={() => window.location.href = `/chatbot/${chatbot.id}`}
              >
                <div>
                  <h4 className="text-lg font-semibold mb-2">{chatbot.name}</h4>
                  <p className="text-sm text-blue-700">{chatbot.description}</p>
                </div>
                <Button
                  variant="ghost"
                  className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedChatbot(chatbot);
                    setEditOpen(true);
                  }}
                >
                  Edit
                </Button>
              </div>
            </motion.li>
          ))}
        </ul>
      )}
      <EditChatbotDialog
        open={editOpen}
        setOpen={setEditOpen}
        chatbot={selectedChatbot}
        onEdit={onEdit}
      />
    </motion.div>
  );
}

function UserInfo({ tokens, apiKey, isApiKeyVisible, setIsApiKeyVisible }: { tokens: number, apiKey: string, isApiKeyVisible: boolean, setIsApiKeyVisible: (visible: boolean) => void }) {
  return (
    <motion.div
      className="bg-white rounded-lg shadow-md p-6"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-2xl font-semibold mb-4">Account Information</h3>
      <div className="space-y-4">
        <div>
          <p className="text-lg font-semibold">Tokens Left</p>
          <p className="text-3xl text-blue-600">{tokens.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-lg font-semibold">API Key</p>
          <div className="flex items-center space-x-2">
            <input
              type={isApiKeyVisible ? "text" : "password"}
              value={apiKey}
              readOnly
              className="bg-blue-50 border border-blue-200 rounded px-3 py-2 w-full font-mono text-sm"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsApiKeyVisible(!isApiKeyVisible)}
              className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
            >
              {isApiKeyVisible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function CreateChatbotButton({ onCreate }: { onCreate: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false); 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); 
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chatbot/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('authToken')}` },
        body: JSON.stringify({ name, description }),
      });

      if (response.ok) {
        setOpen(false); // Close modal
        setName('');    // Reset form
        setDescription('');
        onCreate();
      }
    } catch (error) {
      console.error('Error creating chatbot:', error);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <motion.div
      className="flex justify-center mt-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            className="bg-blue-600 text-white hover:bg-blue-700 text-lg px-8 py-4"
            disabled={loading} // Disable button while loading
            style={loading ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
          >
            <Plus className="w-6 h-6 mr-2" />
            Create New Chatbot
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Chatbot</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter chatbot name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell the chatbot what it's meant to do..."
                maxLength={1000}
                required
                className="resize-none"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg py-3"
              disabled={loading} // Disable button while loading
              style={loading ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
            >
              {loading ? 'Creating...' : 'Create Chatbot'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

function EditChatbotDialog({ 
  open, 
  setOpen, 
  chatbot,
  onEdit
}: { 
  open: boolean; 
  setOpen: (open: boolean) => void; 
  chatbot: Chatbot | null;
  onEdit: () => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false); // Loading state

  useEffect(() => {
    if (chatbot) {
      setName(chatbot.name);
      setDescription(chatbot.description);
    }
  }, [chatbot]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); // Start loading
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chatbot/edit`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ chatbot_id: chatbot?.id, name, description }),
      });

      if (response.ok) {
        setOpen(false);
        onEdit();
      }
    } catch (error) {
      console.error('Error updating chatbot:', error);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px] h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Edit Chatbot</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="edit-name" className="text-lg">Name</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter chatbot name"
              required
              className="text-lg p-3"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-description" className="text-lg">Description</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell the chatbot what it's meant to do..."
              maxLength={1000}
              required
              className="min-h-[200px] resize-y text-lg p-3"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg py-6"
            disabled={loading} // Disable button while loading
            style={loading ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
          >
            {loading ? 'Updating...' : 'Update Chatbot'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}