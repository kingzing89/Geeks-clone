"use client";

import Link from "next/link";
import { ArrowRight, Clock, BookOpen } from "lucide-react";
import { useState, useEffect } from "react";

interface CategoryObject {
  _id: string;
  title: string;
  slug: string;
  bgColor: string;
  icon: string;
}

interface TopicCard {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  content: string;
  category: CategoryObject; // Updated to handle object structure
  readTime?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

interface TopicSectionProps {
  title?: string;
  category?: string; // Filter by category (optional)
  limit?: number; // Limit number of cards shown
  showViewAll?: boolean;
  showOnlyPublished?: boolean; // New prop to control published filter
  onViewAll?: () => void;
  onCardClick?: (card: TopicCard) => void;
}

export default function TopicSection({
  title = "Documentation",
  category,
  limit = 4,
  showViewAll = true,
  showOnlyPublished = true, // Default to showing only published docs
  onViewAll,
  onCardClick,
}: TopicSectionProps) {
  const [cards, setCards] = useState<TopicCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    async function fetchDocumentation() {
      try {
        setLoading(true);
        setError(null);
        
        // Build API URL with query parameters
        const params = new URLSearchParams();
        if (category) {
          params.append('category', category);
        }
        if (limit) {
          params.append('limit', limit.toString());
        }
        if (showOnlyPublished) {
          params.append('published', 'true');
        }
        
        const apiUrl = `/api/documentation?${params.toString()}`;
        
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();

        console.log("result of the values", result);
        
        if (result.success && Array.isArray(result.data)) {
          setCards(result.data);
          setTotalCount(result.totalCount || result.data.length);
        } else {
          throw new Error(result.error || 'Failed to fetch documentation');
        }
      } catch (err) {
        console.error('Failed to fetch documentation:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        setCards([]);
      } finally {
        setLoading(false);
      }
    }

    fetchDocumentation();
  }, [category, limit, showOnlyPublished]);

  const handleCardClick = (card: TopicCard) => {
    if (onCardClick) {
      onCardClick(card);
    }
  };

  const handleViewAll = () => {
    if (onViewAll) {
      onViewAll();
    } else {
      // Navigate to docs listing page with category filter
      const categoryParam = category ? `?category=${encodeURIComponent(category)}` : '';
      window.location.href = `/docs${categoryParam}`;
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'Recent';
    }
  };


  // Get category color - Fixed to handle category objects

  const getCategoryColor = (category: any) => {
    let categoryName: string;
    
    // Handle both string and object category formats
    if (typeof category === 'string') {
      categoryName = category;
    } else if (category && typeof category === 'object' && category.title) {
      categoryName = category.title;
    } else if (category && typeof category === 'object' && category.slug) {
      categoryName = category.slug;
    } else {
      return 'bg-slate-400 hover:bg-slate-500';
    }
  
    const colors: Record<string, string> = {
      'programming': 'bg-blue-400 hover:bg-blue-500',
      'javascript': 'bg-amber-400 hover:bg-amber-500',
      'python': 'bg-emerald-400 hover:bg-emerald-500',
      'web-development': 'bg-violet-400 hover:bg-violet-500',
      'database': 'bg-orange-400 hover:bg-orange-500',
      'algorithms': 'bg-indigo-400 hover:bg-indigo-500',
      'artificial-intelligence': 'bg-slate-400 hover:bg-slate-500',
      'artificial intelligence': 'bg-slate-400 hover:bg-slate-500',
    };
    
    const normalizedCategory = categoryName.toLowerCase().replace(/\s+/g, '-');
    return colors[normalizedCategory] || 'bg-slate-400 hover:bg-slate-500';
  };




  // Helper function to get category display name
  const getCategoryDisplayName = (category: any): string => {
    if (typeof category === 'string') {
      return category;
    } else if (category && typeof category === 'object' && category.title) {
      return category.title;
    } else if (category && typeof category === 'object' && category.slug) {
      return category.slug;
    }
    return 'Uncategorized';
  };

