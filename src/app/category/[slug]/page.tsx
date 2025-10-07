// app/category/[slug]/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import Category from "../../../models/Category";
import dbConnect from '@/lib/mongodb';


// Types based on your Category model
interface CategoryData {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  content?: string;
  bgColor?: string;
  icon?: string;
  order?: number;
  createdAt: Date;
  updatedAt: Date;
}

// API function to fetch category data
// API function to fetch category data
const getCategoryData = async (slug: string): Promise<CategoryData | null> => {
  try {
    await dbConnect();
    console.log("Fetching category with slug:", slug);

    const category = await Category.findOne({ slug }).lean();

    if (!category) {
      return null;
    }

    return {
      _id: category._id.toString(),
      title: category.title || "Category Not Found",
      slug: category.slug,
      description: category.description,
      content: category.content,
      bgColor: category.bgColor,
      icon: category.icon,
      order: category.order,
      createdAt: category.createdAt || new Date(),
      updatedAt: category.updatedAt || new Date(),
    };
  } catch (error) {
    console.error("Error fetching category data:", error);
    return null;
  }
};

// Function to parse content and handle different formats
const parseContent = (content?: string) => {
  if (!content) return null;

  const paragraphs = content.split("\n").filter((p) => p.trim());

  return paragraphs.map((paragraph: string, index: number) => {
    const trimmed = paragraph.trim();
    if (!trimmed) return null;

    if (trimmed.startsWith("•") || trimmed.startsWith("-")) {
      return (
        <div key={index} className="flex items-start mb-3">
          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
          <p className="text-gray-700 leading-relaxed">
            {trimmed.substring(1).trim()}
          </p>
        </div>
      );
    }

    if (trimmed.endsWith(":")) {
      return (
        <h3
          key={index}
          className="text-lg font-semibold text-gray-900 mt-6 mb-3"
        >
          {trimmed.slice(0, -1)}
        </h3>
      );
    }

    return (
      <p key={index} className="mb-3 leading-relaxed text-gray-700">
        {trimmed}
      </p>
    );
  });
};

// Helper function to get proper background color class for admin panel colors
const getBgColorClass = (bgColor?: string) => {
  // Map admin panel color values to hero section gradients (darker for better text contrast)
  const adminColorMap: { [key: string]: string } = {
    LightBlue: "bg-gradient-to-r from-sky-500 to-blue-600",
    SoftGreen: "bg-gradient-to-r from-green-500 to-emerald-600",
    PaleRose: "bg-gradient-to-r from-rose-500 to-pink-600",
    LavenderGray: "bg-gradient-to-r from-slate-500 to-purple-600",
    WarmBeige: "bg-gradient-to-r from-amber-500 to-yellow-600",
    SoftPink: "bg-gradient-to-r from-pink-500 to-rose-600",
    PaleIndigo: "bg-gradient-to-r from-indigo-500 to-violet-600",
    MintGreen: "bg-gradient-to-r from-teal-500 to-cyan-600",
    Peach: "bg-gradient-to-r from-orange-500 to-amber-600",
    SoftTeal: "bg-gradient-to-r from-teal-500 to-cyan-600",
  };

  // Return the mapping if bgColor exists, otherwise return default
  if (bgColor && adminColorMap[bgColor]) {
    return adminColorMap[bgColor];
  }

  // Default fallback
  return "bg-gradient-to-r from-gray-500 to-slate-600";
};

// Helper function to get complementary sidebar color
const getSidebarAccentColor = (bgColor?: string) => {
  const sidebarColorMap: { [key: string]: string } = {
    LightBlue: "from-sky-50 to-blue-100 border-sky-200",
    SoftGreen: "from-green-50 to-emerald-100 border-green-200",
    PaleRose: "from-rose-50 to-pink-100 border-rose-200",
    LavenderGray: "from-slate-50 to-purple-100 border-slate-200",
    WarmBeige: "from-amber-50 to-yellow-100 border-amber-200",
    SoftPink: "from-pink-50 to-rose-100 border-pink-200",
    PaleIndigo: "from-indigo-50 to-violet-100 border-indigo-200",
    MintGreen: "from-teal-50 to-cyan-100 border-teal-200",
    Peach: "from-orange-50 to-amber-100 border-orange-200",
    SoftTeal: "from-teal-50 to-cyan-100 border-teal-200",
  };

  if (bgColor && sidebarColorMap[bgColor]) {
    return sidebarColorMap[bgColor];
  }

  return "from-blue-50 to-indigo-100 border-blue-200";
};

