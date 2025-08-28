"use client"

import { Search, BookOpen, Code, Database, Brain, Globe, Server, Laptop, Users, Award } from 'lucide-react';
import { useState } from 'react';
import Navbar from './components/Navbar';
import Explore from './components/ExploreComponent';
import Courses from './components/Courses';
import TopicSection from './components/TopicSection';
import Footer from './components/Footer';

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const categories = [
    { name: 'Algorithms', icon: Code },
    { name: 'Data Structures', icon: Database },
    { name: 'Machine Learning', icon: Brain },
    { name: 'Web Development', icon: Globe },
    { name: 'System Design', icon: Server },
    { name: 'Programming', icon: Laptop },
    { name: 'DevOps', icon: Users },
    { name: 'Courses', icon: BookOpen }
  ];

  
  const popularCourses = [
    'Complete Web Development',
    'Data Structures & Algorithms',
    'System Design Mastery'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
          <div className="lg:col-span-3">
           
            <div className="bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50 rounded-2xl shadow-xl p-8 md:p-12 mb-8 text-slate-900">
              <div className="max-w-2xl">
                <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                  Hello, What Do You Want To Learn?
                </h1>
                
                <div className="relative mb-8">
                  <input
                    type="text"
                    placeholder="Search for tutorials, courses, or topics..."
                    className="w-full px-6 py-4 text-slate-900 bg-white rounded-xl shadow-lg focus:outline-none focus:ring-4 focus:ring-white/20 text-lg"
                  />
                  <button className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors">
                    <Search size={20} />
                  </button>
                </div>

                <div className="flex flex-wrap gap-3">
                  {popularCourses.map((course, index) => (
                    <button
                      key={index}
                      className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-full text-sm font-medium transition-colors backdrop-blur-sm"
                    >
                      {course}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <Explore/>

        <Courses/>

        <TopicSection 
          title="Web development" 
          cards={[
            { title: 'Html', href: '/docs/html-body' },
            { title: 'CSS', href: '/docs/javascript-arrays' },
            { title: 'Javascript', href: '/docs/javascript-arrays' },
            { title: 'Python', href: '/docs/python-variables' }
          ]}
        />

        <Footer/>
      </div>
  );
}