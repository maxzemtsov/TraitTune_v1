import React from 'react';
import { Brain, Facebook, Twitter, Linkedin, Instagram, ArrowRight } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="container px-4 sm:px-6 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Company Info */}
          <div>
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 mr-3 relative overflow-visible">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg opacity-80"></div>
                <Brain className="w-10 h-10 text-white relative z-10" />
              </div>
              <span className="text-2xl font-display font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-300">TraitTune</span>
            </div>
            
            <p className="text-gray-400 mb-6">
              Empowering organizations to make better people decisions with science-backed assessment technology.
            </p>
            
            <div className="flex space-x-4">
              {[
                { icon: <Facebook className="w-5 h-5" />, href: "#facebook" },
                { icon: <Twitter className="w-5 h-5" />, href: "#twitter" },
                { icon: <Linkedin className="w-5 h-5" />, href: "#linkedin" },
                { icon: <Instagram className="w-5 h-5" />, href: "#instagram" }
              ].map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 text-gray-400 hover:bg-blue-600 hover:text-white transition-colors"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Product</h4>
            <ul className="space-y-4">
              {[
                { label: "Features", href: "#features" },
                { label: "Science", href: "#science" },
                { label: "Use Cases", href: "#usecases" },
                { label: "Pricing", href: "#pricing" },
                { label: "Resources", href: "#resources" }
              ].map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href} 
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Resources */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Resources</h4>
            <ul className="space-y-4">
              {[
                { label: "Documentation", href: "#docs" },
                { label: "Research Papers", href: "#research" },
                { label: "Case Studies", href: "#case-studies" },
                { label: "Blog", href: "#blog" },
                { label: "Support", href: "#support" }
              ].map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href} 
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Newsletter */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Stay Updated</h4>
            <p className="text-gray-400 mb-4">
              Subscribe to our newsletter for the latest product updates and talent insights.
            </p>
            
            <form className="mb-4">
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="bg-gray-800 text-white px-4 py-2 rounded-l-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-r-lg flex items-center justify-center transition-colors"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </form>
            
            <p className="text-gray-500 text-sm">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </div>
        
        {/* Bottom Footer */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-500 text-sm mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} TraitTune, Inc. All rights reserved.
            </div>
            
            <div className="flex flex-wrap justify-center space-x-6">
              {[
                { label: "Privacy Policy", href: "#privacy" },
                { label: "Terms of Service", href: "#terms" },
                { label: "Cookie Policy", href: "#cookies" },
                { label: "GDPR", href: "#gdpr" }
              ].map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;