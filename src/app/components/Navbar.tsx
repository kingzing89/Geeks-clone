// components/Navbar.tsx
"use client"

import { Search, Menu, Code, X, Database, Brain, Globe, Server, Laptop, Users, BookOpen, User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface NavbarProps {
  onMenuToggle: (isOpen: boolean) => void;
}

interface UserData {
  id: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  role: 'USER' | 'ADMIN' | 'INSTRUCTOR';
  avatar?: string;
}

interface Category {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  bgColor?: string;
  icon?: string;
  order?: number;
  isActive: boolean;
}

interface CategoryResponse {
  success: boolean;
  data?: Category[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  error?: string;
  message?: string;
}

interface Course {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  thumbnail?: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  categoryId: {
    _id: string;
    title: string;
    slug: string;
  };
  rating?: number;
  studentCount?: number;
  isPublished: boolean;
}

interface CourseResponse {
  success: boolean;
  data?: Course[];
  pagination?: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
  error?: string;
}

interface Documentation {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  category: {
    _id: string;
    title: string;
    slug: string;
    bgColor?: string;
    icon?: string;
  };
  documentSections?: Array<{
    _id: string;
    title: string;
    slug: string;
    description?: string;
    isPublished: boolean;
  }>;
  isPublished: boolean;
}

interface DocumentationResponse {
  success: boolean;
  data?: Documentation[];
  error?: string;
}

export default function Navbar({ onMenuToggle }: NavbarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showTutorialsDropdown, setShowTutorialsDropdown] = useState(false);
  const [showCoursesDropdown, setShowCoursesDropdown] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [documentation, setDocumentation] = useState<Documentation[]>([]);
  const [documentationLoading, setDocumentationLoading] = useState(true);
  
  // Refs for dropdown management
  const tutorialsDropdownRef = useRef<HTMLDivElement>(null);
  const coursesDropdownRef = useRef<HTMLDivElement>(null);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    username: '',
    rememberMe: false
  });

  // Default icon mapping for categories
  const getIconForCategory = (categoryTitle: string, iconName?: string) => {
    // If custom icon is provided, you can extend this to handle custom icons
    const iconMap: { [key: string]: any } = {
      'algorithms': Code,
      'data structures': Database,
      'machine learning': Brain,
      'artificial intelligence': Brain,
      'web development': Globe,
      'system design': Server,
      'programming': Laptop,
      'devops': Users,
      'courses': BookOpen,
      'database': Database,
      'javascript': Code,
      'python': Code,
      'react': Code,
      'node.js': Server,
    };

    const normalizedTitle = categoryTitle.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
    return iconMap[normalizedTitle] || Code; // Default to Code icon
  };

  // Get category color - Updated function
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
      'machine-learning': 'bg-slate-400 hover:bg-slate-500',
      'machine learning': 'bg-slate-400 hover:bg-slate-500',
      'system-design': 'bg-cyan-400 hover:bg-cyan-500',
      'system design': 'bg-cyan-400 hover:bg-cyan-500',
      'devops': 'bg-pink-400 hover:bg-pink-500',
      'courses': 'bg-teal-400 hover:bg-teal-500',
    };
    
    const normalizedCategory = categoryName.toLowerCase().replace(/\s+/g, '-');
    return colors[normalizedCategory] || 'bg-slate-400 hover:bg-slate-500';
  };

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      const response = await fetch('/api/categories');
      const data: CategoryResponse = await response.json();
      
      if (data.success && data.data) {
        setCategories(data.data);
      } else {
        console.error('Failed to fetch categories:', data.error);
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Fetch courses from API
  const fetchCourses = async () => {
    try {
      setCoursesLoading(true);
      const response = await fetch('/api/courses?limit=8&featured=true');
      const data: CourseResponse = await response.json();
      
      if (data.success && data.data) {
        setCourses(data.data);
      } else {
        console.error('Failed to fetch courses:', data.error);
        setCourses([]);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses([]);
    } finally {
      setCoursesLoading(false);
    }
  };

  // Fetch documentation from API
  const fetchDocumentation = async () => {
    try {
      setDocumentationLoading(true);
      const response = await fetch('/api/documentation?fields=title,slug,description,category');
      const data: DocumentationResponse = await response.json();
      
      if (data.success && data.data) {
        setDocumentation(data.data);
      } else {
        console.error('Failed to fetch documentation:', data.error);
        setDocumentation([]);
      }
    } catch (error) {
      console.error('Error fetching documentation:', error);
      setDocumentation([]);
    } finally {
      setDocumentationLoading(false);
    }
  };

  // Check for existing authentication on component mount
  useEffect(() => {
    // Set client flag to true after component mounts
    setIsClient(true);
    
    // Fetch data
    fetchCategories();
    fetchCourses();
    fetchDocumentation();
    
    // Only access localStorage after confirming we're on the client
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserProfile();
    }
  }, []);

  // Handle clicks outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tutorialsDropdownRef.current && !tutorialsDropdownRef.current.contains(event.target as Node)) {
        setShowTutorialsDropdown(false);
      }
      if (coursesDropdownRef.current && !coursesDropdownRef.current.contains(event.target as Node)) {
        setShowCoursesDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        // Token is invalid, remove it
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      localStorage.removeItem('token');
    }
  };

  const handleMenuToggle = () => {
    const newMenuState = !isMenuOpen;
    setIsMenuOpen(newMenuState);
    onMenuToggle(newMenuState);
  };

  const openAuthModal = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    setShowAuthModal(true);
    setError('');
    setFormData({ email: '', password: '', firstName: '', lastName: '', username: '', rememberMe: false });
  };

  const closeAuthModal = () => {
    setShowAuthModal(false);
    setError('');
    setFormData({ email: '', password: '', firstName: '', lastName: '', username: '', rememberMe: false });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const endpoint = authMode === 'signin' ? '/api/auth/login' : '/api/auth/register';
      const payload = authMode === 'signin' 
        ? { email: formData.email, password: formData.password }
        : {
            email: formData.email,
            password: formData.password,
            firstName: formData.firstName,
            lastName: formData.lastName,
            username: formData.username
          };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        // Store token and user data
        localStorage.setItem('token', data.token);
        setUser(data.user);
        closeAuthModal();
        
        // Show success message (optional)
        console.log(`${authMode === 'signin' ? 'Login' : 'Registration'} successful!`);
      } else {
        setError(data.error || 'Authentication failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Auth error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setShowUserMenu(false);
  };

  const getUserDisplayName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user?.firstName) {
      return user.firstName;
    }
    if (user?.username) {
      return user.username;
    }
    return user?.email?.split('@')[0] || 'User';
  };

  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case 'BEGINNER':
        return 'bg-green-100 text-green-800';
      case 'INTERMEDIATE':
        return 'bg-yellow-100 text-yellow-800';
      case 'ADVANCED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
           
            <div className="flex items-center space-x-8">
              <button 
                className="md:hidden p-2 rounded-md text-slate-600 hover:bg-slate-100"
                onClick={handleMenuToggle}
              >
                <Menu size={20} />
              </button>
              
              <nav className="hidden md:flex items-center space-x-6">
                {/* Tutorials Dropdown */}
                <div className="relative group" ref={tutorialsDropdownRef}>
                  <button 
                    className="flex items-center text-slate-700 hover:text-blue-600 font-medium transition-colors"
                    onClick={() => setShowTutorialsDropdown(!showTutorialsDropdown)}
                  >
                    Tutorials
                    <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${showTutorialsDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {/* Tutorials Dropdown Menu */}
                  {showTutorialsDropdown && (
                    <div className="absolute top-full left-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-slate-200 py-4 z-50">
                      <div className="px-4 pb-3 border-b border-slate-200">
                        <h3 className="text-sm font-semibold text-slate-900">Documentation & Tutorials</h3>
                      </div>
                      
                      <div className="max-h-80 overflow-y-auto">
                        {documentationLoading ? (
                          <div className="px-4 py-6">
                            {Array.from({ length: 3 }).map((_, index) => (
                              <div key={index} className="animate-pulse mb-4">
                                <div className="h-4 bg-slate-300 rounded mb-2"></div>
                                <div className="h-3 bg-slate-200 rounded w-3/4"></div>
                              </div>
                            ))}
                          </div>
                        ) : documentation.length > 0 ? (
                          <div className="py-2">
                            {documentation.map((doc) => {
                              const IconComponent = getIconForCategory(doc.category?.title || 'default');
                              return (
                                <Link
                                  key={doc._id}
                                  href={`/docs/${doc.slug}`}
                                  className="flex items-start px-4 py-3 hover:bg-slate-50 transition-colors"
                                  onClick={() => setShowTutorialsDropdown(false)}
                                >
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 mt-1 ${getCategoryColor(doc.category?.title || 'default')}`}>
                                    <IconComponent size={16} className="text-white" />
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="text-sm font-medium text-slate-900 mb-1">{doc.title}</h4>
                                    <p className="text-xs text-slate-500 line-clamp-2">{doc.description}</p>
                                    {doc.category && (
                                      <span className="inline-block mt-1 text-xs text-blue-600 font-medium">
                                        {doc.category.title}
                                      </span>
                                    )}
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="px-4 py-6 text-center">
                            <p className="text-sm text-slate-500">No tutorials available</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Courses Dropdown */}
                <div className="relative group" ref={coursesDropdownRef}>
                  <button 
                    className="flex items-center text-slate-700 hover:text-blue-600 font-medium transition-colors"
                    onClick={() => setShowCoursesDropdown(!showCoursesDropdown)}
                  >
                    Courses
                    <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${showCoursesDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {/* Courses Dropdown Menu */}
                  {showCoursesDropdown && (
                    <div className="absolute top-full left-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-slate-200 py-4 z-50">
                      <div className="px-4 pb-3 border-b border-slate-200">
                        <h3 className="text-sm font-semibold text-slate-900">Featured Courses</h3>
                      </div>
                      
                      <div className="max-h-80 overflow-y-auto">
                        {coursesLoading ? (
                          <div className="px-4 py-6">
                            {Array.from({ length: 3 }).map((_, index) => (
                              <div key={index} className="animate-pulse mb-4">
                                <div className="h-4 bg-slate-300 rounded mb-2"></div>
                                <div className="h-3 bg-slate-200 rounded w-3/4 mb-2"></div>
                                <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                              </div>
                            ))}
                          </div>
                        ) : courses.length > 0 ? (
                          <div className="py-2">
                            {courses.map((course) => {
                              const IconComponent = getIconForCategory(course.categoryId?.title || 'default');
                              return (
                                <Link
                                  key={course._id}
                                  href={`/courses/${course._id}`}
                                  className="flex items-start px-4 py-3 hover:bg-slate-50 transition-colors"
                                  onClick={() => setShowCoursesDropdown(false)}
                                >
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 mt-1 ${getCategoryColor(course.categoryId?.title || 'default')}`}>
                                    <IconComponent size={16} className="text-white" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-start justify-between">
                                      <h4 className="text-sm font-medium text-slate-900 mb-1 flex-1">{course.title}</h4>
                                      <span className={`text-xs px-2 py-1 rounded ml-2 ${getLevelBadgeColor(course.level)}`}>
                                        {course.level.toLowerCase()}
                                      </span>
                                    </div>
                                    <p className="text-xs text-slate-500 line-clamp-2 mb-1">{course.description}</p>
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs text-blue-600 font-medium">
                                        {course.categoryId?.title}
                                      </span>
                                      <div className="flex items-center space-x-2 text-xs text-slate-400">
                                        {course.rating && (
                                          <span>★ {course.rating.toFixed(1)}</span>
                                        )}
                                        {course.studentCount && (
                                          <span>• {course.studentCount} students</span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </Link>
                              );
                            })}
                            <div className="px-4 py-2 border-t border-slate-200 mt-2">
                              <Link 
                                href="/courses" 
                                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                onClick={() => setShowCoursesDropdown(false)}
                              >
                                View all courses →
                              </Link>
                            </div>
                          </div>
                        ) : (
                          <div className="px-4 py-6 text-center">
                            <p className="text-sm text-slate-500">No courses available</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </nav>
            </div>

            {/* Logo */}
            <div className="absolute left-1/2 transform -translate-x-1/2 md:relative md:left-auto md:transform-none">
              <Link href="/" className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Code className="text-white" size={20} />
                </div>
                <span className="ml-2 text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  CodeLearn
                </span>
              </Link>
            </div>

            {/* Right Navigation */}
            <div className="flex items-center space-x-4">
              {/* Only render auth buttons after client-side hydration */}
              {isClient && (
                user ? (
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg transition-colors"
                    >
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        {user.avatar ? (
                          <img src={user.avatar} alt="Avatar" className="w-8 h-8 rounded-full" />
                        ) : (
                          <User className="text-white" size={16} />
                        )}
                      </div>
                      <span className="hidden md:block text-sm font-medium text-slate-700">
                        {getUserDisplayName()}
                      </span>
                      {user.role === 'ADMIN' && (
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">
                          Admin
                        </span>
                      )}
                      {user.role === 'INSTRUCTOR' && (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                          Instructor
                        </span>
                      )}
                    </button>

                    {/* User Dropdown Menu */}
                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-10">
                        <div className="px-4 py-2 border-b border-slate-200">
                          <p className="text-sm font-medium text-slate-900">{getUserDisplayName()}</p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                        
                        {user.role === 'ADMIN' && (
                          <Link href="/admin" className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">
                            <Users size={16} className="mr-2" />
                            Admin Panel
                          </Link>
                        )}
                        
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <LogOut size={16} className="mr-2" />
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <button 
                      onClick={() => openAuthModal('signup')}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      Sign Up
                    </button>
                    
                    <button 
                      onClick={() => openAuthModal('signin')}
                      className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors font-medium"
                    >
                      Sign In
                    </button>
                  </>
                )
              )}
            </div>
          </div>
        </div>

        {/* Dynamic Category Navigation */}
        <div className="border-t border-slate-200 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-8 py-3 overflow-x-auto">
              {categoriesLoading ? (
                // Loading skeleton for categories
                Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="flex items-center space-x-2 animate-pulse">
                    <div className="w-4 h-4 bg-slate-300 rounded"></div>
                    <div className="w-16 h-4 bg-slate-300 rounded"></div>
                  </div>
                ))
              ) : categories.length > 0 ? (
                categories.map((category) => {
                  const IconComponent = getIconForCategory(category.title, category.icon);
                  return (
                    <Link
                      key={category._id}
                      href={`/category/${category.slug}`}
                      className="flex items-center space-x-2 text-slate-600 hover:text-blue-600 whitespace-nowrap group transition-colors"
                    >
                      <IconComponent size={16} className="group-hover:text-blue-600" />
                      <span className="text-sm font-medium">{category.title}</span>
                    </Link>
                  );
                })
              ) : (
                // Fallback message when no categories are available
                <div className="text-sm text-slate-500 py-2">
                  No categories available
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Authentication Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 relative">
            {/* Close Button */}
            <button
              onClick={closeAuthModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="p-8">
              {/* Header */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {authMode === 'signin' ? 'Log in' : 'Sign up'}
                </h2>
                <p className="text-gray-600">
                  {authMode === 'signin' ? (
                    <>New user? <button onClick={() => setAuthMode('signup')} className="text-blue-600 hover:underline">Register Now</button></>
                  ) : (
                    <>Already have an account? <button onClick={() => setAuthMode('signin')} className="text-blue-600 hover:underline">Sign In</button></>
                  )}
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {authMode === 'signup' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          First Name
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          placeholder="First Name"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Last Name
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          placeholder="Last Name"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Username
                      </label>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        placeholder="Username (optional)"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter password"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {authMode === 'signin' && (
                  <div className="flex items-center justify-between">
                    <button type="button" className="text-sm text-blue-600 hover:underline">
                      Forgot password
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading 
                    ? (authMode === 'signin' ? 'Signing In...' : 'Signing Up...') 
                    : (authMode === 'signin' ? 'Sign In' : 'Sign Up')
                  }
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close user menu */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-5" 
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </>
  );
}