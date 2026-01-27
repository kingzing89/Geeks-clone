"use client";

import React, { useState, useEffect, use } from "react";
import {
  Download,
  FileText,
  File,
  CreditCard,
  Loader2,
  X,
  Lock,
  Clock,
  BookOpen,
  ExternalLink,
  ChevronRight,
  Tag,
  Copy,
  Check,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface DocPageProps {
  params: Promise<{ id: string }>;
}

interface Category {
  _id: string;
  title: string;
}

interface DocumentSection {
  _id?: string;
  title: string;
  content: string;
  order?: number;
  slug: string;
}

interface QuickLink {
  title?: string;
  url: string;
  description?: string;
}

interface CodeExample {
  title: string;
  code: string;
  description: string;
}

interface DocData {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  content: string;
  category: Category;
  readTime?: string;
  keyFeatures: string[];
  codeExamples: CodeExample[];
  documentSections?: DocumentSection[];
  quickLinks?: QuickLink[];
  proTip?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  price?: number;
  currency?: string;
  stripePriceId?: string;
  __v?: number;
}

// Code Example Card Component
const CodeExampleCard = ({ 
  example, 
  index, 
  isLocked = false 
}: { 
  example: CodeExample; 
  index: number; 
  isLocked?: boolean;
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (isLocked) return;
    
    try {
      await navigator.clipboard.writeText(example.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const detectLanguage = (code: string): string => {
    if (code.includes('function') || code.includes('const') || code.includes('let') || code.includes('var')) {
      return 'javascript';
    } else if (code.includes('def ') || code.includes('import ') || code.includes('class ')) {
      return 'python';
    } else if (code.includes('<?php') || code.includes('$')) {
      return 'php';
    } else if (code.includes('<') || code.includes('</') || code.includes('/>')) {
      return 'html';
    } else if (code.includes('{') && code.includes('}') && code.includes(';')) {
      return 'css';
    } else if (code.includes('SELECT') || code.includes('INSERT') || code.includes('UPDATE')) {
      return 'sql';
    }
    return 'text';
  };

  const language = detectLanguage(example.code);

  const getLanguageColor = (lang: string): string => {
    const colors: { [key: string]: string } = {
      javascript: 'text-yellow-400',
      python: 'text-blue-400',
      php: 'text-purple-400',
      html: 'text-red-400',
      css: 'text-pink-400',
      sql: 'text-cyan-400',
      text: 'text-green-400',
    };
    return colors[lang] || 'text-green-400';
  };

  return (
    <div className={`bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 overflow-hidden ${
      isLocked ? 'filter blur-sm pointer-events-none' : 'hover:shadow-md transition-shadow'
    }`}>
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-3 gap-2">
          <h3 className="text-lg sm:text-xl font-semibold text-blue-800 flex-1">
            {example.title}
          </h3>
          <span className="bg-blue-200 text-blue-800 text-xs font-medium px-2 py-1 rounded-full flex-shrink-0 w-fit">
            {language.toUpperCase()}
          </span>
        </div>
        <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
          {example.description}
        </p>
      </div>
      <div className="bg-gray-900 p-3 sm:p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-400 font-mono">Example {index + 1}</span>
          {!isLocked && (
            <button 
              className={`flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors ${
                copied 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
              }`}
              onClick={handleCopy}
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          )}
        </div>
        <div className="relative">
          <pre className="text-xs sm:text-sm leading-relaxed overflow-x-auto max-h-96 overflow-y-auto">
            <code className={`font-mono block whitespace-pre ${getLanguageColor(language)}`}>
              {example.code}
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
};

export default function DocPage({ params }: DocPageProps) {
  const unwrappedParams = use(params);
  const router = useRouter();

  // State declarations
  const [doc, setDoc] = useState<DocData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPaid, setIsPaid] = useState(false);
  const [checkingPurchase, setCheckingPurchase] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check if user has purchased the document
  const checkDocumentPurchase = async (documentId: string) => {
    try {
      setCheckingPurchase(true);
      const token = localStorage.getItem("token");
      const response = await fetch("/api/user/purchases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ documentId }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setIsPaid(result.data.hasPurchased);
        }
      }
    } catch (error) {
      console.error("Error checking document purchase:", error);
    } finally {
      setCheckingPurchase(false);
    }
  };

  // Fetch document data
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        // Check for successful payment
        const urlParams = new URLSearchParams(window.location.search);
        const sessionId = urlParams.get("session_id");

        if (sessionId) {
          try {
            const token = localStorage.getItem("token");
            const paymentResponse = await fetch("/api/payments/success", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ sessionId }),
            });

            if (paymentResponse.ok) {
              setIsPaid(true);
              window.history.replaceState(
                {},
                document.title,
                window.location.pathname
              );
            }
          } catch (paymentError) {
            console.error("Payment verification error:", paymentError);
          }
        }

        // Fetch document
        const docResponse = await fetch(
          `/api/documentation/${unwrappedParams.id}`
        );

        if (!docResponse.ok) {
          if (docResponse.status === 404) {
            throw new Error("Documentation not found");
          }
          throw new Error(`HTTP error! status: ${docResponse.status}`);
        }

        const docResult = await docResponse.json();

        if (!docResult.success) {
          throw new Error(docResult.error || "Failed to fetch documentation");
        }

        setDoc(docResult.data);

        // Check purchase status if not already paid
        if (!sessionId && docResult.data._id) {
          await checkDocumentPurchase(docResult.data._id);
        }
      } catch (err) {
        console.error("Failed to fetch documentation:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    if (unwrappedParams.id) {
      fetchData();
    }
  }, [unwrappedParams.id]);

  // Format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Recently updated";
    }
  };

  // Handle payment
  const handlePayment = async () => {
    if (!doc) return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login or signup to purchase this documentation.");
      return;
    }

    setIsPaymentLoading(true);

    try {
      const response = await fetch("/api/payments/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          priceId: doc.stripePriceId,
          documentId: doc._id,
          documentTitle: doc.title,
          documentSlug: doc.slug,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();

        if (response.status === 401) {
          alert("Your session has expired. Please login again to continue.");
          localStorage.removeItem("token");
          return;
        }

        throw new Error(errorData.error || "Failed to create checkout session");
      }

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error("Payment error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      alert(`Payment failed: ${errorMessage}. Please try again.`);
    } finally {
      setIsPaymentLoading(false);
    }
  };

  // Handle download
  const handleDownload = async (format: "text" | "html") => {
    if (!doc) return;

    setIsDownloading(true);
    setShowDownloadMenu(false);

    try {
      let content = `${doc.title}\n${"=".repeat(doc.title.length)}\n\n`;
      content += `Category: ${doc.category?.title || "Uncategorized"}\n`;
      content += `Last Updated: ${formatDate(doc.updatedAt)}\n`;
      content += `Read Time: ${doc.readTime || "Quick read"}\n\n`;

      if (doc.description) {
        content += `Description:\n${doc.description}\n\n`;
      }

      content += `Content:\n${doc.content}\n\n`;

      if (doc.keyFeatures && doc.keyFeatures.length > 0) {
        content += `Key Features:\n${doc.keyFeatures.map(f => `- ${f}`).join('\n')}\n\n`;
      }

      if (doc.documentSections && doc.documentSections.length > 0) {
        content += `Sections:\n`;
        doc.documentSections.forEach((section, index) => {
          content += `${index + 1}. ${section.title}\n${section.content}\n\n`;
        });
      }

      if (doc.codeExamples && doc.codeExamples.length > 0) {
        content += `Code Examples:\n`;
        doc.codeExamples.forEach((example, index) => {
          content += `${index + 1}. ${example.title}\n${example.description}\n${example.code}\n\n`;
        });
      }

      if (doc.proTip) {
        content += `Pro Tip:\n${doc.proTip}\n\n`;
      }

      const blob = new Blob([content], {
        type: format === "html" ? "text/html" : "text/plain",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `${doc.slug}-documentation.${format === "html" ? "html" : "txt"
        }`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download documentation. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-12 bg-gray-200 rounded w-3/4 mb-6"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-3 space-y-4">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              </div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !doc) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6">
        <div className="text-center max-w-md">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
            {error === "Documentation not found"
              ? "404 - Documentation Not Found"
              : "Error Loading Documentation"}
          </h1>
          <p className="text-gray-600 mb-6 text-sm sm:text-base">
            {error === "Documentation not found"
              ? "The requested documentation page could not be found."
              : `Failed to load documentation: ${error}`}
          </p>
          <a
            href="/"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
          >
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  // Sort document sections by order if available
  const sortedSections = doc.documentSections?.sort((a, b) =>
    (a.order || 0) - (b.order || 0)
  ) || [];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Mobile Menu Button */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <span>Topics</span>
            <ChevronRight className={`w-4 h-4 transition-transform ${mobileMenuOpen ? 'rotate-90' : ''}`} />
          </button>
        </div>

        {/* Restructured grid with topics on the left */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">

          {/* Left Sidebar - Topics */}
          <div className={`lg:col-span-2 ${mobileMenuOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="sticky top-6 sm:top-8">
              {/* Table of Contents */}
              {sortedSections.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Topics
                  </h3>
                  <nav className="space-y-2">
                    {sortedSections.map((section, index) => (
                      <div key={index} className="group">
                        <a
                          href={`/docs/${unwrappedParams.id}/sections/${section._id}`}
                          className="flex items-center text-sm text-gray-600 hover:text-blue-600 transition-colors group-hover:bg-blue-50 p-2 rounded cursor-pointer"
                          onClick={(e) => {
                            e.preventDefault();
                            setMobileMenuOpen(false);
                            router.push(`/docs/${unwrappedParams.id}/sections/${section._id}`);
                          }}
                        >
                          <ChevronRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                          <span className="break-words line-clamp-2">{section.title}</span>
                        </a>
                      </div>
                    ))}
                  </nav>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-7">
            {/* Header */}
            <div className="mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <div className="flex items-center space-x-2 sm:space-x-3 flex-wrap gap-2">
                  <span className="inline-block bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {doc.category?.title || "Uncategorized"}
                  </span>
                  {doc.isPublished && (
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      Published
                    </span>
                  )}
                </div>

                {/* Download Button */}
                <div className="relative self-end sm:self-auto">
                  <button
                    onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                    disabled={isDownloading}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50 transition-colors"
                    title="Download Documentation"
                  >
                    {isDownloading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Download className="w-5 h-5" />
                    )}
                  </button>

                  {showDownloadMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                      <div className="py-2">
                        <button
                          onClick={() => handleDownload("text")}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          <FileText className="w-4 h-4 mr-3" />
                          Download as Text
                        </button>
                        <button
                          onClick={() => handleDownload("html")}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          <File className="w-4 h-4 mr-3" />
                          Download as HTML
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                {doc.title}
              </h1>

              <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-500 gap-2 sm:gap-4 mb-6">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1 flex-shrink-0" />
                  <span>{doc.readTime || "Quick read"}</span>
                </div>
                <span className="hidden sm:inline">•</span>
                <span>Updated: {formatDate(doc.updatedAt)}</span>
                <span className="hidden sm:inline">•</span>
                <span>Created: {formatDate(doc.createdAt)}</span>
                {doc.price && doc.price > 0 && (
                  <>
                    <span className="hidden sm:inline">•</span>
                    <span className="text-green-600 font-semibold">
                      ${doc.price} {doc.currency?.toUpperCase() || "USD"}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Description */}
            {doc.description && (
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 sm:p-6 mb-6 sm:mb-8">
                <h3 className="text-lg font-semibold text-blue-800 mb-2 flex items-center">
                  <BookOpen className="w-5 h-5 inline mr-2 flex-shrink-0" />
                  Overview
                </h3>
                <p className="text-blue-700 text-sm sm:text-base">{doc.description}</p>
              </div>
            )}

            {/* Main Content */}
            {doc.price && doc.price > 0 && !isPaid ? (
              // Locked Main Content
              <div className="relative mb-6 sm:mb-8">
                <div className="prose prose-sm sm:prose-lg max-w-none filter blur-sm pointer-events-none">
                  <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Content</h2>
                    <div className="text-gray-700 leading-relaxed whitespace-pre-line text-sm sm:text-base">
                      {doc.content}
                    </div>
                  </div>
                </div>

                {/* Content Lock Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 rounded-lg">
                  <div className="text-center p-4 sm:p-8">
                    <Lock className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3" />
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
                      Premium Content
                    </h3>
                    <p className="text-gray-600 mb-4 text-xs sm:text-sm">
                      This content is locked. Purchase to get full access.
                    </p>
                    <button
                      onClick={() => setShowPaymentModal(true)}
                      className="bg-blue-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      Purchase Now
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              // Purchased Main Content
              <div className="prose prose-sm sm:prose-lg max-w-none mb-6 sm:mb-8">
                <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Content</h2>
                  <div className="text-gray-700 leading-relaxed whitespace-pre-line text-sm sm:text-base">
                    {doc.content}
                  </div>
                </div>
              </div>
            )}

            {/* Document Sections */}
            {sortedSections.length > 0 && (
              <div className="mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Documentation Sections</h2>

                {doc.price && doc.price > 0 && !isPaid ? (
                  // Locked Document Sections
                  <div className="relative">
                    <div className="space-y-4 sm:space-y-6 filter blur-sm pointer-events-none">
                      {sortedSections.map((section, index) => (
                        <div
                          key={index}
                          className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm"
                        >
                          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center">
                            <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2 py-1 rounded mr-3 flex-shrink-0">
                              {index + 1}
                            </span>
                            {section.title}
                          </h3>
                          <div className="text-gray-700 leading-relaxed whitespace-pre-line text-sm sm:text-base">
                            {section.content}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Sections Lock Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 rounded-lg">
                      <div className="text-center p-4 sm:p-8">
                        <Lock className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3" />
                        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
                          Premium Sections
                        </h3>
                        <p className="text-gray-600 mb-4 text-xs sm:text-sm">
                          Access detailed documentation sections with your purchase.
                        </p>
                        <button
                          onClick={() => setShowPaymentModal(true)}
                          className="bg-blue-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          Purchase Now
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Purchased Document Sections
                  <div className="space-y-4 sm:space-y-6">
                    {sortedSections.map((section, index) => (
                      <div
                        key={index}
                        id={`section-${index}`}
                        className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => {
                          const sectionUrl = `${window.location.pathname}#section-${index}`;
                          window.history.pushState({}, '', sectionUrl);
                          document.getElementById(`section-${index}`)?.scrollIntoView({
                            behavior: 'smooth'
                          });
                        }}
                      >
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center group">
                          <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2 py-1 rounded mr-3 flex-shrink-0 group-hover:bg-blue-200 transition-colors">
                            {index + 1}
                          </span>
                          <span className="group-hover:text-blue-600 transition-colors flex-1">{section.title}</span>
                          <ChevronRight className="w-4 h-4 ml-2 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0" />
                        </h3>
                        <div className="text-gray-700 leading-relaxed whitespace-pre-line text-sm sm:text-base">
                          {section.content}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Key Features */}
            {doc.keyFeatures && doc.keyFeatures.length > 0 && (
              <div className="mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Key Features</h2>

                {doc.price && doc.price > 0 && !isPaid ? (
                  // Locked Key Features
                  <div className="relative">
                    <div className="grid gap-3 sm:gap-4 filter blur-sm pointer-events-none">
                      {doc.keyFeatures.map((feature, index) => (
                        <div
                          key={index}
                          className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-4 sm:p-6 shadow-sm"
                        >
                          <div className="flex items-start">
                            <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5 flex-shrink-0">
                              {index + 1}
                            </div>
                            <h4 className="text-base sm:text-lg font-semibold text-gray-900">
                              {feature}
                            </h4>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Key Features Lock Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 rounded-lg">
                      <div className="text-center p-4 sm:p-8">
                        <Lock className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3" />
                        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
                          Premium Features
                        </h3>
                        <p className="text-gray-600 mb-4 text-xs sm:text-sm">
                          Discover all key features with full access.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Purchased Key Features
                  <div className="grid gap-3 sm:gap-4">
                    {doc.keyFeatures.map((feature, index) => (
                      <div
                        key={index}
                        className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-4 sm:p-6 shadow-sm"
                      >
                        <div className="flex items-start">
                          <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5 flex-shrink-0">
                            {index + 1}
                          </div>
                          <h4 className="text-base sm:text-lg font-semibold text-gray-900">
                            {feature}
                          </h4>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Code Examples - Improved Design */}
            {doc.codeExamples && doc.codeExamples.length > 0 && (
              <div className="mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Code Examples</h2>

                {doc.price && doc.price > 0 && !isPaid ? (
                  // Locked Content
                  <div className="relative">
                    <div className="grid gap-4 sm:gap-6 filter blur-sm pointer-events-none">
                      {doc.codeExamples.map((example, index) => (
                        <CodeExampleCard 
                          key={index}
                          example={example}
                          index={index}
                          isLocked={true}
                        />
                      ))}
                    </div>

                    {/* Lock Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 rounded-lg">
                      <div className="text-center p-4 sm:p-8">
                        <Lock className="w-8 h-8 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
                          Premium Content
                        </h3>
                        <p className="text-gray-600 mb-4 text-sm sm:text-base">
                          Purchase code examples and advanced tutorials by purchasing this guide.
                        </p>
                        {checkingPurchase ? (
                          <div className="flex items-center justify-center text-sm sm:text-base">
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            <span>Checking purchase status...</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => setShowPaymentModal(true)}
                            className="bg-blue-600 text-white font-bold py-2 px-4 sm:py-3 sm:px-6 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
                          >
                            Purchase for ${doc.price}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  // Purchased Content
                  <div className="space-y-4 sm:space-y-6">
                    {isPaid && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                        <p className="text-sm font-medium text-green-800">
                          ✅ Content Purchased! You have full access to this documentation.
                        </p>
                      </div>
                    )}
                    {doc.codeExamples.map((example, index) => (
                      <CodeExampleCard 
                        key={index}
                        example={example}
                        index={index}
                        isLocked={false}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Pro Tip */}
            {doc.proTip && (
              <div className="mb-6 sm:mb-8">
                {doc.price && doc.price > 0 && !isPaid ? (
                  // Locked Pro Tip
                  <div className="relative">
                    <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-lg p-4 sm:p-6 filter blur-sm pointer-events-none">
                      <h3 className="text-base sm:text-lg font-bold mb-3 flex items-center">
                        💡 Pro Tip
                      </h3>
                      <p className="text-xs sm:text-sm opacity-90 leading-relaxed">{doc.proTip}</p>
                    </div>

                    {/* Pro Tip Lock Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 rounded-lg">
                      <div className="text-center p-4 sm:p-6">
                        <Lock className="w-6 h-6 sm:w-10 sm:h-10 text-gray-400 mx-auto mb-2" />
                        <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-1">
                          Expert Insight
                        </h3>
                        <p className="text-gray-600 text-xs sm:text-sm">
                          Purchase professional tips and best practices.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Purchased Pro Tip
                  <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-lg p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-bold mb-3 flex items-center">
                      💡 Pro Tip
                    </h3>
                    <p className="text-xs sm:text-sm opacity-90 leading-relaxed">{doc.proTip}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-3 hidden lg:block">
            <div className="sticky top-6 sm:top-8 space-y-4 sm:space-y-6">
              {/* Quick Links */}
              {doc.quickLinks && doc.quickLinks.length > 0 && (
                <div className="bg-blue-50 rounded-lg p-4 sm:p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <ExternalLink className="w-5 h-5 mr-2 flex-shrink-0" />
                    Quick Links
                  </h3>
                  <div className="space-y-3">
                    {doc.quickLinks.map((link, index) => {
                      const linkUrl = typeof link === 'string' ? link : link.url;
                      const linkTitle = typeof link === 'string'
                        ? new URL(link).hostname.replace('www.', '')
                        : link.title || new URL(link.url).hostname.replace('www.', '');
                      const linkDescription = typeof link === 'string' ? undefined : link.description;

                      return (
                        <div key={index} className="border-b border-blue-100 pb-3 last:border-b-0">
                          <a
                            href={linkUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-start text-sm hover:bg-blue-100 p-2 rounded transition-colors group"
                          >
                            <ExternalLink className="w-4 h-4 mr-3 mt-0.5 flex-shrink-0 text-blue-500 group-hover:text-blue-700" />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-blue-600 group-hover:text-blue-800 transition-colors truncate">
                                {linkTitle}
                              </div>
                              {linkDescription && (
                                <div className="text-gray-600 text-xs mt-1 line-clamp-2">
                                  {linkDescription}
                                </div>
                              )}
                            </div>
                          </a>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Document Info */}
              <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Document Info
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`font-medium ${doc.isPublished ? 'text-green-600' : 'text-orange-600'}`}>
                      {doc.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-medium text-gray-900">
                      {doc.category?.title || 'Uncategorized'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Read Time:</span>
                    <span className="font-medium text-gray-900">
                      {doc.readTime || 'Quick read'}
                    </span>
                  </div>
                  {doc.price && doc.price > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Price:</span>
                      <span className="font-medium text-green-600">
                        ${doc.price} {doc.currency?.toUpperCase() || 'USD'}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Updated:</span>
                    <span className="font-medium text-gray-900">
                      {formatDate(doc.updatedAt)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created:</span>
                    <span className="font-medium text-gray-900">
                      {formatDate(doc.createdAt)}
                    </span>
                  </div>
                  {doc.__v !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Version:</span>
                      <span className="font-medium text-gray-900">
                        v{doc.__v}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-4 sm:p-6 relative mx-auto">
            <button
              onClick={() => setShowPaymentModal(false)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <div className="text-center mb-4 sm:mb-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <CreditCard className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Purchase Premium Content
              </h2>
              <p className="text-gray-600 text-sm sm:text-base">
                Get access to {doc.title} including code examples and tutorials.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
              <div className="flex items-center justify-between">
                <span className="text-base sm:text-lg font-semibold text-gray-900 truncate mr-2">
                  {doc.title}
                </span>
                <span className="text-xl sm:text-2xl font-bold text-green-600 whitespace-nowrap">
                  ${doc.price} {doc.currency?.toUpperCase() || "USD"}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                One-time purchase • Lifetime access
              </p>
            </div>

            <button
              onClick={handlePayment}
              disabled={isPaymentLoading}
              className="w-full bg-blue-600 text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              {isPaymentLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  Pay ${doc.price} - Secure Checkout
                </>
              )}
            </button>

            <p className="text-xs text-gray-500 text-center mt-3 sm:mt-4">
              🔒 Secure payment powered by Stripe
            </p>
          </div>
        </div>
      )}

      {/* Click outside to close download menu */}
      {showDownloadMenu && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowDownloadMenu(false)}
        />
      )}
    </div>
  );
}