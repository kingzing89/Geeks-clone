"use client";

import React, { useState, useEffect, use } from "react";
import {
  ArrowLeft,
  Clock,
  BookOpen,
  Lock,
  CreditCard,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Tag,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface SectionPageProps {
  params: Promise<{ id: string; sectionId: string }>; // Changed from slug/sectionSlug to id/sectionId
}

interface Category {
  _id: string;
  title: string;
}

interface DocumentSection {
  _id?: string;
  slug?: string;
  title: string;
  content: string;
  order?: number;
}

interface DocData {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  content: string;
  category: Category;
  readTime?: string;
  documentSections?: DocumentSection[];
  keyFeatures?: string[];
  codeExamples?: { title: string; code: string; description: string }[];
  quickLinks?: { title: string; url: string; description?: string }[];
  proTip?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  price?: number;
  currency?: string;
  stripePriceId?: string;
}

interface SectionData {
  section: DocumentSection;
  sectionIndex: number;
  doc: DocData;
  nextSection?: { title: string; id: string; index: number };
  prevSection?: { title: string; id: string; index: number };
}

export default function SectionPage({ params }: SectionPageProps) {
  const unwrappedParams = use(params);
  const router = useRouter();

  const [sectionData, setSectionData] = useState<SectionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPaid, setIsPaid] = useState(false);
  const [checkingPurchase, setCheckingPurchase] = useState(false);

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

  // Fetch section data
  useEffect(() => {
    async function fetchSectionData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch the main document by ID
        const docResponse = await fetch(
          `/api/documentation/${unwrappedParams.id}` // Changed from slug to id
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

        const doc = docResult.data;
        
        // Find the specific section by _id
        const sortedSections = doc.documentSections?.sort((a: DocumentSection, b: DocumentSection) => 
          (a.order || 0) - (b.order || 0)
        ) || [];

        // Find section by _id
        const sectionIndex = sortedSections.findIndex((section: DocumentSection) => {
          return section._id === unwrappedParams.sectionId; // Changed to use sectionId
        });

        if (sectionIndex === -1) {
          throw new Error("Section not found");
        }

        const currentSection = sortedSections[sectionIndex];

        // Prepare navigation data using _id
        const nextSection = sectionIndex < sortedSections.length - 1 
          ? {
              title: sortedSections[sectionIndex + 1].title,
              id: sortedSections[sectionIndex + 1]._id!, // Changed from slug to id
              index: sectionIndex + 1
            }
          : undefined;

        const prevSection = sectionIndex > 0 
          ? {
              title: sortedSections[sectionIndex - 1].title,
              id: sortedSections[sectionIndex - 1]._id!, // Changed from slug to id
              index: sectionIndex - 1
            }
          : undefined;

        setSectionData({
          section: currentSection,
          sectionIndex,
          doc,
          nextSection,
          prevSection
        });

        // Check purchase status
        if (doc._id) {
          await checkDocumentPurchase(doc._id);
        }

      } catch (err) {
        console.error("Failed to fetch section data:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    if (unwrappedParams.id && unwrappedParams.sectionId) { // Changed from slug/sectionSlug
      fetchSectionData();
    }
  }, [unwrappedParams.id, unwrappedParams.sectionId]); // Changed dependencies

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

  // Handle payment redirect
  const handlePaymentRedirect = () => {
    router.push(`/docs/${unwrappedParams.id}?purchase=true`); // Changed from slug to id
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="h-10 bg-gray-200 rounded w-2/3 mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !sectionData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            {error === "Section not found" || error === "Documentation not found"
              ? "404 - Section Not Found"
              : "Error Loading Section"}
          </h1>
          <p className="text-gray-600 mb-6">
            {error === "Section not found"
              ? "The requested documentation section could not be found."
              : error === "Documentation not found"
              ? "The parent documentation could not be found."
              : `Failed to load section: ${error}`}
          </p>
          <Link
            href={`/docs/${unwrappedParams.id}`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Documentation
          </Link>
        </div>
      </div>
    );
  }

  const { section, sectionIndex, doc, nextSection, prevSection } = sectionData;
  const needsPurchase = doc.price && doc.price > 0 && !isPaid;

  const sortedSections: DocumentSection[] = (sectionData.doc.documentSections?.slice()?.sort((a: DocumentSection, b: DocumentSection) =>
    (a.order || 0) - (b.order || 0)
  )) || [];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Breadcrumb Navigation */}
        <nav className="mb-8">
          <div className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-gray-500 hover:text-gray-700">Home</Link>
            <span className="text-gray-400">/</span>
            <Link href={`/docs/${doc._id}`} className="text-blue-600 hover:text-blue-700 font-medium">{doc.title}</Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900">{section.title}</span>
          </div>
          <Link href={`/docs/${doc._id}`} className="inline-flex items-center mt-4 text-blue-600 hover:text-blue-700 font-medium">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to {doc.title}
          </Link>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <span className="inline-block bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {doc.category?.title || "Uncategorized"}
                </span>
                <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  Section {sectionIndex + 1}
                </span>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{section.title}</h1>
              <div className="flex items-center text-sm text-gray-500 space-x-4">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{doc.readTime || "Quick read"}</span>
                </div>
                <span>•</span>
                <span>Part of: {doc.title}</span>
                <span>•</span>
                <span>Updated: {formatDate(doc.updatedAt)}</span>
              </div>
            </div>

            {/* Overview */}
            {sectionData.doc.description && (
              <div className="bg-blue-50 border-l-4 border-blue-400 p-6 mb-8">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">Overview</h3>
                <p className="text-blue-700">{sectionData.doc.description}</p>
              </div>
            )}

            {/* Section Content */}
            {needsPurchase ? (
              <div className="relative mb-8">
                <div className="prose prose-lg max-w-none filter blur-sm pointer-events-none">
                  <div className="bg-gray-50 rounded-lg p-8">
                    <div className="text-gray-700 leading-relaxed whitespace-pre-line">{section.content}</div>
                  </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 rounded-lg">
                  <div className="text-center p-8">
                    <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Premium Content</h3>
                    <p className="text-gray-600 mb-4">This section is part of premium content. Purchase the full documentation to unlock.</p>
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                      <div className="text-lg font-semibold text-gray-900">{doc.title}</div>
                      <div className="text-2xl font-bold text-green-600 mt-1">${doc.price} {doc.currency?.toUpperCase() || "USD"}</div>
                      <div className="text-sm text-gray-500 mt-1">One-time purchase • Lifetime access</div>
                    </div>
                    {checkingPurchase ? (
                      <div className="flex items-center justify-center">
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        <span>Checking purchase status...</span>
                      </div>
                    ) : (
                      <button onClick={handlePaymentRedirect} className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto">
                        <CreditCard className="w-4 h-4" />
                        Purchase Full Documentation
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="prose prose-lg max-w-none mb-8">
                {isPaid && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
                    <p className="text-sm font-medium text-green-800">✅ Content Unlocked! You have full access to this documentation.</p>
                  </div>
                )}
                <div className="bg-gray-50 rounded-lg p-8">
                  <div className="text-gray-700 leading-relaxed whitespace-pre-line">{section.content}</div>
                </div>
              </div>
            )}

            {/* Rest of content stays the same but update navigation links */}

            {/* Section Navigation */}
            <div className="flex items-center justify-between py-8 border-t border-gray-200">
              <div className="flex-1">
                {prevSection && !needsPurchase ? (
                  <Link href={`/docs/${doc._id}/sections/${prevSection.id}`} className="group flex items-center text-blue-600 hover:text-blue-700">
                    <ChevronLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    <div className="text-left">
                      <div className="text-sm text-gray-500">Previous</div>
                      <div className="font-medium">{prevSection.title}</div>
                    </div>
                  </Link>
                ) : (
                  <div></div>
                )}
              </div>
              <div className="flex-1 text-center">
                <Link href={`/docs/${doc._id}`} className="text-gray-500 hover:text-gray-700 text-sm">View all sections</Link>
              </div>
              <div className="flex-1 flex justify-end">
                {nextSection && !needsPurchase ? (
                  <Link href={`/docs/${doc._id}/sections/${nextSection.id}`} className="group flex items-center text-blue-600 hover:text-blue-700">
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Next</div>
                      <div className="font-medium">{nextSection.title}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                ) : (
                  <div></div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              {/* Table of Contents */}
              {sortedSections.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Table of Contents</h3>
                  <nav className="space-y-2">
                    {sortedSections.map((s: DocumentSection, i: number) => (
                      <Link key={i} href={`/docs/${doc._id}/sections/${s._id}`} className="flex items-center text-sm text-gray-600 hover:text-blue-600 transition-colors">
                        <ChevronRight className="w-4 h-4 mr-2" />
                        {s.title}
                      </Link>
                    ))}
                  </nav>
                </div>
              )}

              {/* Document Info */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Info</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-gray-600">Status:</span><span className={`font-medium ${doc.isPublished ? 'text-green-600' : 'text-orange-600'}`}>{doc.isPublished ? 'Published' : 'Draft'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Category:</span><span className="font-medium text-gray-900">{doc.category?.title || 'Uncategorized'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Read Time:</span><span className="font-medium text-gray-900">{doc.readTime || 'Quick read'}</span></div>
                  {doc.price && doc.price > 0 && (<div className="flex justify-between"><span className="text-gray-600">Price:</span><span className="font-medium text-green-600">${doc.price} {doc.currency?.toUpperCase() || 'USD'}</span></div>)}
                  <div className="flex justify-between"><span className="text-gray-600">Updated:</span><span className="font-medium text-gray-900">{formatDate(doc.updatedAt)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Created:</span><span className="font-medium text-gray-900">{formatDate(doc.createdAt)}</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