// Helper function to get button color
const getButtonColor = (bgColor?: string) => {
  const buttonColorMap: { [key: string]: string } = {
    LightBlue: "from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700",
    SoftGreen:
      "from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700",
    PaleRose: "from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700",
    LavenderGray:
      "from-slate-600 to-purple-600 hover:from-slate-700 hover:to-purple-700",
    WarmBeige:
      "from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700",
    SoftPink: "from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700",
    PaleIndigo:
      "from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700",
    MintGreen:
      "from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700",
    Peach:
      "from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700",
    SoftTeal: "from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700",
  };

  if (bgColor && buttonColorMap[bgColor]) {
    return buttonColorMap[bgColor];
  }

  return "from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700";
};

export default async function CategoryPage({
  params,
}: {
  params: { slug: string };
}) {
  const categoryData = await getCategoryData(params.slug);

  if (!categoryData) {
    notFound();
  }

  const hasContent = categoryData.content && categoryData.content.trim();
  const bgColorClass = getBgColorClass(categoryData.bgColor);
  const sidebarAccentColor = getSidebarAccentColor(categoryData.bgColor);
  const buttonColor = getButtonColor(categoryData.bgColor);

  console.log("bg color class", bgColorClass);
  console.log("admin panel color", categoryData.bgColor);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className={`${bgColorClass} text-white`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`max-w-4xl ${
              categoryData.description ? "py-16" : "py-12"
            }`}
          >
            <div className="flex items-center gap-4 mb-4">
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                {categoryData.title}
              </h1>
            </div>

            {categoryData.description && (
              <p className="text-lg md:text-xl text-white/90 leading-relaxed">
                {categoryData.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 order-2 lg:order-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">
                About {categoryData.title}
              </h2>

              {hasContent ? (
                <div className="prose prose-gray max-w-none">
                  {parseContent(categoryData.content)}
                </div>
              ) : (
                <p className="text-gray-600 leading-relaxed">
                  Learn more about {categoryData.title} and enhance your
                  programming skills.
                </p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <div className="space-y-6">
              {/* Category Info Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Category Info
                </h3>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Created:</span>
                    <span className="font-medium text-gray-900">
                      {new Date(categoryData.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Updated:</span>
                    <span className="font-medium text-gray-900">
                      {new Date(categoryData.updatedAt).toLocaleDateString()}
                    </span>
                  </div>

                  {categoryData.order !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Order:</span>
                      <span className="font-medium text-gray-900">
                        #{categoryData.order}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Call to Action Card with matching colors */}
              <div
                className={`bg-gradient-to-br ${sidebarAccentColor} rounded-xl p-6 border`}
              >
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Ready to explore {categoryData.title}?
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                    Start your learning journey with comprehensive courses and
                    tutorials.
                  </p>
                  <Link
                    href="/courses"
                    className={`w-full bg-gradient-to-r ${buttonColor} text-white px-4 py-2.5 rounded-lg transition-all duration-200 font-medium text-sm block text-center`}
                  >
                    Browse Courses
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Generate static params for better SEO
export async function generateStaticParams() {
  try {
    await dbConnect();
    const categories = await Category.find({}).select('slug').lean();
    
    return categories.map((category) => ({
      slug: category.slug,
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}


// Metadata generation for SEO
// Metadata generation for SEO
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const categoryData = await getCategoryData(params.slug);

  if (!categoryData) {
    return {
      title: "Category Not Found",
      description: "The requested category could not be found.",
    };
  }

  return {
    title: `${categoryData.title} | Learn Programming`,
    description:
      categoryData.description ||
      `Learn about ${categoryData.title} with comprehensive tutorials and courses.`,
  };
}