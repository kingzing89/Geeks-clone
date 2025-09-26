"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Facebook, Instagram, Linkedin, Twitter, Youtube, Loader2 } from 'lucide-react';

interface FooterLink {
  name: string;
  href: string;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

interface Category {
  _id: string;
  title: string;
  slug: string;
  isActive: boolean;
}

interface Course {
  _id: string;
  title: string;
  slug: string;
  isPublished: boolean;
}

interface Documentation {
  _id: string;
  title: string;
  slug: string;
  isPublished: boolean;
}

const Footer: React.FC = () => {
  const [footerSections, setFooterSections] = useState<FooterSection[]>([]);
  const [loading, setLoading] = useState(true);

 

  useEffect(() => {
    const fetchFooterData = async () => {
      try {
        setLoading(true);

        // Fetch all data concurrently
        const [categoriesResponse, coursesResponse, docsResponse] = await Promise.all([
          fetch('/api/categories?activeOnly=true&limit=8'),
          fetch('/api/courses?featured=true&limit=8'),
          fetch('/api/documentation?limit=8')
        ]);

        const [categoriesData, coursesData, docsData] = await Promise.all([
          categoriesResponse.json(),
          coursesResponse.json(),
          docsResponse.json()
        ]);

        const sections: FooterSection[] = [];

        // Add Categories section
        if (categoriesData.success && categoriesData.data.length > 0) {
          const categoryLinks: FooterLink[] = categoriesData.data.map((category: Category) => ({
            name: category.title,
            href: `/categories/${category.slug}`
          }));

          sections.push({
            title: "Categories",
            links: categoryLinks
          });
        }

        // Add Popular Courses section
        if (coursesData.success && coursesData.data.length > 0) {
          const courseLinks: FooterLink[] = coursesData.data.slice(0, 6).map((course: Course) => ({
            name: course.title.length > 25 ? `${course.title.substring(0, 25)}...` : course.title,
            href: course.slug ? `/courses/${course.slug}` : `/course/${course._id}`
          }));

          sections.push({
            title: "Popular Courses",
            links: [
              { name: "All Courses", href: "/courses" },
              ...courseLinks
            ]
          });
        }

        // Add Documentation section
        if (docsData.success && docsData.data.length > 0) {
          const docLinks: FooterLink[] = docsData.data.slice(0, 6).map((doc: Documentation) => ({
            name: doc.title.length > 30 ? `${doc.title.substring(0, 30)}...` : doc.title,
            href: `/docs/${doc.slug}`
          }));

          sections.push({
            title: "Documentation",
            links: [
              { name: "All Documentation", href: "/docs" },
              ...docLinks
            ]
          });
        }

     

        setFooterSections(sections);
      } catch (error) {
        console.error('Error fetching footer data:', error);
        // Fallback to company section only on error
        setFooterSections([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFooterData();
  }, []);

  // Loading state
  if (loading) {
    return (
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400 mr-2" />
            <span className="text-gray-500">Loading...</span>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-white border-t border-gray-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Footer Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-12">
          {footerSections.map((section, index) => (
            <div key={index} className="min-h-0">
              <h3 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wide">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link 
                      href={link.href}
                      className="text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200 block py-1 hover:underline"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 pt-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            {/* Brand and Copyright */}
            <div className="mb-6 md:mb-0">
              <div className="flex items-center mb-2">
                <h2 className="text-xl font-bold text-gray-900">CodeLearn</h2>
              </div>
              <p className="text-sm text-gray-500">
                © {new Date().getFullYear()} CodeLearn. All rights reserved.
              </p>
              <p className="text-xs text-gray-400 mt-1">
                A platform for learning and practicing programming
              </p>
            </div>

            {/* Social Media Icons */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500 mr-2">Follow us:</span>
              <a 
                href="#" 
                className="bg-gray-100 hover:bg-blue-600 text-gray-600 hover:text-white p-2 rounded-full transition-all duration-200 transform hover:scale-110"
                aria-label="Facebook"
              >
                <Facebook size={18} />
              </a>
              <a 
                href="#" 
                className="bg-gray-100 hover:bg-pink-600 text-gray-600 hover:text-white p-2 rounded-full transition-all duration-200 transform hover:scale-110"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
              <a 
                href="#" 
                className="bg-gray-100 hover:bg-blue-700 text-gray-600 hover:text-white p-2 rounded-full transition-all duration-200 transform hover:scale-110"
                aria-label="LinkedIn"
              >
                <Linkedin size={18} />
              </a>
              <a 
                href="#" 
                className="bg-gray-100 hover:bg-blue-400 text-gray-600 hover:text-white p-2 rounded-full transition-all duration-200 transform hover:scale-110"
                aria-label="Twitter"
              >
                <Twitter size={18} />
              </a>
              <a 
                href="#" 
                className="bg-gray-100 hover:bg-red-600 text-gray-600 hover:text-white p-2 rounded-full transition-all duration-200 transform hover:scale-110"
                aria-label="YouTube"
              >
                <Youtube size={18} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;