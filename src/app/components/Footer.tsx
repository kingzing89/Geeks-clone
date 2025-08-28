import Link from 'next/link';
import { MapPin, Facebook, Instagram, Linkedin, Twitter, Youtube } from 'lucide-react';

interface FooterLink {
  name: string;
  href: string;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

const Footer: React.FC = () => {
  const footerSections: FooterSection[] = [
    {
      title: "Company",
      links: [
        { name: "About Us", href: "/#about" },
        { name: "Legal", href: "/#legal" },
        { name: "Privacy Policy", href: "/#privacy" },
        { name: "In Media", href: "/#media" },
        { name: "Contact Us", href: "/#contact" },
        { name: "Advertise with us", href: "/#advertise" },
        { name: "GFG Corporate Solution", href: "/#corporate" },
        { name: "Placement Training Program", href: "/#placement" }
      ]
    },
    {
      title: "Languages",
      links: [
        { name: "Python", href: "/#python" },
        { name: "Java", href: "/#java" },
        { name: "C++", href: "/#cpp" },
        { name: "PHP", href: "/#php" },
        { name: "GoLang", href: "/#golang" },
        { name: "SQL", href: "/#sql" },
        { name: "R Language", href: "/#r-language" },
        { name: "Android Tutorial", href: "/#android" },
        { name: "Tutorials Archive", href: "/#tutorials" }
      ]
    },
    {
      title: "DSA",
      links: [
        { name: "DSA Tutorial", href: "/#dsa-tutorial" },
        { name: "Basic DSA Problems", href: "/#basic-dsa" },
        { name: "DSA Roadmap", href: "/#dsa-roadmap" },
        { name: "Top 100 DSA Interview Problems", href: "/#top-100-dsa" },
        { name: "DSA Roadmap by Sandeep Jain", href: "/#dsa-roadmap-sandeep" },
        { name: "All Cheat Sheets", href: "/#cheat-sheets" }
      ]
    },
    {
      title: "Data Science & ML",
      links: [
        { name: "Data Science With Python", href: "/#data-science-python" },
        { name: "Data Science For Beginner", href: "/#data-science-beginner" },
        { name: "Machine Learning", href: "/#machine-learning" },
        { name: "ML Maths", href: "/#ml-maths" },
        { name: "Data Visualisation", href: "/#data-visualization" },
        { name: "Pandas", href: "/#pandas" },
        { name: "NumPy", href: "/#numpy" },
        { name: "NLP", href: "/#nlp" },
        { name: "Deep Learning", href: "/#deep-learning" }
      ]
    },
    {
      title: "Web Technologies",
      links: [
        { name: "HTML", href: "/#html" },
        { name: "CSS", href: "/#css" },
        { name: "JavaScript", href: "/#javascript" },
        { name: "TypeScript", href: "/#typescript" },
        { name: "ReactJS", href: "/#reactjs" },
        { name: "NextJS", href: "/#nextjs" },
        { name: "Bootstrap", href: "/#bootstrap" },
        { name: "Web Design", href: "/#web-design" }
      ]
    },
    {
      title: "Computer Science",
      links: [
        { name: "Operating Systems", href: "/#operating-systems" },
        { name: "Computer Network", href: "/#computer-network" },
        { name: "Database Management System", href: "/#database-management" },
        { name: "Software Engineering", href: "/#software-engineering" },
        { name: "Digital Logic Design", href: "/#digital-logic" },
        { name: "Engineering Maths", href: "/#engineering-maths" },
        { name: "Software Development", href: "/#software-development" },
        { name: "Software Testing", href: "/#software-testing" }
      ]
    }
  ];

  return (
    <footer className="bg-white border-t border-gray-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Footer Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-8">
          {footerSections.map((section, index) => (
            <div key={index}>
              <h3 className="font-semibold text-gray-900 mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link 
                      href={link.href}
                      className="text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Social Media Icons */}
        <div className="flex justify-start space-x-4 mb-8">
          <a href="#" className="bg-gray-700 hover:bg-gray-800 text-white p-3 rounded-full transition-colors duration-200">
            <Facebook size={20} />
          </a>
          <a href="#" className="bg-gray-700 hover:bg-gray-800 text-white p-3 rounded-full transition-colors duration-200">
            <Instagram size={20} />
          </a>
          <a href="#" className="bg-gray-700 hover:bg-gray-800 text-white p-3 rounded-full transition-colors duration-200">
            <Linkedin size={20} />
          </a>
          <a href="#" className="bg-gray-700 hover:bg-gray-800 text-white p-3 rounded-full transition-colors duration-200">
            <Twitter size={20} />
          </a>
          <a href="#" className="bg-gray-700 hover:bg-gray-800 text-white p-3 rounded-full transition-colors duration-200">
            <Youtube size={20} />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;