  // Loading state
  if (loading) {
    return (
      <div className="w-full py-8 mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          {showViewAll && (
            <div className="px-4 py-2 bg-gray-200 rounded-lg animate-pulse h-10 w-20"></div>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {[...Array(limit)].map((_, index) => (
            <div key={index} className="bg-gray-200 animate-pulse p-6 rounded-xl h-32"></div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full py-8 mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center mb-2">
            <BookOpen className="w-5 h-5 text-red-500 mr-2" />
            <h3 className="text-lg font-medium text-red-800">Failed to Load Documentation</h3>
          </div>
          <p className="text-red-700 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (cards.length === 0) {
    return (
      <div className="w-full py-8 mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
        </div>
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Documentation Found</h3>
          <p className="text-gray-500">
            {category 
              ? `No documentation available for "${category}" category.` 
              : "No documentation has been published yet."
            }
          </p>
          {!showOnlyPublished && (
            <p className="text-sm text-gray-400 mt-2">
              Try enabling "Show Published Only" or check back later.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-8 mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
          {category && (
            <p className="text-sm text-gray-600 mt-1">
              Showing {cards.length} {category} documentation{cards.length !== 1 ? 's' : ''}
              {totalCount > cards.length && ` of ${totalCount} total`}
            </p>
          )}
        </div>
        {showViewAll && totalCount > cards.length && (
          <button
            onClick={handleViewAll}
            className="px-4 py-2 text-slate-600 hover:text-blue-600 border border-slate-300 hover:border-blue-300 rounded-lg transition-colors font-medium flex items-center gap-2"
          >
            View All ({totalCount})
            <ArrowRight size={16} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
        {cards.map((card) => {
          const gradientClasses = getCategoryColor(card.category);
          const categoryDisplayName = getCategoryDisplayName(card.category);
          
          return (
            <Link key={card._id} href={`/docs/${card.slug}`}>
              <div
                onClick={() => handleCardClick(card)}
                className={`group bg-gradient-to-br ${gradientClasses} text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-left relative overflow-hidden cursor-pointer`}
              >
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

                <div className="relative z-10">
                  {/* Header with category and status */}
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs bg-white/20 px-2 py-1 rounded-full font-medium">
                      {categoryDisplayName}
                    </span>
                    {!card.isPublished && (
                      <span className="text-xs bg-orange-500/80 px-2 py-1 rounded-full">
                        Draft
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-semibold group-hover:text-white/90 transition-colors mb-2 line-clamp-2">
                    {card.title}
                  </h3>
                  
                  {/* Description */}
                  {card.description && (
                    <p className="text-sm text-white/80 mb-3 line-clamp-2">
                      {card.description}
                    </p>
                  )}

                  {/* Footer with read time and date */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-xs text-white/70 space-x-3">
                      {card.readTime && (
                        <div className="flex items-center gap-1">
                          <Clock size={12} />
                          <span>{card.readTime}</span>
                        </div>
                      )}
                      <span>{formatDate(card.updatedAt)}</span>
                    </div>
                    
                    <div className="w-8 h-8 bg-white/20 group-hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-200 group-hover:translate-x-1">
                      <ArrowRight size={16} className="text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  );
}

// Pre-configured components for specific use cases
export function AllDocsTopicSection() {
  return (
    <TopicSection
      title="Latest Documentation"
      limit={8}
      showOnlyPublished={true}
    />
  );
}

export function ProgrammingDocsSection() {
  return (
    <TopicSection
      title="Programming Documentation"
      category="programming"
      limit={6}
      showOnlyPublished={true}
    />
  );
}

export function RecentDocsSection() {
  return (
    <TopicSection
      title="Recently Updated"
      limit={4}
      showOnlyPublished={true}
    />
  );
}

// Component for admin dashboard (shows drafts too)
export function AdminDocsSection() {
  return (
    <TopicSection
      title="All Documentation (Admin View)"
      limit={12}
      showOnlyPublished={false}
    />
  );
}