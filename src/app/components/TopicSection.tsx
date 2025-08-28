"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface TopicCard {
  title: string;
  href?: string; // example: "/docs/javascript-arrays"
}

interface TopicSectionProps {
  title: string;
  cards: TopicCard[];
  showViewAll?: boolean;
  onViewAll?: () => void;
  onCardClick?: (card: TopicCard) => void;
}

export default function TopicSection({
  title,
  cards,
  showViewAll = true,
  onViewAll,
  onCardClick,
}: TopicSectionProps) {
  const handleCardClick = (card: TopicCard) => {
    if (onCardClick) {
      onCardClick(card);
    }
  };

  const handleViewAll = () => {
    if (onViewAll) {
      onViewAll();
    } else {
      console.log(`View all ${title} topics`);
    }
  };

  return (
    <div className="w-4xl py-8 mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
        {showViewAll && (
          <button
            onClick={handleViewAll}
            className="px-4 py-2 text-slate-600 hover:text-blue-600 border border-slate-300 hover:border-blue-300 rounded-lg transition-colors font-medium"
          >
            View All
          </button>
        )}
      </div>

      <div className="mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
        {cards.map((card, index) => (
          <Link key={index} href={card.href ?? "#"}>
            <div
              onClick={() => handleCardClick(card)}
              className="group bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-left relative overflow-hidden cursor-pointer"
            >
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

              <div className="relative z-10">
                <h3 className="text-lg font-semibold mb-4 group-hover:text-blue-50 transition-colors">
                  {card.title}
                </h3>

                <div className="flex justify-end">
                  <div className="w-8 h-8 bg-white/20 group-hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-200 group-hover:translate-x-1">
                    <ArrowRight size={16} className="text-white" />
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// Example usage
export function DSATopicSection() {
  const dsaTopics: TopicCard[] = [
    { title: "JavaScript Arrays", href: "/docs/javascript-arrays" },
    { title: "HTML Body", href: "/docs/html-body" },
    { title: "Python Variables", href: "/docs/python-variables" },
  ];

  return (
    <TopicSection
      title="Docs"
      cards={dsaTopics}
      onCardClick={(card) => console.log(`Navigating to: ${card.title}`)}
      onViewAll={() => console.log("View all Docs")}
    />
  );
}
