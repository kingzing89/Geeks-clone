export interface SearchSuggestion {
    text: string;
    type: 'course' | 'documentation' | 'category' | 'keyword';
    count?: number;
  }
  
  export interface SearchResult {
    id: string;
    title: string;
    description?: string;
    type: 'course' | 'documentation' | 'category';
    slug: string;
    category?: {
      title: string;
      slug: string;
    };
    rating?: number;
    studentCount?: number;
    level?: string;
    bgColor?: string;
    icon?: string;
  }
  
  export interface SearchData {
    courses: SearchResult[];
    documentation: SearchResult[];
    categories: SearchResult[];
    total: number;
  }
  
  export interface SearchResponse {
    success: boolean;
    data?: SearchData;
    error?: string;
    message?: string;
  }
  
  export interface SuggestionsResponse {
    success: boolean;
    data?: SearchSuggestion[];
    error?: string;
  }
  
  // Get search suggestions
  export const getSearchSuggestions = async (
    query: string,
    limit?: number
  ): Promise<SuggestionsResponse> => {
    try {
      const params = new URLSearchParams({
        q: query,
        ...(limit && { limit: limit.toString() })
      });
  
      const response = await fetch(`/api/search/suggestions?${params}`);
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch suggestions');
      }
  
      return data;
    } catch (error) {
      console.error('Suggestions error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch suggestions'
      };
    }
  };
  
  // Search across courses, documentation, and categories
  export const searchContent = async (
    query: string,
    options?: { limit?: number; type?: 'course' | 'documentation' | 'category' }
  ): Promise<SearchResponse> => {
    try {
      const params = new URLSearchParams({ q: query });
      if (options?.limit) params.set('limit', String(options.limit));
      if (options?.type) params.set('type', options.type);
  
      const response = await fetch(`/api/search?${params}`);
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || 'Failed to search content');
      }
  
      return data as SearchResponse;
    } catch (error) {
      console.error('Search error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to search content'
      };
    }
  };
  
  // Debounce utility for search input
  export const debounce = <T extends (...args: any[]) => void>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };





