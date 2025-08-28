import React, { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, FileText, ChevronRight, Clock, Users, Star, Award } from 'lucide-react';

interface CourseSection {
  id: string;
  title: string;
  content: string;
}

interface CourseData {
  id: string;
  title: string;
  description: string;
  level: string;
  rating: number;
  students: number;
  duration: string;
  instructor: string;
  bgColor: string;
  sections: CourseSection[];
}

interface CourseDetailProps {
  courseId?: string;
  onBack?: () => void;
}

const CourseDetail: React.FC<CourseDetailProps> = ({ courseId = '1', onBack }) => {
  const [activeSection, setActiveSection] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourseData = async () => {
      setLoading(true);
      try {
        
        await new Promise(resolve => setTimeout(resolve, 1000));
    
        const mockApiData: CourseData = {
          id: courseId,
          title: courseId === '1' ? "DSA to Development: A Complete Guide" :
                 courseId === '2' ? "JAVA Backend Development - Live" :
                 "Full Stack Development with React & Node JS",
          description: "Master the fundamentals and advanced concepts through comprehensive documentation and practical examples.",
          level: "Beginner to Advance",
          rating: 4.4,
          students: 15420,
          duration: "40 hours",
          instructor: "John Smith",
          bgColor: courseId === '1' ? "from-emerald-400 to-green-500" :
                    courseId === '2' ? "from-indigo-400 to-purple-500" :
                    "from-teal-500 to-cyan-600",
          sections: [
            {
              id: 'introduction',
              title: 'Introduction',
              content: `# Welcome to the Course

This comprehensive guide will take you through all the essential concepts you need to master. Our documentation-style approach ensures you have a complete reference that you can return to anytime.

## What You'll Learn

- Core concepts and fundamentals
- Advanced techniques and best practices  
- Real-world applications and examples
- Industry-standard approaches
- Problem-solving methodologies

## Prerequisites

- Basic programming knowledge
- Understanding of fundamental computer science concepts
- Willingness to learn and practice

## How to Use This Documentation

Each section builds upon the previous one, but you can also jump to specific topics as needed. Use the sidebar navigation to quickly find what you're looking for.

## Getting Started

Before diving into the main content, make sure you have:

1. **Development Environment**: Set up your preferred IDE or text editor
2. **Programming Language**: Choose your primary language (Java, Python, C++, JavaScript)
3. **Practice Platform**: Create accounts on coding platforms like LeetCode, HackerRank
4. **Version Control**: Basic Git knowledge for project management`
            },
            {
              id: 'fundamentals',
              title: 'Core Fundamentals',
              content: `# Core Fundamentals

Understanding the fundamental concepts is crucial for building a strong foundation. This section covers the essential building blocks.

## Key Concepts

### 1. Basic Principles

The core principles that govern our subject matter include:

- **Efficiency**: Writing code that performs well
- **Readability**: Code that is easy to understand and maintain
- **Scalability**: Solutions that work for large datasets
- **Reliability**: Code that handles edge cases gracefully

### 2. Mathematical Foundations

Understanding the mathematical concepts behind algorithms:

**Time Complexity Examples:**
- O(1): Constant time - Array access, hash table lookup
- O(log n): Logarithmic - Binary search, balanced tree operations
- O(n): Linear - Single loop through data
- O(n log n): Linearithmic - Efficient sorting algorithms
- O(n²): Quadratic - Nested loops, bubble sort

### 3. Problem-Solving Approach

A systematic approach to solving problems:

1. **Understand** the problem completely
2. **Plan** your approach and consider alternatives
3. **Implement** your solution step by step
4. **Test** with various inputs and edge cases
5. **Optimize** if necessary

## Common Patterns

Learning to recognize common patterns will help you solve problems more efficiently:

- **Two Pointers**: For array problems involving pairs
- **Sliding Window**: For substring/subarray problems
- **Divide and Conquer**: Break problems into smaller subproblems
- **Dynamic Programming**: Optimize recursive solutions
- **Greedy Algorithms**: Make locally optimal choices`
            },
            {
              id: 'data-structures',
              title: 'Data Structures',
              content: `# Data Structures

Data structures are fundamental building blocks that organize and store data efficiently for various operations.

## Arrays and Strings

### Arrays
Arrays are collections of elements stored in contiguous memory locations.

**Key Properties:**
- Fixed size (in most languages)
- Elements accessible by index
- O(1) random access time
- O(n) search time for unsorted arrays

**Common Operations:**
- Access: O(1)
- Search: O(n) for unsorted, O(log n) for sorted
- Insertion: O(n) worst case
- Deletion: O(n) worst case

### Strings
Strings are sequences of characters, often implemented as arrays.

**Important Concepts:**
- Immutability in many languages
- String concatenation complexity
- Pattern matching algorithms
- Unicode and encoding considerations

## Linked Lists

Linked lists consist of nodes where each node contains data and a reference to the next node.

**Types:**
- **Singly Linked List**: Each node points to the next
- **Doubly Linked List**: Each node has pointers to both next and previous
- **Circular Linked List**: Last node points back to the first

**Advantages:**
- Dynamic size
- Efficient insertion/deletion at known positions
- Memory efficient for sparse data

**Disadvantages:**
- No random access
- Extra memory overhead for pointers
- Poor cache locality

## Stacks and Queues

### Stacks (LIFO - Last In, First Out)

**Operations:**
- Push: Add element to top
- Pop: Remove element from top
- Peek/Top: View top element without removing
- isEmpty: Check if stack is empty

**Applications:**
- Function call management
- Expression evaluation
- Undo operations
- Browser history

### Queues (FIFO - First In, First Out)

**Operations:**
- Enqueue: Add element to rear
- Dequeue: Remove element from front
- Front: View front element
- isEmpty: Check if queue is empty

**Applications:**
- Process scheduling
- Breadth-first search
- Print job management
- Handling requests in web servers`
            },
            {
              id: 'algorithms',
              title: 'Algorithms',
              content: `# Algorithms

Algorithms are step-by-step procedures for solving computational problems efficiently.

## Sorting Algorithms

### Bubble Sort
Simple but inefficient sorting algorithm.

**Algorithm:**
1. Compare adjacent elements
2. Swap if they are in wrong order
3. Repeat until no swaps are needed

**Complexity:**
- Time: O(n²) average and worst case
- Space: O(1)
- Stable: Yes

### Merge Sort
Efficient divide-and-conquer sorting algorithm.

**Algorithm:**
1. Divide array into two halves
2. Recursively sort both halves
3. Merge the sorted halves

**Complexity:**
- Time: O(n log n) in all cases
- Space: O(n)
- Stable: Yes

### Quick Sort
Fast sorting algorithm using partitioning.

**Algorithm:**
1. Choose a pivot element
2. Partition array around pivot
3. Recursively sort subarrays

**Complexity:**
- Time: O(n log n) average, O(n²) worst case
- Space: O(log n) average
- Stable: No

## Searching Algorithms

### Linear Search
Simple search through each element sequentially.

**Algorithm:**
1. Check each element from start to end
2. Return index if found, -1 if not found

**Complexity:**
- Time: O(n)
- Space: O(1)

### Binary Search
Efficient search in sorted arrays using divide-and-conquer.

**Algorithm:**
1. Compare target with middle element
2. Eliminate half of the search space
3. Repeat until found or search space is empty

**Complexity:**
- Time: O(log n)
- Space: O(1) iterative, O(log n) recursive

**Prerequisites:**
- Array must be sorted
- Random access to elements

## Graph Algorithms

### Depth-First Search (DFS)
Explores as far as possible along each branch before backtracking.

**Applications:**
- Finding connected components
- Topological sorting
- Detecting cycles
- Solving mazes

### Breadth-First Search (BFS)
Explores all neighbors at current depth before moving to next depth level.

**Applications:**
- Shortest path in unweighted graphs
- Level-order traversal
- Finding minimum spanning tree
- Social network analysis

### Dijkstra's Algorithm
Finds shortest paths from source to all other vertices in weighted graphs.

**Requirements:**
- Non-negative edge weights
- Single source

**Complexity:**
- Time: O((V + E) log V) with priority queue
- Space: O(V)`
            },
            {
              id: 'advanced-topics',
              title: 'Advanced Topics',
              content: `# Advanced Topics

Advanced concepts that build upon the fundamentals to solve complex problems.

## Dynamic Programming

Dynamic Programming (DP) is a technique for solving complex problems by breaking them down into simpler subproblems.

### Key Principles

1. **Overlapping Subproblems**: The problem can be broken down into subproblems which are reused several times
2. **Optimal Substructure**: An optimal solution can be constructed from optimal solutions of its subproblems

### Approaches

**Top-Down (Memoization):**
- Start with the original problem
- Break it down recursively
- Store results to avoid recomputation

**Bottom-Up (Tabulation):**
- Start with smallest subproblems
- Build up to the original problem
- Usually more space-efficient

### Classic DP Problems

**Fibonacci Sequence:**
- Naive recursion: O(2^n)
- With memoization: O(n)
- Bottom-up: O(n) time, O(1) space

**Longest Common Subsequence (LCS):**
- Find longest subsequence common to two sequences
- Time: O(mn), Space: O(mn)
- Can be optimized to O(min(m,n)) space

**0/1 Knapsack:**
- Given weights and values, maximize value within weight limit
- Time: O(nW), Space: O(nW)
- Can be optimized to O(W) space

## Tree Algorithms

### Binary Search Trees (BST)

**Properties:**
- Left subtree contains only nodes with keys less than parent
- Right subtree contains only nodes with keys greater than parent
- Both subtrees are also BSTs

**Operations:**
- Search: O(h) where h is height
- Insertion: O(h)
- Deletion: O(h)
- In worst case h = n, best case h = log n

### Tree Traversals

**Inorder (Left, Root, Right):**
- For BST, gives sorted order
- Time: O(n), Space: O(h)

**Preorder (Root, Left, Right):**
- Useful for creating copy of tree
- Used in expression trees

**Postorder (Left, Right, Root):**
- Useful for deleting tree
- Used in calculating directory sizes

**Level Order:**
- Uses BFS approach
- Useful for printing tree level by level

## Advanced Graph Concepts

### Minimum Spanning Tree (MST)

**Kruskal's Algorithm:**
1. Sort edges by weight
2. Add edges to MST if they don't create cycle
3. Use Union-Find for cycle detection

**Prim's Algorithm:**
1. Start with arbitrary vertex
2. Grow MST by adding minimum weight edge
3. Use priority queue for efficiency

### Shortest Path Algorithms

**Floyd-Warshall Algorithm:**
- All-pairs shortest path
- Works with negative weights (no negative cycles)
- Time: O(V³), Space: O(V²)

**Bellman-Ford Algorithm:**
- Single-source shortest path
- Detects negative weight cycles
- Time: O(VE), Space: O(V)

## Complexity Analysis

### Space-Time Tradeoffs

Often you can trade space for time or vice versa:

**Examples:**
- Hash tables: O(n) space for O(1) average lookup time
- Memoization: Extra space to avoid recomputation
- Preprocessing: Store computed results for faster queries

### Amortized Analysis

Average time per operation over a sequence of operations:

**Examples:**
- Dynamic arrays: O(1) amortized insertion
- Union-Find with path compression: Nearly O(1) amortized
- Splay trees: O(log n) amortized operations`
            },
            {
              id: 'best-practices',
              title: 'Best Practices',
              content: `# Best Practices and Guidelines

Following established best practices will help you write better, more maintainable code.

## Code Quality

### Writing Clean Code

**Naming Conventions:**
- Use descriptive and meaningful names
- Follow language-specific conventions
- Avoid abbreviations and single-letter variables (except loop counters)
- Use verbs for functions, nouns for variables

**Function Design:**
- Keep functions small and focused on a single task
- Limit the number of parameters (ideally ≤ 3)
- Use clear parameter names
- Return early to reduce nesting levels

**Code Organization:**
- Group related functionality together
- Use consistent indentation and formatting
- Follow the DRY (Don't Repeat Yourself) principle
- Add meaningful comments for complex logic, not obvious code

### Error Handling

**Defensive Programming:**
- Validate input parameters
- Handle edge cases explicitly
- Use appropriate exception handling
- Fail fast when encountering invalid states

**Input Validation:**
- Check for null/undefined values
- Verify data types and ranges
- Sanitize user inputs
- Provide clear error messages

## Performance Optimization

### General Guidelines

**Algorithmic Optimization:**
1. Choose the right algorithm first
2. Optimize the most impactful bottlenecks
3. Consider space-time tradeoffs
4. Profile before optimizing

**Common Optimizations:**
- Use appropriate data structures
- Minimize unnecessary computations
- Cache frequently accessed data
- Avoid premature optimization

### Memory Management

**Efficient Memory Usage:**
- Use appropriate data structures for the use case
- Avoid memory leaks in languages with manual memory management
- Consider object pooling for frequent allocations
- Be mindful of reference cycles

**Garbage Collection Considerations:**
- Minimize object creation in tight loops
- Nullify references when done with objects
- Use weak references when appropriate
- Understand your language's GC behavior

## Testing Strategies

### Unit Testing

**Best Practices:**
- Test one thing at a time
- Use descriptive test names
- Follow AAA pattern: Arrange, Act, Assert
- Cover edge cases and boundary conditions
- Keep tests independent and deterministic

**Test Coverage:**
- Aim for high code coverage, but focus on critical paths
- Test both happy paths and error conditions
- Include performance tests for critical algorithms
- Use property-based testing when applicable

### Debugging Techniques

**Systematic Debugging:**
1. **Reproduce** the bug consistently
2. **Isolate** the problem area
3. **Analyze** the code and data flow
4. **Hypothesize** about the cause
5. **Test** your hypothesis
6. **Fix** and verify the solution

**Debugging Tools:**
- Use debuggers effectively
- Add logging at strategic points
- Use version control to track changes
- Employ rubber duck debugging

## Security Considerations

### Input Validation and Sanitization

**Common Vulnerabilities:**
- SQL injection
- Cross-site scripting (XSS)
- Buffer overflows
- Path traversal attacks

**Prevention:**
- Validate all inputs
- Use parameterized queries
- Escape output appropriately
- Implement proper access controls

### Secure Coding Practices

**General Guidelines:**
- Follow principle of least privilege
- Keep software and dependencies updated
- Use secure communication protocols
- Implement proper error handling (don't leak information)
- Regular security audits and code reviews

## Documentation

### Code Documentation

**What to Document:**
- API interfaces and contracts
- Complex algorithms and business logic
- Configuration and setup instructions
- Known limitations and assumptions

**Documentation Best Practices:**
- Keep documentation up to date with code changes
- Use consistent formatting and style
- Include examples and usage scenarios
- Make documentation searchable and accessible

### Technical Design Documents

**Contents:**
- Problem statement and requirements
- High-level architecture and design decisions
- API specifications
- Database schema and data flow
- Performance and scalability considerations
- Testing strategy

## Code Review Guidelines

### Review Process

**What to Look For:**
- Correctness and logic errors
- Code style and consistency
- Performance implications
- Security vulnerabilities
- Test coverage and quality

**Review Etiquette:**
- Be constructive and specific in feedback
- Explain the reasoning behind suggestions
- Focus on the code, not the person
- Acknowledge good code and improvements
- Be open to learning from others

### Common Code Smells

**Indicators of Poor Code Quality:**
- Long functions or classes
- Deeply nested code
- Duplicate code
- Inappropriate comments
- Magic numbers and strings
- Tight coupling between modules`
            }
          ]
        };
        
        setCourseData(mockApiData);
        setActiveSection(mockApiData.sections[0]?.id || '');
      } catch (error) {
        console.error('Error fetching course data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId]);

  const handleBackClick = () => {
    if (onBack) {
      onBack();
    } else {
      console.log('Navigate back to courses');
    }
  };

  const renderContent = (content: string) => {
    const lines = content.split('\n');
    const elements: React.ReactElement[] = [];
    let currentIndex = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Handle headers
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
      }
      // Handle bullet points
      else if (line.trim().startsWith('- ')) {
        elements.push(
          <div key={`li-${currentIndex++}`} className="flex items-start mb-2">
            <span className="text-blue-500 mr-3 mt-1.5">•</span>
            <span className="text-gray-700">{line.trim().substring(2)}</span>
          </div>
        );
      }
      // Handle numbered lists
      else if (/^\d+\./.test(line.trim())) {
        const match = line.trim().match(/^(\d+)\.\s*(.*)$/);
        if (match) {
          elements.push(
            <div key={`num-${currentIndex++}`} className="flex items-start mb-2">
              <span className="text-blue-600 font-semibold mr-3 mt-0.5">{match[1]}.</span>
              <span className="text-gray-700">{match[2]}</span>
            </div>
          );
        }
      }
      // Handle bold text
      else if (line.includes('**')) {
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
      }
      // Regular paragraphs
      else if (line.trim() && !line.startsWith('#')) {
        elements.push(
          <p key={`p-${currentIndex++}`} className="mb-4 text-gray-700 leading-relaxed">
            {line}
          </p>
        );
      }
      // Empty lines
      else if (!line.trim()) {
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

  if (!courseData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Course not found</p>
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

  const activeContent = courseData.sections.find(section => section.id === activeSection);

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
              <h2 className="font-semibold text-gray-800 truncate">Course Documentation</h2>
            )}
          </div>
        </div>

        {sidebarOpen && (
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium text-gray-700">{courseData.rating}</span>
              <span className="text-sm text-gray-500">({courseData.students.toLocaleString()} students)</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{courseData.duration}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{courseData.level}</span>
              </div>
            </div>
          </div>
        )}

        <div className="p-4 overflow-y-auto flex-1">
          <nav className="space-y-2">
            {courseData.sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${
                  activeSection === section.id
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <FileText className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && (
                  <>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{section.title}</div>
                    </div>
                    <ChevronRight className={`w-4 h-4 transition-transform ${
                      activeSection === section.id ? 'rotate-90' : ''
                    }`} />
                  </>
                )}
              </button>
            ))}
          </nav>
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
          <div className={`bg-gradient-to-r ${courseData.bgColor} rounded-2xl shadow-xl p-8 mb-8 text-white`}>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{courseData.rating}</span>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                <span className="text-sm">{courseData.level}</span>
              </div>
            </div>
            
            <h1 className="text-4xl font-bold mb-4">{courseData.title}</h1>
            <p className="text-lg opacity-90 mb-6">{courseData.description}</p>
            
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{courseData.students.toLocaleString()} students</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{courseData.duration}</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4" />
                <span>By {courseData.instructor}</span>
              </div>
            </div>
          </div>

          {/* Documentation Content */}
          <div className="bg-white rounded-2xl shadow-lg">
            <div className="p-8">
              {activeContent && (
                <div>
                  <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-200">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <BookOpen className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-gray-800">{activeContent.title}</h2>
                      <p className="text-gray-500 mt-1">Documentation and Reference</p>
                    </div>
                  </div>

                  <div className="prose prose-lg max-w-none">
                    <div className="documentation-content">
                      {renderContent(activeContent.content)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;