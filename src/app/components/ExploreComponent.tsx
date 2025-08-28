import React from 'react';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
const Explore = () => {


  const exploreItems = [
    {
      title: 'Data Structure and Algorithms',
      bgColor: 'bg-gradient-to-br from-emerald-200 to-teal-300',
      slug:"data-structures",
      hoverColor: 'hover:from-emerald-300 hover:to-teal-400'
    },
    {
      title: 'Practice DSA',
      bgColor: 'bg-gradient-to-br from-indigo-200 to-purple-300',
      slug:"data-structures",
      hoverColor: 'hover:from-indigo-300 hover:to-purple-400'
    },
    {
      title: 'AI ML & Data Science',
      bgColor: 'bg-gradient-to-br from-rose-200 to-red-300',
      slug:"machine-learning",
      hoverColor: 'hover:from-rose-300 hover:to-red-400'
    },
    {
      title: 'Web Development',
      bgColor: 'bg-gradient-to-br from-violet-200 to-purple-300',
      slug:"web-development",
      hoverColor: 'hover:from-violet-300 hover:to-purple-400'
    }
  ];


  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Explore</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {exploreItems.map((item, index) => (
          <div
            key={index}
            className={`${item.bgColor} ${item.hoverColor} rounded-2xl p-8 text-white cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl group min-h-[200px] flex flex-col justify-between`}
          >
            <div>
              <h2 className="text-2xl font-semibold mb-6 leading-tight">
                {item.title}
              </h2>
            </div>
            
            <div className="flex justify-start">
            <Link
                    key={item.title}
                    href={`/category/${item.slug}`}
                    className="flex items-center space-x-2 text-slate-600 hover:text-blue-600 whitespace-nowrap group transition-colors"
                  >
                <span className="font-medium">View more</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Explore;