import React from 'react';
import { motion } from 'framer-motion';
import { Player } from '@lottiefiles/react-lottie-player';
import { useInView } from 'react-intersection-observer';
import { Brain, Sparkles, Heart, GraduationCap, Briefcase, Users } from 'lucide-react';

const B2CPage: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const categories = [
    {
      title: "Students & Parents",
      icon: <GraduationCap className="w-8 h-8" />,
      description: "Make informed decisions about your academic future with AI-powered career path guidance",
      features: [
        "Career aptitude assessment",
        "University program recommendations",
        "Skills development roadmap",
        "Industry trends analysis"
      ]
    },
    {
      title: "Career Transition",
      icon: <Briefcase className="w-8 h-8" />,
      description: "Find your new career direction with personalized insights and recommendations",
      features: [
        "Skills transferability analysis",
        "Industry transition paths",
        "Personality-career fit",
        "Retraining recommendations"
      ]
    },
    {
      title: "Personal Growth",
      icon: <Sparkles className="w-8 h-8" />,
      description: "Discover your potential and develop your strengths",
      features: [
        "Personal strengths assessment",
        "Development opportunities",
        "Goal setting guidance",
        "Progress tracking"
      ]
    },
    {
      title: "Relationships",
      icon: <Heart className="w-8 h-8" />,
      description: "Improve your relationships with deeper understanding of compatibility",
      features: [
        "Compatibility analysis",
        "Communication style insights",
        "Relationship dynamics",
        "Growth opportunities"
      ]
    }
  ];

  return (
    <div className="min-h-screen py-20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="container mx-auto px-4"
      >
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            Discover Your True Potential
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Unlock insights about yourself, make better decisions, and find your path to success with our advanced assessment platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {categories.map((category, index) => (
            <motion.div
              key={index}
              ref={ref}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-card p-6 rounded-xl hover:transform hover:scale-105 transition-all duration-300"
            >
              <div className="mb-4 text-blue-600 dark:text-blue-400">
                {category.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3">{category.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">{category.description}</p>
              <ul className="space-y-2">
                {category.features.map((feature, fIndex) => (
                  <li key={fIndex} className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Interactive Assessment Demo */}
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 p-1">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">Try Our Assessment</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-8">
                  Experience our AI-powered assessment platform and get personalized insights about your potential.
                </p>
                <button className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-8 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-300">
                  Start Free Assessment
                </button>
              </div>
              <div className="relative h-96">
                <Player
                  autoplay
                  loop
                  src="https://assets10.lottiefiles.com/packages/lf20_xyadoh9h.json"
                  style={{ height: '100%', width: '100%' }}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default B2CPage;