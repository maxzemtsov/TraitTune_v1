import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star, Play } from 'lucide-react';

const SocialProof: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const testimonials = [
    {
      name: "Emily Rodriguez",
      role: "VP of People Operations",
      company: "TechStream Inc.",
      image: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=600",
      quote: "TraitTune has completely transformed our hiring process. We've reduced our time-to-hire by 47% while significantly improving the quality of our new team members. The insights from the assessments have been invaluable in making data-driven decisions.",
      metrics: ["Reduced time-to-hire by 47%", "Improved retention by 38%"]
    },
    {
      name: "Marcus Johnson",
      role: "Chief Human Resources Officer",
      company: "Global Finance Partners",
      image: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=600",
      quote: "The depth of insights from TraitTune assessments is unmatched. We've been able to build more cohesive teams and identify future leaders with remarkable accuracy. Our executive team now relies on these assessments for all strategic talent decisions.",
      metrics: ["Increased team performance by 52%", "Improved leadership selection accuracy by 63%"]
    },
    {
      name: "Sophia Chen",
      role: "Director of Talent Development",
      company: "Innovative Health Systems",
      image: "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=600",
      quote: "What sets TraitTune apart is how they combine scientific rigor with practical, actionable insights. The assessment data integrates seamlessly with our development programs, allowing us to create truly personalized growth plans for our team members.",
      metrics: ["Personalized development for 500+ employees", "41% increase in internal promotions"]
    },
    {
      name: "James Wilson",
      role: "CEO",
      company: "Nexus Solutions",
      image: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=600",
      quote: "As a rapidly growing company, we needed a solution that could scale with us while maintaining the quality of our talent decisions. TraitTune has been the perfect partner, providing insights that have directly contributed to our business success.",
      metrics: ["Supported 3x company growth", "Reduced bad hires by 76%"]
    },
    {
      name: "Aisha Patel",
      role: "Head of Recruiting",
      company: "Future Technologies",
      image: "https://images.pexels.com/photos/3746254/pexels-photo-3746254.jpeg?auto=compress&cs=tinysrgb&w=600",
      quote: "The candidate experience with TraitTune assessments has been exceptional. Applicants regularly comment on how engaging and insightful the process is, which has greatly enhanced our employer brand in a competitive talent market.",
      metrics: ["93% positive candidate feedback", "Increased application completion rates by 35%"]
    }
  ];
  
  const clientLogos = [
    { name: "TechStream", logo: "https://images.pexels.com/photos/5668858/pexels-photo-5668858.jpeg?auto=compress&cs=tinysrgb&w=600" },
    { name: "Global Finance", logo: "https://images.pexels.com/photos/5668859/pexels-photo-5668859.jpeg?auto=compress&cs=tinysrgb&w=600" },
    { name: "Health Systems", logo: "https://images.pexels.com/photos/5668860/pexels-photo-5668860.jpeg?auto=compress&cs=tinysrgb&w=600" },
    { name: "Nexus Solutions", logo: "https://images.pexels.com/photos/5439094/pexels-photo-5439094.jpeg?auto=compress&cs=tinysrgb&w=600" },
    { name: "Future Tech", logo: "https://images.pexels.com/photos/5473955/pexels-photo-5473955.jpeg?auto=compress&cs=tinysrgb&w=600" },
    { name: "Innovation Co", logo: "https://images.pexels.com/photos/5668954/pexels-photo-5668954.jpeg?auto=compress&cs=tinysrgb&w=600" },
    { name: "TechVision", logo: "https://images.pexels.com/photos/5668302/pexels-photo-5668302.jpeg?auto=compress&cs=tinysrgb&w=600" },
    { name: "Enterprise Solutions", logo: "https://images.pexels.com/photos/5668900/pexels-photo-5668900.jpeg?auto=compress&cs=tinysrgb&w=600" }
  ];
  
  const successMetrics = [
    { label: "Assessments Completed", value: "1.2M+" },
    { label: "Companies Using TraitTune", value: "500+" },
    { label: "Average Improvement in Hire Quality", value: "42%" },
    { label: "Client Retention Rate", value: "96%" }
  ];
  
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [isPlaying, testimonials.length]);
  
  const handlePrev = () => {
    setIsPlaying(false);
    setCurrentIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length);
  };
  
  const handleNext = () => {
    setIsPlaying(false);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  };
  
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <section className="section-padding bg-gray-50 dark:bg-gray-900">
      <div className="container px-4 sm:px-6 mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-display font-bold mb-6 gradient-text">
            Trusted by Industry Leaders
          </h2>
          
          <p className="text-lg text-gray-600 dark:text-gray-300">
            See how forward-thinking organizations use TraitTune to transform their talent processes and drive measurable business results.
          </p>
        </div>
        
        {/* Testimonial Carousel */}
        <div className="mb-20">
          <div className="glass-card p-6 sm:p-10 relative mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 rounded-full overflow-hidden mr-4 border-2 border-blue-200 dark:border-blue-800">
                    <img 
                      src={testimonials[currentIndex].image} 
                      alt={testimonials[currentIndex].name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">{testimonials[currentIndex].name}</h4>
                    <p className="text-gray-600 dark:text-gray-400">{testimonials[currentIndex].role}</p>
                    <p className="text-gray-500 dark:text-gray-500">{testimonials[currentIndex].company}</p>
                  </div>
                </div>
                
                <blockquote className="text-gray-700 dark:text-gray-300 italic mb-6 text-lg">
                  "{testimonials[currentIndex].quote}"
                </blockquote>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  {testimonials[currentIndex].metrics.map((metric, index) => (
                    <div key={index} className="flex items-center text-sm bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full">
                      <Star className="w-4 h-4 mr-1 text-blue-500 dark:text-blue-400" />
                      <span>{metric}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="hidden md:block">
                <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-800 relative">
                  <img
                    src="https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=600"
                    alt="Video testimonial thumbnail"
                    className="w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button className="w-16 h-16 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-lg hover:scale-110 transition-transform">
                      <Play className="w-6 h-6 ml-1" />
                    </button>
                  </div>
                  <div className="absolute bottom-4 left-4 text-white text-sm font-medium bg-gray-900/70 px-3 py-1 rounded-full">
                    Watch video
                  </div>
                </div>
              </div>
            </div>
            
            {/* Carousel Controls */}
            <div className="flex items-center justify-center mt-6">
              <button 
                onClick={handlePrev}
                className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 mr-2"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="flex space-x-2 mx-4">
                {testimonials.map((_, index) => (
                  <button 
                    key={index} 
                    onClick={() => {
                      setIsPlaying(false);
                      setCurrentIndex(index);
                    }}
                    className={`w-2 h-2 rounded-full transition-all ${
                      currentIndex === index 
                        ? 'bg-blue-600 dark:bg-blue-400 w-6' 
                        : 'bg-gray-300 dark:bg-gray-700'
                    }`}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>
              
              <button 
                onClick={togglePlayPause}
                className={`w-10 h-10 rounded-full flex items-center justify-center mr-2 ${
                  isPlaying
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {isPlaying ? (
                  <span className="w-3 h-3 bg-white rounded"></span>
                ) : (
                  <Play className="w-5 h-5 ml-0.5" />
                )}
              </button>
              
              <button 
                onClick={handleNext}
                className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Client Logos */}
        <div className="mb-20">
          <h3 className="text-xl font-display font-semibold mb-8 text-center">
            Trusted by Leading Organizations
          </h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-8 items-center justify-items-center">
            {clientLogos.map((client, index) => (
              <div 
                key={index} 
                className="h-12 flex items-center justify-center grayscale hover:grayscale-0 opacity-70 hover:opacity-100 transition-all"
              >
                <img 
                  src={client.logo} 
                  alt={client.name} 
                  className="max-h-full max-w-[100px]" 
                />
              </div>
            ))}
          </div>
        </div>
        
        {/* Success Metrics */}
        <div className="mb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {successMetrics.map((metric, index) => (
              <div key={index} className="glass-card p-6 text-center">
                <div className="text-3xl font-display font-bold gradient-text mb-2">{metric.value}</div>
                <p className="text-gray-600 dark:text-gray-400">{metric.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialProof;