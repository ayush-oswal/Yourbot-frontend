'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { SignOutButton } from '@/components/auth-button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { signOut } from 'next-auth/react'
import { redirect } from 'next/navigation'

interface Query {
  id: string;
  query: string;
  chatbotId: string;
  createdAt: string;
}

interface ChatbotData {
  id: string;
  name: string;
  description: string;
}

export default function AnalyzePage() {
  const params = useParams();
  const id = params.id as string;
  const [chatbotData, setChatbotData] = useState<ChatbotData | null>(null);
  const [queries, setQueries] = useState<Query[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [mounted, setMounted] = useState(false);

  const fetchChatbotData = async () => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chatbot/${id}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
    }).then(res => res.json());
    setChatbotData(response);
  };

  const fetchQueries = async (page: number) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chatbot/${id}/queries?page_number=${page}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
    }).then(res => res.json());
    
    setQueries(response.queries);
    setTotalCount(response.total_count);
  };

  const syncAuth = async () => {
    try {
      const token = await fetch('/api/syncauth').then(res => res.json());
      if (!token) {
        signOut({ callbackUrl: '/' });
        redirect('/signin');
      }
      localStorage.setItem('authToken', token);
    } catch (error) {
      console.error('Error syncing auth:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        await syncAuth();
        await fetchChatbotData();
      }
    };
    
    fetchData();
    setMounted(true);
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchQueries(currentPage);
    }
  }, [id, currentPage]);

  if (!mounted) return null;

  const totalPages = Math.ceil(totalCount / 15);

  return (
    <div className="min-h-screen bg-blue-50 text-blue-900 font-light">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-4">
          <Button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            variant="outline"
            className="text-blue-600"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <Button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            variant="outline"
            className="text-blue-600"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Queries</h2>
          <div className="space-y-4">
            {queries.map((query) => (
              <div key={query.id} className="border-b border-blue-100 pb-4">
                <p className="text-lg">{query.query}</p>
                <p className="text-sm text-blue-600">
                  {new Date(query.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center mt-6">
            <Button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              variant="outline"
              className="text-blue-600"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <Button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              variant="outline"
              className="text-blue-600"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
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
          <h1 className="text-2xl font-semibold">Yourbot</h1>
        </Link>
        <SignOutButton />
      </div>
    </motion.header>
  );
}
