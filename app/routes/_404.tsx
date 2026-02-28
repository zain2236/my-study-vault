import type { MetaFunction } from 'react-router';
import { Home, Search, ArrowLeft, BookOpen } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';

export const meta: MetaFunction = () => {
  return [
    { title: 'Page Not Found - Study Vault' },
    {
      name: 'description',
      content: 'The page you are looking for could not be found. Return to Study Vault to browse educational resources.',
    },

    // Open Graph
    { property: 'og:type', content: 'website' },
    { property: 'og:title', content: 'Page Not Found - Study Vault' },
    {
      property: 'og:description',
      content: 'The page you are looking for could not be found.',
    },
    { property: 'og:site_name', content: 'Study Vault' },

    // Additional SEO
    { name: 'robots', content: 'noindex, nofollow' },
    { name: 'theme-color', content: '#d97757' },
  ];
};

export default function NotFoundPage() {
  const [floatOffset, setFloatOffset] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setFloatOffset(prev => (prev + 1) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const floatY = Math.sin(floatOffset * 0.05) * 10;

  return (
    <div className="min-h-screen bg-[#f5f5f0] relative overflow-hidden flex items-center justify-center px-4">
      {/* Animated Background Blobs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-[#d97757] opacity-10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#d97757] opacity-10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#d97757] opacity-5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>

      {/* Floating Books Animation */}
      <div className="absolute top-10 left-1/4 opacity-20 animate-bounce" style={{ animationDelay: '0.5s' }}>
        <BookOpen className="w-12 h-12 text-[#d97757]" />
      </div>
      <div className="absolute bottom-20 right-1/4 opacity-20 animate-bounce" style={{ animationDelay: '1.5s' }}>
        <BookOpen className="w-16 h-16 text-[#d97757]" />
      </div>
      <div className="absolute top-1/3 right-10 opacity-20 animate-bounce" style={{ animationDelay: '2.5s' }}>
        <BookOpen className="w-10 h-10 text-[#d97757]" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center max-w-2xl">
        {/* Animated 404 */}
        <div className="relative mb-8">
          <div 
            className="text-[180px] sm:text-[240px] font-heading font-extrabold text-[#d97757] opacity-20 leading-none select-none"
            style={{ 
              transform: `translateY(${floatY}px)`,
              transition: 'transform 0.1s ease-out'
            }}
          >
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white rounded-full p-8 shadow-2xl animate-pulse">
              <Search className="w-16 h-16 text-[#d97757]" />
            </div>
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-6">
          <h1 className="text-4xl sm:text-5xl font-heading font-bold text-gray-900">
            Oops! Page Not Found
          </h1>
          <p className="text-xl text-gray-600 font-body max-w-md mx-auto">
            Looks like this page took a study break and wandered off. Let's get you back to your resources!
          </p>

          {/* Fun Messages */}
          <div className="bg-white rounded-2xl p-6 shadow-md shadow-[#d97757]/10 max-w-md mx-auto transform hover:scale-[1.02] transition-transform">
            <p className="text-sm text-gray-700 font-body italic">
              "This page is harder to find than lecture notes before finals..."
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <button 
              onClick={() => navigate(-1)}
              className="group flex items-center justify-center space-x-2 bg-linear-to-r from-[#d97757] to-[#c66847] text-white px-8 py-4 rounded-lg font-heading font-semibold hover:shadow-md hover:shadow-[#d97757]/20 transition-all transform hover:scale-[1.02]"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span>Go Back</span>
            </button>
            
            <Link 
              to="/"
              className="flex items-center justify-center space-x-2 px-8 py-4 rounded-lg font-heading font-semibold text-gray-700 hover:text-[#d97757] bg-[#f5f5f0] transition-all"
            >
              <Home className="w-5 h-5" />
              <span>Go Home</span>
            </Link>
          </div>

          {/* Quick Links */}
          <div className="pt-8 border-t border-gray-300 my-12">
            <p className="text-sm text-gray-500 font-body mb-4">Quick Links:</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link 
                to="/user/dashboard" 
                className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-[#d97757] hover:text-white transition-all text-sm font-heading font-medium shadow-sm"
              >
                Dashboard
              </Link>
              <Link 
                to="/resources" 
                className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-[#d97757] hover:text-white transition-all text-sm font-heading font-medium shadow-sm"
              >
                Browse Resources
              </Link>
              <Link 
                to="/login" 
                className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-[#d97757] hover:text-white transition-all text-sm font-heading font-medium shadow-sm"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Animated Particles */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        .animate-pulse {
          animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        .animate-bounce {
          animation: bounce 3s infinite;
        }
        
        @keyframes bounce {
          0%, 100% {
            transform: translateY(-5%);
            animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
          }
          50% {
            transform: translateY(0);
            animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
          }
        }
      `}</style>
    </div>
  );
}