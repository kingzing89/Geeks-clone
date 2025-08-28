import React from 'react';
import { Share2, MessageCircle, Link2, MoreVertical } from 'lucide-react';

interface DocPageProps {
  params: { slug: string };
}

const docsData: Record<string, { 
  title: string; 
  updated: string; 
  content: string; 
  category: string; 
  readTime: string;
  description: string;
  keyFeatures: string[];
  codeExamples: { title: string; code: string; description: string }[];
  quickLinks: string[];
  proTip: string;
}> = {
  "javascript-tutorial": {
    title: "JavaScript Tutorial",
    updated: "12 Aug, 2025",
    category: "JavaScript",
    readTime: "15 min read",
    description: "JavaScript is a programming language used to create dynamic content for websites. It is a lightweight, cross-platform, and single-threaded programming language. It's an interpreted language that executes code line by line, providing more flexibility.",
    content: "Learn the fundamentals of JavaScript programming, from basic syntax to advanced concepts. This comprehensive guide covers everything you need to know to start building interactive web applications.",
    keyFeatures: [
      "Dynamic Typing - Variables can hold different types of data without explicit declaration",
      "Interpreted Language - No compilation step required, code executed line by line", 
      "Cross-Platform - Runs on browsers, servers, mobile apps, and desktop applications",
      "Event-Driven - Responds to user interactions through event handlers"
    ],
    codeExamples: [
      {
        title: "Client Side Example",
        code: `document.getElementById('myButton').onclick = function() {\n  alert('Hello World!');\n};`,
        description: "JavaScript running in the browser to handle user interactions"
      },
      {
        title: "Server Side Example", 
        code: `const express = require('express');\nconst app = express();\napp.get('/', (req, res) => {\n  res.send('Hello Server!');\n});`,
        description: "JavaScript running on the server with Node.js"
      }
    ],
    quickLinks: ["Getting Started", "Variables & Data Types", "Functions", "DOM Manipulation", "Events", "Async Programming"],
    proTip: "Practice coding along with the examples. The best way to learn JavaScript is by writing code!"
  },
  "javascript-arrays": {
    title: "JavaScript Arrays", 
    updated: "12 Aug, 2025",
    category: "JavaScript",
    readTime: "12 min read",
    description: "Arrays in JavaScript are used to store multiple values in a single variable. They are ordered collections of elements that can hold different data types.",
    content: "Master JavaScript arrays with this comprehensive guide. Learn about array methods, iteration techniques, and advanced array operations for efficient data manipulation.",
    keyFeatures: [
      "Dynamic Size - Arrays can grow and shrink during runtime",
      "Mixed Data Types - Can store numbers, strings, objects, and other arrays",
      "Built-in Methods - Rich set of methods for manipulation and iteration", 
      "Zero-indexed - Array elements are accessed using numeric indices starting from 0"
    ],
    codeExamples: [
      {
        title: "Array Creation",
        code: `const fruits = ['Apple', 'Banana', 'Mango'];\nconst numbers = [1, 2, 3, 4, 5];`,
        description: "Creating arrays with different data types"
      },
      {
        title: "Array Methods",
        code: `fruits.push('Orange');\nconst result = numbers.map(x => x * 2);\nconst filtered = numbers.filter(x => x > 2);`,
        description: "Using common array methods for data manipulation"
      }
    ],
    quickLinks: ["Array Basics", "Array Methods", "Iteration", "Multi-dimensional Arrays", "Array Destructuring", "Performance Tips"],
    proTip: "Use array methods like map, filter, and reduce for functional programming patterns!"
  },
  "python-variables": {
    title: "Python Variables",
    updated: "08 Aug, 2025", 
    category: "Python",
    readTime: "10 min read",
    description: "Variables in Python are containers for storing data values. Python has no command for declaring a variable - it's created when you first assign a value to it.",
    content: "Understand Python variables and data types. Learn how to declare, assign, and manipulate variables effectively in your Python programs.",
    keyFeatures: [
      "Dynamic Typing - Variable types are determined automatically at runtime",
      "No Declaration Needed - Variables are created when first assigned a value",
      "Case Sensitive - myVar and myvar are different variables",
      "Multiple Assignment - Assign values to multiple variables in one line"
    ],
    codeExamples: [
      {
        title: "Variable Assignment",
        code: `x = 5\nname = "Alice"\nis_student = True`,
        description: "Creating variables with different data types"
      },
      {
        title: "Multiple Assignment",
        code: `a, b, c = 1, 2, 3\nx = y = z = 0\nname, age = "Bob", 25`,
        description: "Assigning multiple variables at once"
      }
    ],
    quickLinks: ["Variable Basics", "Data Types", "Variable Scope", "Global vs Local", "Constants", "Naming Conventions"],
    proTip: "Use descriptive variable names to make your code more readable and maintainable!"
  },
  "html-body": {
    title: "HTML Body",
    updated: "10 Aug, 2025",
    category: "HTML", 
    readTime: "8 min read",
    description: "The <body> element defines the document's body. It contains all the contents of an HTML document, such as text, images, videos, and links.",
    content: "Learn about the HTML body element and how it structures the visible content of web pages. Understand best practices for organizing body content.",
    keyFeatures: [
      "Content Container - Holds all visible page content",
      "Event Handling - Can respond to various user and system events",
      "Styling Support - Can be styled with CSS for layout and appearance", 
      "Accessibility - Supports ARIA attributes for screen readers"
    ],
    codeExamples: [
      {
        title: "Basic Body Structure",
        code: `<body>\n  <header>Page Header</header>\n  <main>Main Content</main>\n  <footer>Page Footer</footer>\n</body>`,
        description: "Standard HTML body structure with semantic elements"
      },
      {
        title: "Body with Attributes",
        code: `<body class="main-page" id="homepage" onload="initPage()">\n  <h1>Welcome</h1>\n  <p>Page content goes here</p>\n</body>`,
        description: "Body element with CSS classes, ID, and event handlers"
      }
    ],
    quickLinks: ["Body Basics", "Semantic Elements", "Event Attributes", "CSS Integration", "Accessibility", "Best Practices"],
    proTip: "Use semantic HTML elements within the body to create meaningful document structure!"
  }
};

