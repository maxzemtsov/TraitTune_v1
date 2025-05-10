import React from 'react';
import { Brain, ArrowRight } from 'lucide-react';

const HeroSection: React.FC = () => {
  return (
    <section className="relative pt-24 pb-12 md:pt-32 md:pb-20 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-blue-200 dark:bg-blue-900 rounded-full filter blur-3xl opacity-20 -z-10 animate-blob"></div>
      <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-purple-200 dark:bg-purple-900 rounded-full filter blur-3xl opacity-20 -z-10 animate-blob animation-delay-2000"></div>
      
      <div className="container px-4 sm:px-6 mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="max-w-xl mx-auto lg:mx-0 text-center lg:text-left">
            <div className="mb-6 inline-flex items-center px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-300">
              <span className="text-sm font-medium">Advanced Assessment Technology</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold mb-6 tracking-tight">
              <span className="gradient-text">Precision Assessment</span> for Modern Workplaces
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              Leverage state-of-the-art psychometric technology to identify the perfect candidates, develop your team, and build high-performing organizations.
            </p>
            
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center lg:justify-start">
              <a href="#demo" className="button-primary flex items-center justify-center">
                <span>Schedule Demo</span>
                <ArrowRight className="ml-2 w-5 h-5" />
              </a>
              <a href="#try-free" className="button-secondary flex items-center justify-center">
                Try Free Assessment
              </a>
            </div>
            
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start text-sm text-gray-500 dark:text-gray-400">
              <div className="flex -space-x-2 mb-3 sm:mb-0 sm:mr-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-900 overflow-hidden">
                    <img 
                      src={`https://i.pravatar.cc/100?img=${i + 10}`} 
                      alt={`User ${i}`} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <span>Trusted by 500+ forward-thinking companies</span>
            </div>
          </div>
          
          {/* Hero Visual */}
          <div className="relative mx-auto lg:mx-0 max-w-md">
            <div className="w-full aspect-square relative">
              {/* Orb container */}
              <div className="absolute inset-0 glass-card rounded-full flex items-center justify-center">
                {/* The brain orb */}
                <div className="w-4/5 h-4/5 rounded-full relative float-animation">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full opacity-70"></div>
                  <div className="absolute inset-4 bg-white dark:bg-gray-900 rounded-full"></div>
                  <div className="absolute inset-8 flex items-center justify-center">
                    <div className="w-full h-full relative">
                      <img 
                        src="https://images.pexels.com/photos/1793071/pexels-photo-1793071.jpeg?auto=compress&cs=tinysrgb&w=600" 
                        alt="Brain visualization" 
                        className="w-full h-full object-cover rounded-full"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-full pulse-animation"></div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating data points */}
              <div className="absolute top-1/4 -left-8 glass-card p-3 rounded-lg float-animation">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-green-400"></div>
                  <span className="text-sm font-medium">Analytical Skills</span>
                </div>
              </div>
              
              <div className="absolute bottom-1/4 -right-8 glass-card p-3 rounded-lg float-animation animation-delay-1000">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-purple-400"></div>
                  <span className="text-sm font-medium">Team Dynamics</span>
                </div>
              </div>
              
              <div className="absolute top-0 right-1/4 glass-card p-3 rounded-lg float-animation animation-delay-2000">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-blue-400"></div>
                  <span className="text-sm font-medium">Leadership</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;