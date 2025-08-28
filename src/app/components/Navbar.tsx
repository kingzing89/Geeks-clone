// components/Navbar.tsx
"use client"

import { Search, Menu, Code, X, Database, Brain, Globe, Server, Laptop, Users, BookOpen } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

interface NavbarProps {
  onMenuToggle: (isOpen: boolean) => void;
}

export default function Navbar({ onMenuToggle }: NavbarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const handleMenuToggle = () => {
    const newMenuState = !isMenuOpen;
    setIsMenuOpen(newMenuState);
    onMenuToggle(newMenuState);
  };

  const openAuthModal = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const closeAuthModal = () => {
    setShowAuthModal(false);
    setFormData({ email: '', password: '', rememberMe: false });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = () => {
    console.log('Form submitted:', { ...formData, mode: authMode });
    closeAuthModal();
  };

  const categories = [
    { name: 'Algorithms', icon: Code, slug: 'algorithms' },
    { name: 'Data Structures', icon: Database, slug: 'data-structures' },
    { name: 'Machine Learning', icon: Brain, slug: 'machine-learning' },
    { name: 'Web Development', icon: Globe, slug: 'web-development' },
    { name: 'System Design', icon: Server, slug: 'system-design' },
    { name: 'Programming', icon: Laptop, slug: 'programming' },
    { name: 'DevOps', icon: Users, slug: 'devops' },
    { name: 'Courses', icon: BookOpen, slug: 'courses' }
  ];

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
                <div className="relative group">
                  <button className="flex items-center text-slate-700 hover:text-blue-600 font-medium">
                    Tutorials
                    <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
                
                <div className="relative group">
                  <button className="flex items-center text-slate-700 hover:text-blue-600 font-medium">
                    Courses
                    <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
                
                <button className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-colors font-medium">
                  Go Premium
                </button>
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
              <div className="relative hidden sm:block">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-10 pr-4 py-2 bg-slate-100 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              </div>
              
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
            </div>
          </div>
        </div>

        {/* Category Navigation */}
        <div className="border-t border-slate-200 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-8 py-3 overflow-x-auto">
              {categories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <Link
                    key={category.name}
                    href={`/category/${category.slug}`}
                    className="flex items-center space-x-2 text-slate-600 hover:text-blue-600 whitespace-nowrap group transition-colors"
                  >
                    <IconComponent size={16} className="group-hover:text-blue-600" />
                    <span className="text-sm font-medium">{category.name}</span>
                  </Link>
                );
              })}
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

              <div className="text-center text-gray-500 mb-6">or</div>

              {/* Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username or Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Username or Email"
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
                  onClick={handleSubmit}
                  className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  {authMode === 'signin' ? 'Sign In' : 'Sign Up'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}