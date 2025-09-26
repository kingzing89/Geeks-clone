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
} from "lucide-react";
import { useRouter } from "next/navigation";

interface DocPageProps {
  params: Promise<{ slug: string }>;
}

interface Category {
  _id: string;
  title: string;
}

interface DocumentSection {
  title: string;
  content: string;
  order?: number;
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
          `/api/documentation/${unwrappedParams.slug}`
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

    if (unwrappedParams.slug) {
      fetchData();
    }
  }, [unwrappedParams.slug]);

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

    // Check if user is logged in
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login or signup to purchase this documentation.");
      // Optionally redirect to login page
      // router.push('/login');
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
          successUrl: `${window.location.origin}/docs/${doc.slug}?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/docs/${doc.slug}`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Handle authentication errors specifically
        if (response.status === 401) {
          alert("Your session has expired. Please login again to continue.");
          localStorage.removeItem("token"); // Clear invalid token
          // Optionally redirect to login page
          // router.push('/login');
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
      a.download = `${doc.slug}-documentation.${
        format === "html" ? "html" : "txt"
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
        <div className="max-w-6xl mx-auto px-4 py-8">
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            {error === "Documentation not found"
              ? "404 - Documentation Not Found"
              : "Error Loading Documentation"}
          </h1>
          <p className="text-gray-600 mb-6">
            {error === "Documentation not found"
              ? "The requested documentation page could not be found."
              : `Failed to load documentation: ${error}`}
          </p>
          <a
            href="/"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
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
                <div className="relative">
                  <button
                    onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                    disabled={isDownloading}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50"
                    title="Download Documentation"
                  >
                    {isDownloading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Download className="w-5 h-5" />
                    )}
                  </button>

                  {showDownloadMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                      <div className="py-2">
                        <button
                          onClick={() => handleDownload("text")}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <FileText className="w-4 h-4 mr-3" />
                          Download as Text
                        </button>
                        <button
                          onClick={() => handleDownload("html")}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <File className="w-4 h-4 mr-3" />
                          Download as HTML
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <h1 className="text-4xl font-bold text-gray-900 mb-4">{doc.title}</h1>

              <div className="flex items-center text-sm text-gray-500 space-x-4 mb-6">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{doc.readTime || "Quick read"}</span>
                </div>
                <span>•</span>
                <span>Updated: {formatDate(doc.updatedAt)}</span>
                <span>•</span>
                <span>Created: {formatDate(doc.createdAt)}</span>
                {doc.price && doc.price > 0 && (
                  <>
                    <span>•</span>
                    <span className="text-green-600 font-semibold">
                      ${doc.price} {doc.currency?.toUpperCase() || "USD"}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Description */}
            {doc.description && (
              <div className="bg-blue-50 border-l-4 border-blue-400 p-6 mb-8">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">
                  <BookOpen className="w-5 h-5 inline mr-2" />
                  Overview
                </h3>
                <p className="text-blue-700">{doc.description}</p>
              </div>
            )}

            {/* Main Content */}
            {doc.price && doc.price > 0 && !isPaid ? (
              // Locked Main Content
              <div className="relative mb-8">
                <div className="prose prose-lg max-w-none filter blur-sm pointer-events-none">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Content</h2>
                    <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {doc.content}
                    </div>
                  </div>
                </div>
                
                {/* Content Lock Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 rounded-lg">
                  <div className="text-center p-8">
                    <Lock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      Premium Content
                    </h3>
                    <p className="text-gray-600 mb-4 text-sm">
                      This content is locked. Purchase to unlock full access.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              // Unlocked Main Content
              <div className="prose prose-lg max-w-none mb-8">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Content</h2>
                  <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {doc.content}
                  </div>
                </div>
              </div>
            )}

            {/* Document Sections */}
            {sortedSections.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Documentation Sections</h2>
                
                {doc.price && doc.price > 0 && !isPaid ? (
                  // Locked Document Sections
                  <div className="relative">
                    <div className="space-y-6 filter blur-sm pointer-events-none">
                      {sortedSections.map((section, index) => (
                        <div
                          key={index}
                          className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
                        >
                          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                            <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2 py-1 rounded mr-3">
                              {index + 1}
                            </span>
                            {section.title}
                          </h3>
                          <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                            {section.content}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Sections Lock Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 rounded-lg">
                      <div className="text-center p-8">
                        <Lock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                          Premium Sections
                        </h3>
                        <p className="text-gray-600 mb-4 text-sm">
                          Access detailed documentation sections with your purchase.
                        </p>
                        <button
                          onClick={() => setShowPaymentModal(true)}
                          className="bg-blue-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          Unlock Now
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Unlocked Document Sections
                  <div className="space-y-6">
                    {sortedSections.map((section, index) => (
                      <div
                        key={index}
                        id={`section-${index}`}
                        className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => {
                          // Create a URL for the section
                          const sectionUrl = `${window.location.pathname}#section-${index}`;
                          window.history.pushState({}, '', sectionUrl);
                          
                          // Scroll to section
                          document.getElementById(`section-${index}`)?.scrollIntoView({
                            behavior: 'smooth'
                          });
                        }}
                      >
                        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center group">
                          <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2 py-1 rounded mr-3 group-hover:bg-blue-200 transition-colors">
                            {index + 1}
                          </span>
                          <span className="group-hover:text-blue-600 transition-colors">{section.title}</span>
                          <ChevronRight className="w-4 h-4 ml-2 text-gray-400 group-hover:text-blue-600 transition-colors" />
                        </h3>
                        <div className="text-gray-700 leading-relaxed whitespace-pre-line">
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
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Features</h2>
                
                {doc.price && doc.price > 0 && !isPaid ? (
                  // Locked Key Features
                  <div className="relative">
                    <div className="grid gap-4 filter blur-sm pointer-events-none">
                      {doc.keyFeatures.map((feature, index) => (
                        <div
                          key={index}
                          className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-6 shadow-sm"
                        >
                          <div className="flex items-start">
                            <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                              {index + 1}
                            </div>
                            <h4 className="text-lg font-semibold text-gray-900">
                              {feature}
                            </h4>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Key Features Lock Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 rounded-lg">
                      <div className="text-center p-8">
                        <Lock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                          Premium Features
                        </h3>
                        <p className="text-gray-600 mb-4 text-sm">
                          Discover all key features with full access.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Unlocked Key Features
                  <div className="grid gap-4">
                    {doc.keyFeatures.map((feature, index) => (
                      <div
                        key={index}
                        className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-6 shadow-sm"
                      >
                        <div className="flex items-start">
                          <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                            {index + 1}
                          </div>
                          <h4 className="text-lg font-semibold text-gray-900">
                            {feature}
                          </h4>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Code Examples */}
            {doc.codeExamples && doc.codeExamples.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Code Examples</h2>

                {doc.price && doc.price > 0 && !isPaid ? (
                  // Locked Content
                  <div className="relative">
                    <div className="grid gap-6 filter blur-sm pointer-events-none">
                      {doc.codeExamples.map((example, index) => (
                        <div
                          key={index}
                          className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200"
                        >
                          <h3 className="text-xl font-semibold mb-3 text-blue-800">
                            {example.title}
                          </h3>
                          <p className="text-gray-700 mb-4">
                            {example.description}
                          </p>
                          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                            <pre>{example.code}</pre>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Lock Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 rounded-lg">
                      <div className="text-center p-8">
                        <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">
                          Premium Content
                        </h3>
                        <p className="text-gray-600 mb-4">
                          Unlock code examples and advanced tutorials by purchasing this guide.
                        </p>
                        {checkingPurchase ? (
                          <div className="flex items-center justify-center">
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            <span>Checking purchase status...</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => setShowPaymentModal(true)}
                            className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Unlock for ${doc.price}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  // Unlocked Content
                  <div className="space-y-6">
                    {isPaid && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                        <p className="text-sm font-medium text-green-800">
                          ✅ Content Unlocked! You have full access to this documentation.
                        </p>
                      </div>
                    )}
                    {doc.codeExamples.map((example, index) => (
                      <div
                        key={index}
                        className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200"
                      >
                        <h3 className="text-xl font-semibold mb-3 text-blue-800">
                          {example.title}
                        </h3>
                        <p className="text-gray-700 mb-4">
                          {example.description}
                        </p>
                        <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                          <pre>{example.code}</pre>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Pro Tip */}
            {doc.proTip && (
              <div className="mb-8">
                {doc.price && doc.price > 0 && !isPaid ? (
                  // Locked Pro Tip
                  <div className="relative">
                    <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-lg p-6 filter blur-sm pointer-events-none">
                      <h3 className="text-lg font-bold mb-3 flex items-center">
                        💡 Pro Tip
                      </h3>
                      <p className="text-sm opacity-90 leading-relaxed">{doc.proTip}</p>
                    </div>
                    
                    {/* Pro Tip Lock Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 rounded-lg">
                      <div className="text-center p-6">
                        <Lock className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                        <h3 className="text-base font-semibold text-gray-800 mb-1">
                          Expert Insight
                        </h3>
                        <p className="text-gray-600 text-xs">
                          Unlock professional tips and best practices.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Unlocked Pro Tip
                  <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-lg p-6">
                    <h3 className="text-lg font-bold mb-3 flex items-center">
                      💡 Pro Tip
                    </h3>
                    <p className="text-sm opacity-90 leading-relaxed">{doc.proTip}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              {/* Table of Contents */}
              {sortedSections.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Table of Contents
                  </h3>
                  <nav className="space-y-2">
                    {sortedSections.map((section, index) => (
                      <div key={index} className="group">
                        {doc.price && doc.price > 0 && !isPaid ? (
                          // Locked TOC items
                          <div className="flex items-center text-sm text-gray-400 cursor-not-allowed">
                            <Lock className="w-3 h-3 mr-2" />
                            <span className="truncate">{section.title}</span>
                          </div>
                        ) : (
                          // Unlocked TOC items
                          <a
                            href={`#section-${index}`}
                            className="flex items-center text-sm text-gray-600 hover:text-blue-600 transition-colors group-hover:bg-blue-50 p-2 rounded cursor-pointer"
                            onClick={(e) => {
                              e.preventDefault();
                              const sectionUrl = `${window.location.pathname}#section-${index}`;
                              window.history.pushState({}, '', sectionUrl);
                              document.getElementById(`section-${index}`)?.scrollIntoView({
                                behavior: 'smooth'
                              });
                            }}
                          >
                            <ChevronRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                            <span className="truncate">{section.title}</span>
                          </a>
                        )}
                      </div>
                    ))}
                    
                    {doc.price && doc.price > 0 && !isPaid && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => setShowPaymentModal(true)}
                          className="w-full bg-blue-600 text-white text-xs font-medium py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Unlock All Sections
                        </button>
                      </div>
                    )}
                  </nav>
                </div>
              )}

              {/* Quick Links */}
              {doc.quickLinks && doc.quickLinks.length > 0 && (
  <div className="bg-blue-50 rounded-lg p-6 mb-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
      <ExternalLink className="w-5 h-5 mr-2" />
      Quick Links
    </h3>
    <div className="space-y-3">
      {doc.quickLinks.map((link, index) => {
        // Handle both string format and object format
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
              <div className="flex-1">
                <div className="font-medium text-blue-600 group-hover:text-blue-800 transition-colors">
                  {linkTitle}
                </div>
                {linkDescription && (
                  <div className="text-gray-600 text-xs mt-1">
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
              <div className="bg-gray-50 rounded-lg p-6">
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
          <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
            <button
              onClick={() => setShowPaymentModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Unlock Premium Content
              </h2>
              <p className="text-gray-600">
                Get access to {doc.title} including code examples and tutorials.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-gray-900">
                  {doc.title}
                </span>
                <span className="text-2xl font-bold text-green-600">
                  ${doc.price} {doc.currency?.toUpperCase() || "USD"}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                One-time purchase • Lifetime access
              </p>
            </div>

            <button
              onClick={handlePayment}
              disabled={isPaymentLoading}
              className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
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

            <p className="text-xs text-gray-500 text-center mt-4">
              🔒 Secure payment powered by Stripe
            </p>
          </div>
        </div>
      )}

      {/* Click outside to close download menu */}
      {showDownloadMenu && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowDownloadMenu(false)}
        />
      )}
    </div>
  );
}