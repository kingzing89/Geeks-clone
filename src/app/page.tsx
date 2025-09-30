"use client"

import { Search, BookOpen, Code, Database, Brain, Globe, Server, Laptop, Users, Award, LucideIcon, X, FileText, GraduationCap, FolderOpen } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import Explore from './components/ExploreComponent';
import Courses from './components/Courses';
import TopicSection from './components/TopicSection';
import Footer from './components/Footer';
import { getAllCategories } from '@/lib/categoryApi';
import { searchContent, debounce, SearchResult, SearchData } from '@/lib/searchApi';

// Icon mapping for dynamic categories
const iconMap: Record<string, LucideIcon> = {
  Code,
  Database,
  Brain,
  Globe,
  Server,
  Laptop,
  Users,
  BookOpen,
  Award
};

interface CategoryData {
  title: string;
  icon: LucideIcon;
  slug: string;
  description?: string;
  bgColor?: string;
}

const SearchResultItem = ({ result, onSelect }: { result: SearchResult; onSelect: () => void }) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'course':
        return <GraduationCap size={16} className="text-blue-600" />;
      case 'documentation':
        return <FileText size={16} className="text-green-600" />;
      case 'category':
        return <FolderOpen size={16} className="text-purple-600" />;
      default:
        return <BookOpen size={16} className="text-gray-600" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'course':
        return 'Course';
      case 'documentation':
        return 'Documentation';
      case 'category':
        return 'Category';
      default:
        return 'Content';
    }
  };

  return (
    <button
      onClick={onSelect}
      className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 group transition-colors"
    >
      <div className="flex items-start gap-3">
        <div className="mt-1">
          {getTypeIcon(result.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-gray-900 group-hover:text-blue-600 truncate">
              {result.title}
            </h3>
            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full flex-shrink-0">
              {getTypeLabel(result.type)}
            </span>
          </div>
          {result.description && (
            <p className="text-sm text-gray-600 line-clamp-2">{result.description}</p>
          )}
          {result.category && (
            <p className="text-xs text-gray-500 mt-1">
              in {result.category.title}
            </p>
          )}
          {result.type === 'course' && (result.rating || result.studentCount) && (
            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
              {result.rating && <span>★ {result.rating}</span>}
              {result.studentCount && <span>{result.studentCount} students</span>}
            </div>
          )}
        </div>
      </div>
    </button>
  );
};

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Search states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SearchData | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [showSearchResults, setShowSearchResults] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // // Static fallback categories
  // const fallbackCategories: CategoryData[] = [
  //   { title: 'Algorithms', icon: Code, slug: 'algorithms' },
  //   { title: 'Data Structures', icon: Database, slug: 'data-structures' },
  //   { title: 'Machine Learning', icon: Brain, slug: 'machine-learning' },
  //   { title: 'Web Development', icon: Globe, slug: 'web-development' },
  //   { title: 'System Design', icon: Server, slug: 'system-design' },
  //   { title: 'Programming', icon: Laptop, slug: 'programming' },
  //   { title: 'DevOps', icon: Users, slug: 'devops' },
  //   { title: 'Courses', icon: BookOpen, slug: 'courses' }
  // ];


  // Debounced search function
  const debouncedSearch = debounce(async (query: string) => {
    if (!query.trim()) {
      setSearchResults(null);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      const response = await searchContent(query, { limit: 15 });
      
      if (response.success && response.data) {
        setSearchResults(response.data);
        setShowSearchResults(true);
      } else {
        setSearchError(response.error || 'Search failed');
        setSearchResults(null);
      }
    } catch (err) {
      setSearchError('Search failed');
      setSearchResults(null);
    } finally {
      setIsSearching(false);
    }
  }, 300);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    debouncedSearch(value);
  };

  // Handle search result selection
  const handleSearchResultSelect = (result: SearchResult) => {
    // Navigate based on result type
    const baseUrl = result.type === 'course' ? '/courses' : 
                   result.type === 'documentation' ? '/docs' : 
                   '/categories';
    
    window.location.href = `${baseUrl}/${result.slug}`;
  };

  // Handle popular course click
  const handlePopularCourseClick = (courseName: string) => {
    setSearchQuery(courseName);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
    debouncedSearch(courseName);
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults(null);
    setShowSearchResults(false);
    setSearchError(null);
  };

  // Handle click outside search
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch categories from API
  useEffect(() => {
    async function fetchCategories() {
      try {
        setLoading(true);
        const response = await getAllCategories();
        
        if (response.success && Array.isArray(response.data) && response.data.length > 0) {
          const mappedCategories: CategoryData[] = response.data.map(category => ({
            title: category.title,
            icon: iconMap[category.icon || 'BookOpen'] || BookOpen,
            slug: category.slug,
            description: category.description,
            bgColor: category.bgColor
          }));
          setCategories(mappedCategories);
        } 
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:col-span-3">
          <div className="bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50 rounded-2xl shadow-xl p-8 md:p-12 mb-8 text-slate-900">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Hello, What Do You Want To Learn?
              </h1>

              {/* Search Container */}
              <div className="relative mb-8" ref={searchContainerRef}>
                <div className="relative">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onFocus={() => searchResults && setShowSearchResults(true)}
                    placeholder="Search for tutorials, courses, or topics..."
                    className="w-full px-6 py-4 text-slate-900 bg-white rounded-xl shadow-lg focus:outline-none focus:ring-4 focus:ring-white/20 text-lg pr-20"
                  />
                  
                  {/* Search/Clear Button */}
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                    {searchQuery && (
                      <button
                        onClick={clearSearch}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <X size={16} className="text-gray-500" />
                      </button>
                    )}
                    <button className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors">
                      {isSearching ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      ) : (
                        <Search size={20} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Search Results Dropdown */}
                {showSearchResults && (searchResults || searchError) && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 max-h-96 overflow-y-auto z-50">
                    {searchError ? (
                      <div className="p-4 text-center text-red-600">
                        {searchError}
                      </div>
                    ) : searchResults ? (
                      <div>
                        {/* Categories */}
                        {searchResults.categories.length > 0 && (
                          <div>
                            <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                              <h3 className="text-sm font-medium text-gray-700">Categories</h3>
                            </div>
                            {searchResults.categories.map(result => (
                              <SearchResultItem
                                key={result.id}
                                result={result}
                                onSelect={() => handleSearchResultSelect(result)}
                              />
                            ))}
                          </div>
                        )}

                        {/* Courses */}
                        {searchResults.courses.length > 0 && (
                          <div>
                            <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                              <h3 className="text-sm font-medium text-gray-700">Courses</h3>
                            </div>
                            {searchResults.courses.map(result => (
                              <SearchResultItem
                                key={result.id}
                                result={result}
                                onSelect={() => handleSearchResultSelect(result)}
                              />
                            ))}
                          </div>
                        )}

                        {/* Documentation */}
                        {searchResults.documentation.length > 0 && (
                          <div>
                            <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                              <h3 className="text-sm font-medium text-gray-700">Documentation</h3>
                            </div>
                            {searchResults.documentation.map(result => (
                              <SearchResultItem
                                key={result.id}
                                result={result}
                                onSelect={() => handleSearchResultSelect(result)}
                              />
                            ))}
                          </div>
                        )}

                        {/* No Results */}
                        {searchResults.total === 0 && (
                          <div className="p-4 text-center text-gray-500">
                            No results found for "{searchQuery}"
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading categories...</p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-700">Failed to load categories: {error}</p>
            <p className="text-sm text-red-600 mt-1">
              Using default categories instead.
            </p>
          </div>
        )}

        <Explore categories={categories} />
        <Courses />
        <TopicSection limit={6} />
        <Footer />
      </div>
    </div>
  );
}