// app/category/[slug]/page.tsx
import { notFound } from 'next/navigation';

// Static data - replace this with API call later
const getCategoryData = (slug: string) => {
  const categoryData: Record<string, any> = {
    'algorithms': {
      title: 'Algorithms',
      description: 'Master the art of problem-solving with our comprehensive algorithm tutorials',
      content: `Algorithms are step-by-step procedures or formulas for solving problems. They are fundamental to computer science and programming, providing efficient solutions to complex computational challenges.

      Key concepts in algorithms include:

      • Time and Space Complexity: Understanding how algorithms perform with different input sizes using Big O notation
      • Sorting Algorithms: Bubble sort, merge sort, quicksort, and their trade-offs
      • Searching Algorithms: Linear search, binary search, and hash-based searching
      • Dynamic Programming: Breaking down complex problems into simpler subproblems
      • Greedy Algorithms: Making locally optimal choices to find global solutions
      • Graph Algorithms: Traversal methods like BFS and DFS, shortest path algorithms
      • Divide and Conquer: Recursive problem-solving approach
      • Recursion: Functions that call themselves to solve problems

      Mastering algorithms helps developers write more efficient code, optimize performance, and solve complex problems systematically. They form the foundation of competitive programming and technical interviews at major tech companies.`
    },
    'data-structures': {
      title: 'Data Structures',
      description: 'Build a solid foundation with essential data structures',
      content: `Data structures are ways of organizing and storing data to enable efficient access and modification. They are crucial for writing efficient algorithms and building scalable applications.

      Fundamental data structures include:

      • Arrays: Fixed-size sequential collection of elements of the same type
      • Linked Lists: Dynamic data structure with nodes containing data and pointers
      • Stacks: Last-In-First-Out (LIFO) data structure for managing function calls and operations
      • Queues: First-In-First-Out (FIFO) data structure for scheduling and buffering
      • Trees: Hierarchical data structure with nodes and parent-child relationships
      • Binary Search Trees: Ordered tree structure for efficient searching and sorting
      • Hash Tables: Key-value pairs with fast insertion, deletion, and lookup operations
      • Heaps: Complete binary trees used for priority queues and heap sort
      • Graphs: Collection of vertices connected by edges for modeling relationships

      Understanding when and how to use different data structures is essential for optimizing program performance and memory usage. Each structure has specific advantages and trade-offs in terms of time and space complexity.`
    },
    'machine-learning': {
      title: 'Machine Learning',
      description: 'Dive into AI and ML algorithms with hands-on projects',
      content: `Machine Learning is a subset of artificial intelligence that enables computers to learn and make decisions from data without being explicitly programmed for every task.

      Core machine learning concepts:

      • Supervised Learning: Training models with labeled data (classification and regression)
      • Unsupervised Learning: Finding patterns in unlabeled data (clustering and dimensionality reduction)
      • Reinforcement Learning: Learning through interaction with an environment using rewards and penalties
      • Neural Networks: Interconnected nodes that mimic the human brain's structure
      • Deep Learning: Multi-layered neural networks for complex pattern recognition
      • Feature Engineering: Selecting and transforming input variables for better model performance
      • Model Evaluation: Using metrics like accuracy, precision, recall, and F1-score
      • Overfitting and Underfitting: Balancing model complexity and generalization
      • Cross-validation: Techniques for assessing model performance on unseen data

      Popular algorithms include linear regression, decision trees, random forests, support vector machines, k-means clustering, and convolutional neural networks. ML is applied in computer vision, natural language processing, recommendation systems, and autonomous systems.`
    },
    'web-development': {
      title: 'Web Development',
      description: 'Create modern web applications with cutting-edge technologies',
      content: `Web Development encompasses creating websites and web applications that run in browsers or on web servers. It involves both frontend (client-side) and backend (server-side) development.

      Frontend Development focuses on:

      • HTML: Structure and content markup language
      • CSS: Styling, layout, and responsive design
      • JavaScript: Interactive functionality and dynamic behavior
      • Modern Frameworks: React, Vue.js, Angular for building user interfaces
      • CSS Preprocessors: Sass, Less for enhanced styling capabilities
      • Build Tools: Webpack, Vite for bundling and optimizing code
      • Version Control: Git for tracking changes and collaboration

      Backend Development includes:

      • Server Languages: Node.js, Python, Java, PHP for server-side logic
      • Databases: SQL (MySQL, PostgreSQL) and NoSQL (MongoDB, Redis) databases
      • APIs: REST and GraphQL for data communication
      • Authentication: User login, session management, and security
      • Cloud Services: AWS, Azure, Google Cloud for hosting and scaling
      • DevOps: CI/CD pipelines, containerization with Docker

      Modern web development emphasizes responsive design, performance optimization, accessibility, and security best practices.`
    },
    'system-design': {
      title: 'System Design',
      description: 'Learn to design scalable and reliable distributed systems',
      content: `System Design is the process of architecting large-scale distributed systems that can handle millions of users and massive amounts of data efficiently and reliably.

      Key system design principles:

      • Scalability: Horizontal vs vertical scaling strategies
      • Reliability: Fault tolerance, redundancy, and disaster recovery
      • Availability: Ensuring systems remain operational with minimal downtime
      • Consistency: Data consistency models in distributed systems
      • Partition Tolerance: Handling network failures gracefully
      • Load Balancing: Distributing traffic across multiple servers
      • Caching: Redis, Memcached, CDNs for improved performance
      • Database Design: SQL vs NoSQL, sharding, replication strategies
      • Microservices: Breaking monoliths into smaller, independent services
      • Message Queues: Asynchronous communication between services
      • API Design: REST, GraphQL, and API versioning strategies
      • Monitoring: Logging, metrics, and alerting systems

      System design interviews are common at tech companies and focus on designing systems like social media platforms, chat applications, URL shorteners, and streaming services. The goal is to create systems that are scalable, maintainable, and cost-effective.`
    },
    'programming': {
      title: 'Programming',
      description: 'Master programming fundamentals and best practices',
      content: `Programming is the process of creating instructions for computers to execute. It involves problem-solving, logical thinking, and translating ideas into code using various programming languages.

      Core programming concepts:

      • Variables and Data Types: Storing and manipulating different kinds of information
      • Control Structures: If statements, loops, and conditional logic
      • Functions: Reusable blocks of code that perform specific tasks
      • Object-Oriented Programming: Classes, objects, inheritance, and polymorphism
      • Error Handling: Try-catch blocks and defensive programming techniques
      • Debugging: Identifying and fixing code issues systematically
      • Testing: Unit tests, integration tests, and test-driven development
      • Code Organization: Modules, packages, and clean code principles
      • Version Control: Git workflow and collaborative development

      Popular programming languages:

      • Python: Beginner-friendly, great for data science and web development
      • JavaScript: Essential for web development and increasingly popular for backend
      • Java: Enterprise applications and Android development
      • C++: System programming and performance-critical applications
      • Go: Modern language for concurrent and networked applications
      • Rust: Memory-safe systems programming

      Good programming practices include writing readable code, following naming conventions, commenting appropriately, and continuously refactoring to improve code quality.`
    },
    'devops': {
      title: 'DevOps',
      description: 'Automate and streamline software development workflows',
      content: `DevOps is a culture and set of practices that combines software development (Dev) and IT operations (Ops) to shorten development cycles, increase deployment frequency, and deliver high-quality software reliably.

      Core DevOps practices:

      • Continuous Integration (CI): Automatically building and testing code changes
      • Continuous Deployment (CD): Automating the release process to production
      • Infrastructure as Code (IaC): Managing infrastructure through code and version control
      • Containerization: Docker for consistent environments across development and production
      • Orchestration: Kubernetes for managing containerized applications at scale
      • Monitoring and Logging: Tracking application performance and system health
      • Configuration Management: Tools like Ansible, Chef, and Puppet for system configuration
      • Cloud Platforms: AWS, Azure, Google Cloud for scalable infrastructure
      • Security Integration: DevSecOps practices for building security into the pipeline

      Popular DevOps tools:

      • Version Control: Git, GitHub, GitLab
      • CI/CD: Jenkins, GitHub Actions, GitLab CI, CircleCI
      • Containers: Docker, Podman
      • Orchestration: Kubernetes, Docker Swarm
      • Monitoring: Prometheus, Grafana, ELK Stack
      • Cloud: AWS, Azure, GCP services and tools

      DevOps emphasizes collaboration, automation, and continuous improvement to deliver software faster while maintaining quality and reliability.`
    },
    'courses': {
      title: 'All Courses',
      description: 'Browse our complete catalog of programming courses',
      content: `Our comprehensive course catalog covers all aspects of modern software development, from fundamental programming concepts to advanced system architecture and emerging technologies.

      Course categories include:

      • Beginner-Friendly Programming: Start your coding journey with Python, JavaScript, or Java
      • Web Development: Full-stack development with modern frameworks and tools
      • Mobile Development: iOS with Swift, Android with Kotlin, and cross-platform solutions
      • Data Science & AI: Machine learning, data analysis, and artificial intelligence
      • Cloud & DevOps: Modern deployment, scaling, and infrastructure management
      • System Design: Architecture patterns for large-scale applications
      • Database Management: SQL, NoSQL, and data modeling best practices
      • Cybersecurity: Secure coding practices and application security
      • Game Development: Creating games with various engines and languages
      • Blockchain & Cryptocurrency: Distributed ledger technologies and smart contracts

      Each course includes:

      • Hands-on projects and real-world applications
      • Interactive coding exercises and challenges
      • Industry-relevant case studies and examples
      • Community support and peer learning opportunities
      • Certificates of completion and portfolio projects
      • Updated content reflecting current industry standards

      Whether you're a complete beginner or an experienced developer looking to expand your skills, our courses provide structured learning paths with practical applications and industry insights.`
    }
  };

  return categoryData[slug] || null;
};

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty.toLowerCase()) {
    case 'beginner':
      return 'bg-green-100 text-green-800';
    case 'intermediate':
      return 'bg-yellow-100 text-yellow-800';
    case 'advanced':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const categoryData = getCategoryData(params.slug);

  if (!categoryData) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold mb-4">{categoryData.title}</h1>
            <p className="text-xl text-blue-100 mb-8">{categoryData.description}</p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">About {categoryData.title}</h2>
          <div className="prose prose-lg max-w-none text-gray-700">
            {categoryData.content.split('\n').map((paragraph: string, index: number) => {
              const trimmed = paragraph.trim();
              if (!trimmed) return null;
              
              if (trimmed.startsWith('•')) {
                return (
                  <div key={index} className="flex items-start mb-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <p className="text-gray-700 leading-relaxed">{trimmed.substring(1).trim()}</p>
                  </div>
                );
              }
              
              return (
                <p key={index} className="mb-4 leading-relaxed text-gray-700">
                  {trimmed}
                </p>
              );
            })}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 border border-blue-100">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              Ready to dive deeper into {categoryData.title}?
            </h3>
            <p className="text-gray-600 mb-6">
              Explore our comprehensive courses and start your learning journey today.
            </p>
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors font-medium">
              Browse Courses
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}