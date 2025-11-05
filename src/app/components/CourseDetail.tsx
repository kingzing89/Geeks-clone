"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  BookOpen, 
  FileText, 
  ChevronRight, 
  Clock, 
  Users, 
  Star, 
  Award,
  Lock,
  CreditCard,
  Loader2,
  X,
  CheckCircle
} from 'lucide-react';

interface CourseSection {
  _id: string;
  title: string;
  content: string;
  order: number;
  courseId: string;
}

interface Category {
  _id: string;
  title: string;
  slug: string;
  description: string;
}

interface CourseData {
  _id: string;
  title: string;
  description: string;
  shortDescription?: string;
  level: string;
  rating: number;
  studentCount: number;
  duration: string;
  instructor: string;
  price: number;
  thumbnailUrl?: string;
  categoryId: Category;
  isPremium: boolean;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  stripePriceId?: string;
  currency?: string;
}

interface ApiResponse {
  success: boolean;
  data: {
    course: CourseData;
    sections: CourseSection[];
    relatedCourses: CourseData[];
  };
  error?: string;
}

interface CourseDetailProps {
  courseId: string;
  onBack?: () => void;
}

const CourseDetail: React.FC<CourseDetailProps> = ({ courseId, onBack }) => {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [sections, setSections] = useState<CourseSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Payment related state
  const [isPaid, setIsPaid] = useState(false);
  const [checkingPurchase, setCheckingPurchase] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  // Check if user has purchased the course
  const checkCoursePurchase = async (courseId: string) => {
    try {
      setCheckingPurchase(true);
      const token = localStorage.getItem("token");
      
      if (!token) {
        setIsPaid(false);
        return;
      }

      const response = await fetch("/api/user/purchases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ courseId }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setIsPaid(result.data.hasPurchased);
        }
      }
    } catch (error) {
      console.error("Error checking course purchase:", error);
      setIsPaid(false);
    } finally {
      setCheckingPurchase(false);
    }
  };

  useEffect(() => {
    const fetchCourseData = async () => {
      setLoading(true);
      setError(null);
      
      try {
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

        const response = await fetch(`/api/courses/${courseId}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result: ApiResponse = await response.json();
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to fetch course data');
        }
        
        setCourseData(result.data.course);
        setSections(result.data.sections);
        
        // Set the first section as active if sections exist
        if (result.data.sections.length > 0) {
          setActiveSection(result.data.sections[0]._id);
        }

        // Check purchase status for all courses (both premium and free)
        if (!sessionId && result.data.course._id) {
          await checkCoursePurchase(result.data.course._id);
        }
      } catch (error) {
        console.error('Error fetching course data:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch course data');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId]);

  // Handle payment
  const handlePayment = async () => {
    if (!courseData) return;

    // Check if user is logged in
    if (!isLoggedIn) {
      alert("Please login or signup to purchase this course.");
      return;
    }

    setIsPaymentLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/payments/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
       body: JSON.stringify({
          priceId: courseData.stripePriceId,
          courseId: courseData._id,
          courseTitle: courseData.title,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Handle authentication errors
        if (response.status === 401) {
          alert("Your session has expired. Please login again to continue.");
          localStorage.removeItem("token");
          setIsLoggedIn(false);
          router.push('/login');
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

  const handleBackClick = () => {
    if (onBack) {
      onBack();
    } else {
      router.push('/courses');
    }
  };

  const getBgColorClass = (categoryTitle?: string) => {
    const colorClasses = [
      "from-emerald-400 to-green-500",
      "from-indigo-400 to-purple-500", 
      "from-teal-500 to-cyan-600",
      "from-blue-500 to-indigo-600",
      "from-purple-500 to-pink-600",
      "from-green-500 to-teal-600"
    ];
    
    if (!categoryTitle) return colorClasses[0];
    
    let hash = 0;
    for (let i = 0; i < categoryTitle.length; i++) {
      hash = ((hash << 5) - hash + categoryTitle.charCodeAt(i)) & 0xffffffff;
    }
    return colorClasses[Math.abs(hash) % colorClasses.length];
  };

  const renderContent = (content: string) => {
    const lines = content.split('\n');
    const elements: React.ReactElement[] = [];
    let currentIndex = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.startsWith('# ')) {
        elements.push(
          <h1 key={`h1-${currentIndex++}`} className="text-3xl font-bold mb-6 mt-8 text-gray-800">
            {line.substring(2)}
          </h1>
        );
      } else if (line.startsWith('## ')) {
        elements.push(
          <h2 key={`h2-${currentIndex++}`} className="text-2xl font-semibold mb-4 mt-8 text-gray-800">
            {line.substring(3)}
          </h2>
        );
      } else if (line.startsWith('### ')) {
        elements.push(
          <h3 key={`h3-${currentIndex++}`} className="text-xl font-semibold mb-3 mt-6 text-gray-700">
            {line.substring(4)}
          </h3>
        );
      } else if (line.trim().startsWith('- ')) {
        elements.push(
          <div key={`li-${currentIndex++}`} className="flex items-start mb-2">
            <span className="text-blue-500 mr-3 mt-1.5">•</span>
            <span className="text-gray-700">{line.trim().substring(2)}</span>
          </div>
        );
      } else if (/^\d+\./.test(line.trim())) {
        const match = line.trim().match(/^(\d+)\.\s*(.*)$/);
        if (match) {
          elements.push(
            <div key={`num-${currentIndex++}`} className="flex items-start mb-2">
              <span className="text-blue-600 font-semibold mr-3 mt-0.5">{match[1]}.</span>
              <span className="text-gray-700">{match[2]}</span>
            </div>
          );
        }
      } else if (line.includes('**')) {
        const parts = line.split('**');
        elements.push(
          <p key={`bold-${currentIndex++}`} className="mb-4 text-gray-700 leading-relaxed">
            {parts.map((part, index) => 
              index % 2 === 1 ? (
                <strong key={index} className="font-semibold text-gray-900">{part}</strong>
              ) : (
                <span key={index}>{part}</span>
              )
            )}
          </p>
        );
      } else if (line.trim() && !line.startsWith('#')) {
        elements.push(
          <p key={`p-${currentIndex++}`} className="mb-4 text-gray-700 leading-relaxed">
            {line}
          </p>
        );
      } else if (!line.trim()) {
        elements.push(<div key={`br-${currentIndex++}`} className="mb-2"></div>);
      }
    }

    return elements;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course content...</p>
        </div>
      </div>
    );
  }

  if (error || !courseData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-4">
            <p className="text-red-600 mb-2">{error || 'Course not found'}</p>
            <p className="text-gray-500 text-sm">Please check the course ID and try again.</p>
          </div>
          <button
            onClick={handleBackClick}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  const activeContent = sections.find(section => section._id === activeSection);
  const canAccessContent = !courseData.isPremium || isPaid;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-16'} transition-all duration-300 bg-white shadow-xl border-r border-gray-200 flex-shrink-0`}>
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBackClick}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Back to courses"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            {sidebarOpen && (
              <h2 className="font-semibold text-gray-800 truncate">Course Content</h2>
            )}
          </div>
        </div>

        {sidebarOpen && (
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium text-gray-700">{courseData.rating || 0}</span>
              <span className="text-sm text-gray-500">({(courseData.studentCount || 0).toLocaleString()} students)</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{courseData.duration || 'Not specified'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{courseData.level || 'All levels'}</span>
              </div>
            </div>
            
            {/* Access Status */}
            <div className="mt-3 p-3 rounded-lg bg-gray-100">
              {checkingPurchase ? (
                <div className="flex items-center text-xs text-gray-600">
                  <Loader2 className="w-3 h-3 animate-spin mr-2" />
                  <span>Checking access...</span>
                </div>
              ) : canAccessContent ? (
                <div className="flex items-center text-xs text-green-600">
                  <CheckCircle className="w-3 h-3 mr-2" />
                  <span>Full Access Unlocked</span>
                </div>
              ) : (
                <div className="flex items-center text-xs text-orange-600">
                  <Lock className="w-3 h-3 mr-2" />
                  <span>Course Access Required - Purchase to Unlock</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="p-4 overflow-y-auto flex-1">
          {sections.length > 0 ? (
            <nav className="space-y-2">
              {sections.map((section) => (
                <button
                  key={section._id}
                  onClick={() => canAccessContent && setActiveSection(section._id)}
                  disabled={!canAccessContent}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${
                    activeSection === section._id && canAccessContent
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : canAccessContent
                      ? 'hover:bg-gray-50 text-gray-700'
                      : 'text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {canAccessContent ? (
                    <FileText className="w-5 h-5 flex-shrink-0" />
                  ) : (
                    <Lock className="w-5 h-5 flex-shrink-0" />
                  )}
                  {sidebarOpen && (
                    <>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{section.title}</div>
                      </div>
                      {canAccessContent && (
                        <ChevronRight className={`w-4 h-4 transition-transform ${
                          activeSection === section._id ? 'rotate-90' : ''
                        }`} />
                      )}
                    </>
                  )}
                </button>
              ))}
              
              {!canAccessContent && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="w-full bg-blue-600 text-white text-sm font-medium py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Unlock Course - ${courseData.price || 0}
                  </button>
                </div>
              )}
            </nav>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No sections available</p>
            </div>
          )}
        </div>

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute top-20 -right-3 bg-white border border-gray-200 rounded-full p-1.5 shadow-md hover:shadow-lg transition-shadow z-10"
        >
          <ChevronRight className={`w-4 h-4 transition-transform ${sidebarOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-8">
          {/* Course Header */}
          <div className={`bg-gradient-to-r ${getBgColorClass(courseData.categoryId?.title)} rounded-2xl shadow-xl p-8 mb-8 text-white`}>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{courseData.rating || 0}</span>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                <span className="text-sm">{courseData.level || 'All levels'}</span>
              </div>
              {courseData.categoryId && (
                <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                  <span className="text-sm">{courseData.categoryId.title}</span>
                </div>
              )}
              {courseData.isPremium && (
                <div className="bg-yellow-500/90 backdrop-blur-sm rounded-full px-3 py-1">
                  <span className="text-xs font-bold">PREMIUM</span>
                </div>
              )}
            </div>
            
            <h1 className="text-4xl font-bold mb-4">{courseData.title}</h1>
            <p className="text-lg opacity-90 mb-6">
              {courseData.shortDescription || courseData.description}
            </p>
            
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{(courseData.studentCount || 0).toLocaleString()} students</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{courseData.duration || 'Not specified'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4" />
                <span>By {courseData.instructor || 'Unknown'}</span>
              </div>
              {(courseData.price || courseData.price === 0) && (
                <div className="flex items-center gap-2">
                  <span className="font-semibold">
                    {courseData.price > 0 ? `$${courseData.price.toLocaleString()}` : 'Free'}
                  </span>
                </div>
              )}
            </div>

            {/* Access Status Banner - Shows for all unpaid courses */}
            {!canAccessContent && (
              <div className="mt-6 p-4 bg-white/20 backdrop-blur-sm rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold mb-1">Course Access Required</h3>
                    <p className="text-sm opacity-90">Purchase this course to access all content and materials.</p>
                  </div>
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="bg-white text-blue-600 font-bold py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Get Access
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Course Content */}
          <div className="bg-white rounded-2xl shadow-lg">
            <div className="p-8">
              {canAccessContent ? (
                // Unlocked Content
                activeContent ? (
                  <div>
                    <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-200">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <BookOpen className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold text-gray-800">{activeContent.title}</h2>
                        <p className="text-gray-500 mt-1">Course Content</p>
                      </div>
                    </div>

                    {isPaid && courseData.isPremium && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                        <p className="text-sm font-medium text-green-800 flex items-center">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Course Unlocked! You have full access to all content.
                        </p>
                      </div>
                    )}

                    <div className="prose prose-lg max-w-none">
                      <div className="course-content">
                        {renderContent(activeContent.content)}
                      </div>
                    </div>
                  </div>
                ) : sections.length > 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-xl font-medium text-gray-700 mb-2">Select a Section</h3>
                    <p className="text-gray-500">Choose a section from the sidebar to view its content.</p>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-xl font-medium text-gray-700 mb-2">No Content Available</h3>
                    <p className="text-gray-500">This course doesn't have any sections yet.</p>
                  </div>
                )
              ) : (
                // Locked Content
                <div className="relative">
                  {/* Blurred Preview Content */}
                  <div className="filter blur-sm pointer-events-none">
                    <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-200">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <BookOpen className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold text-gray-800">Course Preview</h2>
                        <p className="text-gray-500 mt-1">Premium Content</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                      <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                      <div className="h-20 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  </div>

                  {/* Lock Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-95">
                    <div className="text-center p-8 max-w-md">
                      <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Lock className="w-10 h-10 text-blue-600" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-3">
                        Course Access Required
                      </h3>
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        This course contains exclusive content, detailed explanations, and practical examples. 
                        Purchase access to unlock all course materials and start learning.
                      </p>
                      
                      <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-lg font-semibold text-gray-900">
                            {courseData.title}
                          </span>
                          <span className="text-2xl font-bold text-green-600">
                            ${courseData.price || 0} {courseData.currency?.toUpperCase() || "USD"}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">
                          One-time purchase • Lifetime access • {sections.length} sections
                        </p>
                      </div>

                      {!isLoggedIn ? (
                        <div className="space-y-3">
                          <p className="text-sm text-gray-600 mb-4">
                            Please login to purchase this course
                          </p>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowPaymentModal(true)}
                          className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <CreditCard className="w-5 h-5" />
                          Purchase Course
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
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
                Unlock Course Access
              </h2>
              <p className="text-gray-600">
                Get lifetime access to {courseData.title} with all sections and materials.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-lg font-semibold text-gray-900 block">
                    {courseData.title}
                  </span>
                  <span className="text-sm text-gray-500">
                    {sections.length} sections • Lifetime access
                  </span>
                </div>
                <span className="text-2xl font-bold text-green-600">
                  ${courseData.price} {courseData.currency?.toUpperCase() || "USD"}
                </span>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                <span>All {sections.length} course sections</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                <span>Lifetime access to content</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                <span>Access from any device</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                <span>Future updates included</span>
              </div>
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
                  Pay ${courseData.price} - Secure Checkout
                </>
              )}
            </button>

            <p className="text-xs text-gray-500 text-center mt-4">
              🔒 Secure payment powered by Stripe
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetail;