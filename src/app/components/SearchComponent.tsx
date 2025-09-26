// components/SearchComponent.tsx
"use client"

import { useState, useEffect, useRef } from 'react';
import { Search, X, Clock, TrendingUp, FileText, GraduationCap, FolderOpen, Hash } from 'lucide-react';
import { searchContent, getSearchSuggestions, debounce, SearchResult, SearchData, SearchSuggestion } from '@/lib/searchApi';

interface SearchComponentProps {
  placeholder?: string;
  onResultSelect?: (result: SearchResult) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const SearchResultItem = ({ 
  result, 
  onSelect,
  highlight 
}: { 
  result: SearchResult; 
  onSelect: () => void;
  highlight: string;
}) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'course':
        return <GraduationCap size={16} className="text-blue-600" />;
      case 'documentation':
        return <FileText size={16} className="text-green-600" />;
      case 'category':
        return <FolderOpen size={16} className="text-purple-600" />;
      default:
        return <Hash size={16} className="text-gray-600" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'course': return 'Course';
      case 'documentation': return 'Documentation';
      case 'category': return 'Category';
      default: return 'Content';
    }
  };

  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    
    const regex = new RegExp(`(${highlight})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} className="bg-yellow-200 text-yellow-900 rounded px-0.5">
          {part}
        </span>
      ) : part
    );
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
              {highlightText(result.title, highlight)}
            </h3>
            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full flex-shrink-0">
              {getTypeLabel(result.type)}
            </span>
          </div>
          {result.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {highlightText(result.description, highlight)}
            </p>
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

const SuggestionItem = ({ 
  suggestion, 
  onSelect 
}: { 
  suggestion: SearchSuggestion; 
  onSelect: () => void;
}) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'course': return <GraduationCap size={14} className="text-blue-500" />;
      case 'documentation': return <FileText size={14} className="text-green-500" />;
      case 'category': return <FolderOpen size={14} className="text-purple-500" />;
      case 'keyword': return <TrendingUp size={14} className="text-orange-500" />;
      default: return <Hash size={14} className="text-gray-500" />;
    }
  };

  return (
    <button
      onClick={onSelect}
      className="w-full text-left p-2 hover:bg-gray-50 flex items-center gap-2 text-sm text-gray-700 transition-colors"
    >
      {getIcon(suggestion.type)}
      <span>{suggestion.text}</span>
    </button>
  );
};

export default function SearchComponent({
  placeholder = "Search for tutorials, courses, or topics...",
  onResultSelect,
  className = "",
  size = "lg"
}: SearchComponentProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SearchData | null>(null);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Load recent searches from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved).slice(0, 5));
      } catch (error) {
        console.error('Failed to load recent searches:', error);
      }
    }
  }, []);

  // Save search to recent searches
  const saveToRecentSearches = (query: string) => {
    if (!query.trim()) return;
    
    const updated = [query, ...recentSearches.filter(q => q !== query)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  // Debounced search function
  const debouncedSearch = debounce(async (query: string) => {
    if (!query.trim()) {
      setSearchResults(null);
      setSuggestions([]);
      return;
    }

    if (query.length < 2) {
      // Show suggestions for short queries
      try {
        const response = await getSearchSuggestions(query, 8);
        if (response.success && response.data) {
          setSuggestions(response.data);
        }
      } catch (error) {
        console.error('Suggestions error:', error);
      }
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      // Get both search results and suggestions
      const [searchResponse, suggestionsResponse] = await Promise.all([
        searchContent(query, { limit: 15 }),
        getSearchSuggestions(query, 5)
      ]);
      
      if (searchResponse.success && searchResponse.data) {
        setSearchResults(searchResponse.data);
      } else {
        setSearchError(searchResponse.error || 'Search failed');
        setSearchResults(null);
      }

      if (suggestionsResponse.success && suggestionsResponse.data) {
        setSuggestions(suggestionsResponse.data);
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
    setShowDropdown(true);
    debouncedSearch(value);
  };

  // Handle search result selection
  const handleSearchResultSelect = (result: SearchResult) => {
    saveToRecentSearches(searchQuery);
    setShowDropdown(false);
    
    if (onResultSelect) {
      onResultSelect(result);
    } else {
      // Default navigation
      const baseUrl = result.type === 'course' ? '/courses' : 
                     result.type === 'documentation' ? '/docs' : 
                     '/categories';
      window.location.href = `${baseUrl}/${result.slug}`;
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    setSearchQuery(suggestion.text);
    setShowDropdown(true);
    debouncedSearch(suggestion.text);
  };

  // Handle recent search selection
  const handleRecentSearchSelect = (query: string) => {
    setSearchQuery(query);
    setShowDropdown(true);
    debouncedSearch(query);
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults(null);
    setSuggestions([]);
    setShowDropdown(false);
    setSearchError(null);
  };

  // Handle input focus
  const handleInputFocus = () => {
    setShowDropdown(true);
    if (!searchQuery && recentSearches.length > 0) {
      // Show recent searches when focused with empty query
    } else if (searchQuery) {
      debouncedSearch(searchQuery);
    }
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setShowDropdown(false);
      searchInputRef.current?.blur();
    } else if (e.key === 'Enter' && searchQuery.trim()) {
      saveToRecentSearches(searchQuery);
      // You can add Enter key search logic here
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-4 py-2 text-sm';
      case 'md':
        return 'px-5 py-3 text-base';
      case 'lg':
      default:
        return 'px-6 py-4 text-lg';
    }
  };

  const hasResults = searchResults && (
    searchResults.courses.length > 0 || 
    searchResults.documentation.length > 0 || 
    searchResults.categories.length > 0
  );

  return (
    <div className={`relative ${className}`} ref={searchContainerRef}>
      <div className="relative">
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full ${getSizeClasses()} text-slate-900 bg-white rounded-xl shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-100 pr-20 transition-all`}
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

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 max-h-96 overflow-y-auto z-50">
          {searchError ? (
            <div className="p-4 text-center text-red-600">
              {searchError}
            </div>
          ) : !searchQuery.trim() && recentSearches.length > 0 ? (
            /* Recent Searches */
            <div>
              <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                <Clock size={14} className="text-gray-500" />
                <h3 className="text-sm font-medium text-gray-700">Recent Searches</h3>
              </div>
              {recentSearches.map((query, index) => (
                <button
                  key={index}
                  onClick={() => handleRecentSearchSelect(query)}
                  className="w-full text-left p-3 hover:bg-gray-50 flex items-center gap-2 text-sm text-gray-700 transition-colors"
                >
                  <Clock size={14} className="text-gray-400" />
                  <span>{query}</span>
                </button>
              ))}
            </div>
          ) : searchQuery.length < 2 && suggestions.length > 0 ? (
            /* Suggestions for short queries */
            <div>
              <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                <h3 className="text-sm font-medium text-gray-700">Suggestions</h3>
              </div>
              {suggestions.map((suggestion, index) => (
                <SuggestionItem
                  key={index}
                  suggestion={suggestion}
                  onSelect={() => handleSuggestionSelect(suggestion)}
                />
              ))}
            </div>
          ) : hasResults ? (
            /* Search Results */
            <div>
              {/* Categories */}
              {searchResults!.categories.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                    <h3 className="text-sm font-medium text-gray-700">Categories</h3>
                  </div>
                  {searchResults!.categories.map(result => (
                    <SearchResultItem
                      key={result.id}
                      result={result}
                      highlight={searchQuery}
                      onSelect={() => handleSearchResultSelect(result)}
                    />
                  ))}
                </div>
              )}

              {/* Courses */}
              {searchResults!.courses.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                    <h3 className="text-sm font-medium text-gray-700">Courses</h3>
                  </div>
                  {searchResults!.courses.map(result => (
                    <SearchResultItem
                      key={result.id}
                      result={result}
                      highlight={searchQuery}
                      onSelect={() => handleSearchResultSelect(result)}
                    />
                  ))}
                </div>
              )}

              {/* Documentation */}
              {searchResults!.documentation.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                    <h3 className="text-sm font-medium text-gray-700">Documentation</h3>
                  </div>
                  {searchResults!.documentation.map(result => (
                    <SearchResultItem
                      key={result.id}
                      result={result}
                      highlight={searchQuery}
                      onSelect={() => handleSearchResultSelect(result)}
                    />
                  ))}
                </div>
              )}

              {/* Quick suggestions at bottom */}
              {suggestions.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                    <h3 className="text-sm font-medium text-gray-700">Related</h3>
                  </div>
                  {suggestions.slice(0, 3).map((suggestion, index) => (
                    <SuggestionItem
                      key={index}
                      suggestion={suggestion}
                      onSelect={() => handleSuggestionSelect(suggestion)}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : searchQuery.trim() && searchResults && searchResults.total === 0 ? (
            /* No Results */
            <div className="p-6 text-center">
              <Search size={48} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-2">No results found for "{searchQuery}"</p>
              <p className="text-sm text-gray-400">Try searching for something else</p>
              {suggestions.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Did you mean:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {suggestions.slice(0, 3).map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionSelect(suggestion)}
                        className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm hover:bg-blue-100 transition-colors"
                      >
                        {suggestion.text}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}