export default function DocPage({ params }: DocPageProps) {
  const doc = docsData[params?.slug || "javascript-tutorial"];

  if (!doc) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">404 - Documentation Not Found</h1>
          <p className="text-gray-600">The requested documentation page could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Article */}
          <main className="flex-1 max-w-4xl">
            {/* Article Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <span className="inline-block bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {doc.category}
                </span>
                <div className="flex items-center space-x-3">
                  <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                    <Share2 className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                    <MessageCircle className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                    <Link2 className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{doc.title}</h1>
              
              <div className="flex items-center text-sm text-gray-500 space-x-4 mb-6">
                <span>Last Updated: {doc.updated}</span>
                <span>•</span>
                <span>{doc.readTime}</span>
              </div>
            </div>

            {/* Article Content */}
            <div className="prose prose-lg max-w-none">
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                {doc.description}
              </p>

              <div className="bg-blue-50 border-l-4 border-blue-400 p-6 mb-8">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">What You'll Learn</h3>
                <p className="text-blue-700">
                  {doc.content}
                </p>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">Key Features</h2>
              
              <div className="grid gap-4 mb-8">
                {doc.keyFeatures.map((feature, index) => {
                  const [title, description] = feature.split(' - ');
                  const emojis = ['🚀', '⚡', '🌐', '🔄'];
                  return (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">{emojis[index]} {title}</h4>
                      <p className="text-gray-700">{description}</p>
                    </div>
                  );
                })}
              </div>

              {doc.codeExamples && doc.codeExamples.length > 0 && (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Code Examples</h2>
                  
                  <div className="grid md:grid-cols-2 gap-6 mb-8">
                    {doc.codeExamples.map((example, index) => (
                      <div key={index} className={`bg-gradient-to-br p-6 rounded-lg ${
                        index % 2 === 0 ? 'from-blue-50 to-blue-100' : 'from-green-50 to-green-100'
                      }`}>
                        <h3 className={`text-xl font-semibold mb-3 ${
                          index % 2 === 0 ? 'text-blue-800' : 'text-green-800'
                        }`}>{example.title}</h3>
                        <p className="text-gray-700 mb-4">{example.description}</p>
                        <div className="bg-white p-3 rounded border">
                          <code className={`text-sm whitespace-pre-line ${
                            index % 2 === 0 ? 'text-blue-600' : 'text-green-600'
                          }`}>
                            {example.code}
                          </code>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <div className="bg-gradient-to-r from-green-400 to-blue-500 text-white p-8 rounded-lg mb-8">
                <h3 className="text-2xl font-bold mb-4">Ready to Start Learning?</h3>
                <p className="text-lg mb-4">
                  Master {doc.title.toLowerCase()} from basics to advanced concepts with our comprehensive tutorial series.
                </p>
                <button className="bg-white text-green-600 font-bold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors">
                  Start Learning Now
                </button>
              </div>
            </div>
          </main>

          {/* Sidebar */}
          <aside className="w-full lg:w-80">
            <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Navigation</h3>
              <nav className="space-y-2">
                {doc.quickLinks.map((link, index) => (
                  <a 
                    key={index}
                    href="#" 
                    className={`block py-2 px-3 rounded transition-colors ${
                      index === 0 
                        ? "text-blue-600 hover:text-blue-800 hover:bg-blue-50" 
                        : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                    }`}
                  >
                    {link}
                  </a>
                ))}
              </nav>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-lg p-6 mt-6">
              <h3 className="text-lg font-bold mb-2">💡 Pro Tip</h3>
              <p className="text-sm opacity-90">
                {doc.proTip}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}