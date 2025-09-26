// app/courses/page.tsx
"use client"
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Star, BarChart3, Loader2, ChevronDown, Grid, List, Filter } from 'lucide-react';

interface CourseData {
  _id: string;
  title: string;
  description?: string;
  level: string;
  rating: number;
  studentCount: number;
  duration?: string;
  instructor?: string;
  bgColor?: string;
  price?: number;
  isPremium: boolean;
  slug?: string;
  categoryId: {
    _id: string;
    title: string;
    slug: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Category {
  _id: string;
  title: string;
  slug: string;
}

export default function CoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCourses, setTotalCourses] = useState(0);
  const coursesPerPage = 12;

  // Fetch courses function
  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: coursesPerPage.toString(),
        ...(selectedCategory && { categoryId: selectedCategory }),
        ...(selectedLevel && { level: selectedLevel }),
        ...(searchQuery && { search: searchQuery })
      });

      const response = await fetch(`/api/courses?${params}`);
      const data = await response.json();

      if (data.success) {
        setCourses(data.data);
        setTotalPages(data.pagination?.pages || 1);
        setTotalCourses(data.pagination?.total || 0);
      } else {
        setError(data.error || 'Failed to fetch courses');
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories?activeOnly=true');
      const data = await response.json();
      
      if (data.success) {
        setCategories(data.data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  // Effects
  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [currentPage, selectedCategory, selectedLevel, searchQuery]);

  // Event handlers
  const handleCourseClick = (course: CourseData) => {
      router.push(`/courses/${course._id}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchCourses();
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedLevel('');
    setSortBy('latest');
    setCurrentPage(1);
  };

  // Utility functions
  const formatLevel = (level: string) => {
    switch (level) {
      case 'BEGINNER_TO_ADVANCE':
        return 'Beginner to Advance';
      case 'INTERMEDIATE':
        return 'Intermediate';
      case 'ADVANCED':
        return 'Advanced';
      case 'BEGINNER':
        return 'Beginner';
      default:
        return level;
    }
  };

  const getDefaultBgColor = (index: number) => {
    const colors = [
      "bg-gradient-to-br from-emerald-400 to-green-500",
      "bg-gradient-to-br from-indigo-400 to-purple-500",
      "bg-gradient-to-br from-teal-500 to-cyan-600",
      "bg-gradient-to-br from-orange-400 to-red-500",
      "bg-gradient-to-br from-pink-400 to-rose-500",
      "bg-gradient-to-br from-violet-400 to-purple-600"
    ];
    return colors[index % colors.length];
  };

  const renderCourseImage = (course: CourseData, index: number) => {
    const bgColor = course.bgColor || getDefaultBgColor(index);
    
    return (
      <div className={`${bgColor} relative overflow-hidden ${
        viewMode === 'list' ? 'w-48 h-32 rounded-l-lg flex-shrink-0' : 'h-40 rounded-t-lg'
      } flex items-center justify-center text-white`}>
        {/* Rating badge */}
        <div className="absolute top-2 right-2 bg-black/20 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          <span className="text-xs font-medium">{course.rating.toFixed(1)}</span>
        </div>

        {/* Premium badge */}
        {course.isPremium && (
          <div className="absolute top-2 left-2 bg-yellow-500/90 backdrop-blur-sm rounded-full px-2 py-1">
            <span className="text-xs font-bold text-white">PREMIUM</span>
          </div>
        )}

        {/* Course content */}
        <div className="text-center px-4">
          <div className={`${viewMode === 'list' ? 'text-lg' : 'text-xl'} font-bold mb-1`}>
            {course.categoryId.title}
          </div>
          <div className={`${viewMode === 'list' ? 'text-sm' : 'text-base'} opacity-90`}>
            Development
          </div>
          {course.studentCount > 0 && (
            <div className="text-xs opacity-80 mt-1">{course.studentCount.toLocaleString()} students</div>
          )}
        </div>
      </div>
    );
  };

  // Sort courses
  const sortedCourses = [...courses].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return b.studentCount - a.studentCount;
      case 'rating':
        return b.rating - a.rating;
      case 'price-low':
        return (a.price || 0) - (b.price || 0);
      case 'price-high':
        return (b.price || 0) - (a.price || 0);
      case 'latest':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">All Courses</h1>
          <p className="text-xl text-blue-100 max-w-2xl">
            Explore our comprehensive collection of courses designed to help you master new skills and advance your career.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search courses..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-4 py-1.5 rounded-md hover:bg-blue-700 transition-colors"
              >
                Search
              </button>
            </div>
          </form>

          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-4 items-center">
              {/* Category Filter */}
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.title}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              {/* Level Filter */}
              <div className="relative">
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Levels</option>
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                  <option value="BEGINNER_TO_ADVANCE">Beginner to Advance</option>
                </select>
                <ChevronDown size={16} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              {/* Sort By */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="latest">Latest</option>
                  <option value="popular">Most Popular</option>
                  <option value="rating">Highest Rated</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
                <ChevronDown size={16} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              {/* Clear Filters */}
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors flex items-center gap-2"
              >
                <Filter size={16} />
                Clear All
              </button>
            </div>

            {/* View Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Grid size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            Showing {sortedCourses.length} of {totalCourses} courses
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="flex items-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-3" />
              <span className="text-gray-600">Loading courses...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Courses Grid/List */}
        {!loading && !error && (
          <>
            <div className={
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-4'
            }>
              {sortedCourses.map((course, index) => (
                <div
                  key={course._id}
                  className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer transform hover:-translate-y-1 ${
                    viewMode === 'list' ? 'flex' : 'block'
                  }`}
                  onClick={() => handleCourseClick(course)}
                >
                  {/* Course Image */}
                  {renderCourseImage(course, index)}

                  {/* Course Info */}
                  <div className={`p-5 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 leading-tight line-clamp-2">
                      {course.title}
                    </h3>

                    {/* Description if available */}
                    {course.description && (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {course.description}
                      </p>
                    )}

                    {/* Level and Duration */}
                    <div className={`flex items-center ${viewMode === 'list' ? 'justify-between' : 'gap-2'} text-gray-600 mb-4`}>
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" />
                        <span className="text-sm">{formatLevel(course.level)}</span>
                      </div>
                      {course.duration && (
                        <span className="text-sm">{course.duration}</span>
                      )}
                    </div>

                    {/* Instructor */}
                    {course.instructor && (
                      <p className="text-sm text-gray-500 mb-4">
                        by {course.instructor}
                      </p>
                    )}

                    {/* Bottom section */}
                    <div className="flex justify-between items-center">
                      <button 
                        className="text-green-600 font-medium text-sm hover:text-green-700 transition-colors duration-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCourseClick(course);
                        }}
                      >
                        Explore now
                      </button>
                      {course.price && course.price > 0 ? (
                        <span className="text-gray-800 font-semibold">₹{course.price.toLocaleString()}</span>
                      ) : (
                        <span className="text-green-600 font-semibold">Free</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {sortedCourses.length === 0 && (
              <div className="text-center py-12">
                <BarChart3 size={64} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No courses found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your search or filter criteria</p>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-12">
                <nav className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 text-sm font-medium rounded-md ${
                          currentPage === page
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}