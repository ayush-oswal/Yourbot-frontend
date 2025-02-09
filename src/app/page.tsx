'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { MessageSquare, Zap, Shield, Sparkles, ChefHat, Bot, Github, ArrowRight } from 'lucide-react'

export default function LandingPage() {
  const featuresRef = useRef<HTMLDivElement>(null)

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-white text-blue-900 font-light overflow-hidden">
      {/* Dotted background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
  <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="dot-pattern" width="20" height="20" patternUnits="userSpaceOnUse">
        <circle cx="1" cy="1" r="1" fill="#3B82F6" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#dot-pattern)" />
  </svg>
</div>

      {/* Content */}
      <div className="relative z-10">
        <Header scrollToFeatures={scrollToFeatures} />
        <Hero />
        <Features ref={featuresRef} />
        <Footer />
      </div>
    </div>
  )
}

function Header({ scrollToFeatures }: { scrollToFeatures: () => void }) {
  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 bg-white bg-opacity-70 backdrop-blur-md"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4 py-6 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="40" height="40" rx="8" fill="#3B82F6"/>
            <path d="M12 20C12 15.5817 15.5817 12 20 12C24.4183 12 28 15.5817 28 20C28 24.4183 24.4183 28 20 28" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <path d="M20 28C17.7909 28 16 26.2091 16 24C16 21.7909 17.7909 20 20 20C22.2091 20 24 21.7909 24 24C24 26.2091 22.2091 28 20 28Z" fill="white"/>
          </svg>
          <h1 className="text-2xl font-semibold">Yourbot</h1>
        </Link>
        <nav>
          <ul className="flex space-x-6">
            <motion.li
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              <button onClick={scrollToFeatures} className="hover:text-blue-600 transition-colors">Features</button>
            </motion.li>
            <motion.li
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
            >
              <Link href="#pricing" className="hover:text-blue-600 transition-colors">Pricing</Link>
            </motion.li>
            <motion.li
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.3 }}
            >
              <Link href="#contact" className="hover:text-blue-600 transition-colors">Contact</Link>
            </motion.li>
          </ul>
        </nav>
      </div>
    </motion.header>
  )
}

function Hero() {
  const [isHovered, setIsHovered] = useState(false)
  const words = [
    { text: "Create", color: "text-black" },
    { text: "Custom", color: "text-black" },
    { text: "AI", color: "text-blue-600" },
    { text: "Chatbots", color: "text-blue-600" },
    { text: "in", color: "text-black" },
    { text: "Minutes", color: "text-black" },
    { text: "with", color: "text-black" },
    { text: "Yourbot", color: "text-blue-600" }
  ];

  return (
    <section className="container mx-auto px-4 py-20 text-center">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 pt-16">
          {words.map((word, index) => (
            <motion.span
              key={index}
              className={`text-4xl md:text-6xl font-bold ${word.color} inline-block mr-2`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
            >
              {word.text}
            </motion.span>
          ))}
        </div>
        <motion.p
          className="text-xl text-black mb-8 bg-white border-2 border-blue-600 p-1 rounded-md inline-block"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: words.length * 0.2 }}
        >
          Empower your business with intelligent conversations
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: words.length * 0.2 + 0.2 }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              onClick={() => window.location.href = '/dashboard'} 
              className="bg-blue-600 text-white hover:bg-blue-700 text-lg px-8 py-6 relative overflow-hidden"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <motion.div
                className="absolute inset-0 bg-blue-500"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: isHovered ? 1 : 0, opacity: isHovered ? 1 : 0 }}
                transition={{ duration: 0.3 }}
              />
              <motion.div className="relative z-10 flex items-center justify-center">
                <ChefHat className="w-6 h-6 mr-2" />
                Cook Yourbot Now!
              </motion.div>
            </Button>
          </motion.div>
        </motion.div>
      </div>
      <ChatSkeleton />
    </section>
  )
}

function ChatSkeleton() {
  const [visibleMessages, setVisibleMessages] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setVisibleMessages(prev => (prev < 5 ? prev + 1 : prev))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const messages = [
    { sender: 'user', content: 'Hello, I need help with my order.' },
    { sender: 'bot', content: 'Of course! I\'d be happy to help. Can you please provide your order number?' },
    { sender: 'user', content: 'Sure, it\'s ORDER123456.' },
    { sender: 'bot', content: 'Thank you. I\'ve found your order. What specific information do you need?' },
    { sender: 'user', content: 'I want to know the estimated delivery date.' }
  ]

  return (
    <motion.div
      className="mt-12 max-w-2xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
    >
      <div className="bg-blue-600 text-white p-4 flex items-center">
        <svg width="24" height="24" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
          <rect width="40" height="40" rx="8" fill="white"/>
          <path d="M12 20C12 15.5817 15.5817 12 20 12C24.4183 12 28 15.5817 28 20C28 24.4183 24.4183 28 20 28" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"/>
          <path d="M20 28C17.7909 28 16 26.2091 16 24C16 21.7909 17.7909 20 20 20C22.2091 20 24 21.7909 24 24C24 26.2091 22.2091 28 20 28Z" fill="#3B82F6"/>
        </svg>
        <div className="h-4 bg-white bg-opacity-50 rounded w-24"></div>
      </div>
      <div className="p-4 space-y-4">
        <AnimatePresence>
          {messages.slice(0, visibleMessages).map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className={`flex ${message.sender === 'bot' ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`rounded-lg p-3 w-[80%] ${
                  message.sender === 'bot' ? 'bg-blue-100' : 'bg-gray-100'
                }`}
              >
                <div className="h-4 bg-white bg-opacity-50 rounded w-full"></div>
                {message.content.length > 50 && (
                  <div className="h-4 bg-white bg-opacity-50 rounded w-3/4 mt-2"></div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

const Features = React.forwardRef<HTMLDivElement>((props, ref) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const features = [
    { 
      icon: <MessageSquare className="w-8 h-8 text-blue-600" />, 
      title: 'Custom Conversations', 
      description: 'Craft intelligent, natural conversations tailored to your business needs. Enhance customer satisfaction.'
    },
    { 
      icon: <Zap className="w-8 h-8 text-blue-600" />, 
      title: 'Lightning Fast', 
      description: 'Provide near-instant replies powered by cutting-edge AI. Keep your users engaged with quick responses.'
    },
    { 
      icon: <Shield className="w-8 h-8 text-blue-600" />, 
      title: 'Secure & Private', 
      description: 'Protect sensitive data with enterprise-grade encryption and compliance. Your users’ privacy is our top priority.'
    },
    { 
      icon: <Sparkles className="w-8 h-8 text-blue-600" />, 
      title: 'AI-Powered Insights', 
      description: 'Gain valuable insights from customer interactions. Our advanced analytics help you understand user behavior.'
    },
  ]

  return (
    <section id="features" className="bg-white py-20" ref={ref}>
      <div className="container mx-auto px-4">
        <motion.h3
          className="text-3xl font-thin text-center mb-12 text-black"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Why Choose Yourbot?
        </motion.h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-blue-50 p-6 rounded-lg text-center relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.05, boxShadow: "0px 5px 15px rgba(0,0,0,0.1)" }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <motion.div 
                className="mb-4 flex justify-center"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                {feature.icon}
              </motion.div>
              <h4 className="text-xl font-semibold mb-2">{feature.title}</h4>
              {hoveredIndex === index && (
                <motion.div
                  className="absolute inset-x-0 bottom-0 p-4 bg-white rounded-lg shadow-md text-blue-600 text-sm mt-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.3 }}
                >
                  {feature.description}
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
})

Features.displayName = 'Features'


function Footer() {
  return (
    <footer className="bg-white py-4 text-center text-sm text-gray-500">
      <p className="mb-2">&copy; 2024 Yourbot. All rights reserved.</p>
      <div className="flex items-center justify-center">
        <span className="mr-2">Made with ❤️ Ayush </span>
        <a href="https://github.com/ayush-oswal/Yourbot" target="_blank" rel="noopener noreferrer">
          <Github className="w-5 h-5 text-gray-500 hover:text-blue-600 transition-colors" />
        </a>
      </div>
    </footer>
  )
}