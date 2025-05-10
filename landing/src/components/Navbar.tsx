import React, { useState, useEffect } from 'react';
import { Menu, X, Brain } from 'lucide-react';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-md' 
        : 'bg-transparent'
    }`}>
      <div className="container px-4 sm:px-6 mx-auto">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div className="flex items-center">
            <a href="#" className="flex items-center">
              <div className="w-8 h-8 mr-2 relative overflow-visible">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg opacity-80 pulse-animation"></div>
                <Brain className="w-8 h-8 text-white relative z-10" />
              </div>
              <span className="text-xl font-display font-semibold gradient-text">TraitTune</span>
            </a>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-white font-medium transition-colors">Features</a>
            <a href="#science" className="text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-white font-medium transition-colors">Science</a>
            <a href="#usecases" className="text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-white font-medium transition-colors">Use Cases</a>
            <a href="#pricing" className="text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-white font-medium transition-colors">Pricing</a>
          </nav>
          
          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <a href="#demo" className="button-secondary">Try Free</a>
            <a href="#demo" className="button-primary">Schedule Demo</a>
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 shadow-lg">
          <div className="px-4 pt-2 pb-4 space-y-1">
            <a href="#features" className="block py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-white font-medium" onClick={() => setMobileMenuOpen(false)}>Features</a>
            <a href="#science" className="block py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-white font-medium" onClick={() => setMobileMenuOpen(false)}>Science</a>
            <a href="#usecases" className="block py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-white font-medium" onClick={() => setMobileMenuOpen(false)}>Use Cases</a>
            <a href="#pricing" className="block py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-white font-medium" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
            <div className="pt-2 space-y-2">
              <a href="#demo" className="block w-full py-2 text-center text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" onClick={() => setMobileMenuOpen(false)}>Try Free</a>
              <a href="#demo" className="block w-full py-2 text-center text-white bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg hover:from-blue-700 hover:to-indigo-800 transition-colors" onClick={() => setMobileMenuOpen(false)}>Schedule Demo</a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;