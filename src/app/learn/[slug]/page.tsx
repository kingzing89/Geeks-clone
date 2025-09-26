// app/learn/[slug]/page.tsx
"use client";

import React, { useState, useEffect, use } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface LearnPageProps {
  params: Promise<{ slug: string }>;
}

interface DocData {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  content: string;
  // Add your other document fields here
}

export default function LearnPage({ params }: LearnPageProps) {
  const unwrappedParams = use(params);
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const [doc, setDoc] = useState<DocData | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentVerified, setPaymentVerified] = useState<boolean | null>(null);
  const [verificationMessage, setVerificationMessage] = useState('');

  useEffect(() => {
    async function initializePage() {
      try {
        // If there's a session_id, verify the payment first
        if (sessionId) {
          await verifyPayment(sessionId);
        }
        
        // Then load the document content
        await loadDocument();
      } catch (error) {
        console.error('Error initializing page:', error);
      } finally {
        setLoading(false);
      }
    }

    initializePage();
  }, [unwrappedParams.slug, sessionId]);

  const verifyPayment = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/payments/verify-session?session_id=${sessionId}`);
      const data = await response.json();

      if (data.success) {
        setPaymentVerified(true);
        setVerificationMessage('Payment successful! You now have access to this content.');
      } else {
        setPaymentVerified(false);
        setVerificationMessage('Payment verification failed. Please contact support.');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      setPaymentVerified(false);
      setVerificationMessage('Error verifying payment. Please try again.');
    }
  };

  const loadDocument = async () => {
    try {
      const response = await fetch(`/api/documentation/${unwrappedParams.slug}`);
      const result = await response.json();
      
      if (result.success) {
        setDoc(result.data);
      } else {
        throw new Error(result.error || 'Failed to load document');
      }
    } catch (error) {
      console.error('Failed to load document:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading your content...</h2>
          {sessionId && (
            <p className="text-gray-600">Verifying your payment and preparing your learning materials.</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Payment Success/Failure Banner */}
        {sessionId && paymentVerified !== null && (
          <div className={`mb-8 p-4 rounded-lg border ${
            paymentVerified 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center">
              {paymentVerified ? (
                <CheckCircle className="w-5 h-5 mr-3" />
              ) : (
                <XCircle className="w-5 h-5 mr-3" />
              )}
              <p className="font-medium">{verificationMessage}</p>
            </div>
          </div>
        )}

        {/* Document Content */}
        {doc ? (
          <div className="bg-white">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{doc.title}</h1>
              {doc.description && (
                <p className="text-lg text-gray-700 leading-relaxed">
                  {doc.description}
                </p>
              )}
            </div>

            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-lg mb-8">
              <h2 className="text-2xl font-bold mb-4">🎉 Welcome to Your Learning Journey!</h2>
              <p className="text-lg mb-4">
                You now have full access to this comprehensive learning material. Let's get started!
              </p>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="bg-white/10 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">📚 Comprehensive Content</h3>
                  <p>In-depth tutorials and examples</p>
                </div>
                <div className="bg-white/10 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">💻 Code Examples</h3>
                  <p>Practical, ready-to-use code snippets</p>
                </div>
                <div className="bg-white/10 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">🎯 Expert Tips</h3>
                  <p>Pro tips and best practices</p>
                </div>
              </div>
            </div>

            {/* Learning Content */}
            <div className="prose prose-lg max-w-none">
              <div className="bg-blue-50 border-l-4 border-blue-400 p-6 mb-8">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">Learning Objectives</h3>
                <p className="text-blue-700">
                  {doc.content}
                </p>
              </div>

              {/* Table of Contents */}
              <div className="bg-gray-50 p-6 rounded-lg mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">📖 Table of Contents</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Module 1: Fundamentals</h4>
                    <ul className="text-gray-600 space-y-1 text-sm">
                      <li>• Introduction and Setup</li>
                      <li>• Core Concepts</li>
                      <li>• Basic Examples</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Module 2: Advanced Topics</h4>
                    <ul className="text-gray-600 space-y-1 text-sm">
                      <li>• Advanced Patterns</li>
                      <li>• Best Practices</li>
                      <li>• Real-world Applications</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Start Learning Button */}
              <div className="text-center mb-8">
                <button className="bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold py-4 px-8 rounded-lg hover:from-green-600 hover:to-blue-600 transition-all transform hover:scale-105">
                  Begin Module 1 →
                </button>
              </div>

              {/* Support Section */}
              <div className="bg-gray-100 p-6 rounded-lg mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">📧 Email Support</h4>
                    <p className="text-gray-600">Get help via email within 24 hours</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">💬 Community Forum</h4>
                    <p className="text-gray-600">Connect with other learners</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Content Not Found</h2>
            <p className="text-gray-600 mb-6">The learning content you're looking for could not be found.</p>
            <a 
              href="/docs"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Documentation
            </a>
          </div>
        )}
      </div>
    </div>
  );
}