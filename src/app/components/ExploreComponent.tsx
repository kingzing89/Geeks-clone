import React from 'react';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

type ExploreProps = {
  categories?: Array<{
    title: string;
    slug: string;
    bgColor?: string;
    description?: string;
    icon?: unknown;
  }>;
};

const getBgColorClass = (bgColor?: string) => {
  // Map admin panel color values to Tailwind classes
  const adminColorMap: { [key: string]: { bgColor: string; hoverColor: string } } = {
    'LightBlue': {
      bgColor: 'bg-gradient-to-br from-sky-100 to-blue-200',
      hoverColor: 'hover:from-sky-200 hover:to-blue-300'
    },
    'SoftGreen': {
      bgColor: 'bg-gradient-to-br from-green-100 to-emerald-200',
      hoverColor: 'hover:from-green-200 hover:to-emerald-300'
    },
    'PaleRose': {
      bgColor: 'bg-gradient-to-br from-rose-100 to-pink-200',
      hoverColor: 'hover:from-rose-200 hover:to-pink-300'
    },
    'LavenderGray': {
      bgColor: 'bg-gradient-to-br from-slate-100 to-purple-200',
      hoverColor: 'hover:from-slate-200 hover:to-purple-300'
    },
    'WarmBeige': {
      bgColor: 'bg-gradient-to-br from-amber-50 to-yellow-100',
      hoverColor: 'hover:from-amber-100 hover:to-yellow-200'
    },
    'SoftPink': {
      bgColor: 'bg-gradient-to-br from-pink-100 to-rose-200',
      hoverColor: 'hover:from-pink-200 hover:to-rose-300'
    },
    'PaleIndigo': {
      bgColor: 'bg-gradient-to-br from-indigo-100 to-violet-200',
      hoverColor: 'hover:from-indigo-200 hover:to-violet-300'
    },
    'MintGreen': {
      bgColor: 'bg-gradient-to-br from-mint-100 to-teal-200',
      hoverColor: 'hover:from-mint-200 hover:to-teal-300'
    },
    'Peach': {
      bgColor: 'bg-gradient-to-br from-orange-100 to-amber-200',
      hoverColor: 'hover:from-orange-200 hover:to-amber-300'
    },
    'SoftTeal': {
      bgColor: 'bg-gradient-to-br from-teal-100 to-cyan-200',
      hoverColor: 'hover:from-teal-200 hover:to-cyan-300'
    }
  };

  // Return the mapping if bgColor exists, otherwise return default
  if (bgColor && adminColorMap[bgColor]) {
    return adminColorMap[bgColor];
  }
  
  // Default fallback
  return {
    bgColor: 'bg-gradient-to-br from-gray-100 to-slate-200',
    hoverColor: 'hover:from-gray-200 hover:to-slate-300'
  };
};

const Explore: React.FC<ExploreProps> = ({ categories = [] }) => {
  // Default colors cycle through admin panel options for categories without bgColor
  const defaultAdminColors = [
    'LightBlue',
    'SoftGreen', 
    'PaleRose',
    'LavenderGray',
    'WarmBeige',
    'SoftPink',
    'PaleIndigo',
    'MintGreen',
    'Peach',
    'SoftTeal'
  ];

  // Map API categories to explore items
  const exploreItems = categories.map((category, index) => {
    const colorKey = category.bgColor || defaultAdminColors[index % defaultAdminColors.length];
    const colorConfig = getBgColorClass(colorKey);
    
    return {
      title: category.title,
      slug: category.slug,
      bgColor: colorConfig.bgColor,
      hoverColor: colorConfig.hoverColor,
      description: category.description
    };
  });

  console.log('Categories from API:', categories);
  console.log('Generated explore items:', exploreItems);

  // Don't render anything if no categories
  if (categories.length === 0) {
    return <h1 className="text-3xl font-bold text-gray-800 mb-8 ml-12">Explore</h1>;
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Explore</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {exploreItems.map((item, index) => (
          <div
            key={index}
            className={`${item.bgColor} ${item.hoverColor} rounded-2xl p-8 text-gray-800 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl group min-h-[200px] flex flex-col justify-between`}
          >
            <div>
              <h2 className="text-2xl font-semibold mb-6 leading-tight">
                {item.title}
              </h2>
              {item.description && (
                <p className="text-gray-700 text-sm mb-4">
                  {item.description}
                </p>
              )}
            </div>
            
            <div className="flex justify-start">
              <Link
                href={`/category/${item.slug}`}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 whitespace-nowrap group transition-colors"
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