import React from 'react';
import { motion } from 'framer-motion';
import { Player } from '@lottiefiles/react-lottie-player';
import { useInView } from 'react-intersection-observer';
import { Building2, Rocket, LineChart, Users, Shield, Brain } from 'lucide-react';

const B2BPage: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const solutions = [
    {
      title: "Startup Team Building",
      icon: <Rocket className="w-8 h-8" />,
      description: "Build high-performing startup teams with scientific precision",
      features: [
        "Co-founder compatibility analysis",
        "Team dynamics assessment",
        "Role-fit optimization",
        "Growth potential evaluation"
      ]
    },
    {
      title: "SMB Talent Optimization",
      icon: <Building2 className="w-8 h-8" />,
      description: "Compete effectively with enterprise-level talent strategies",
      features: [
        "Cost-effective hiring",
        "Team performance optimization",
        "Employee development planning",
        "Retention strategy insights"
      ]
    },
    {
      title: "Investment Due Diligence",
      icon: <LineChart className="w-8 h-8" />,
      description: "Minimize investment risks with deep team analysis",
      features: [
        "Team capability assessment",
        "Leadership potential evaluation",
        "Culture fit analysis",
        "Growth readiness metrics"
      ]
    },
    {
      title: "Enterprise Solutions",
      icon: <Shield className="w-8 h-8" />,
      description: "Comprehensive talent management for large organizations",
      features: [
        "Scale-up team planning",
        "Cross-functional team optimization",
        "Leadership development",
        "Succession planning"
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
            Transform Your Business with Scientific Team Building
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Leverage advanced psychometrics and AI to build, optimize, and scale high-performing teams.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {solutions.map((solution, index) => (
            <motion.div
              key={index}
              ref={ref}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-card p-6 rounded-xl hover:transform hover:scale-105 transition-all duration-300"
            >
              <div className="mb-4 text-blue-600 dark:text-blue-400">
                {solution.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3">{solution.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">{solution.description}</p>
              <ul className="space-y-2">
                {solution.features.map((feature, fIndex) => (
                  <li key={fIndex} className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* ROI Calculator */}
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 p-1 mb-20">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">Calculate Your ROI</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-8">
                  See how our scientific team building approach can impact your bottom line.
                </p>
                <button className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-8 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-300">
                  Try ROI Calculator
                </button>
              </div>
              <div className="relative h-96">
                <Player
                  autoplay
                  loop
                  src="https://assets8.lottiefiles.com/packages/lf20_bdlrkrqf.json"
                  style={{ height: '100%', width: '100%' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Success Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { metric: "45%", label: "Improved Team Performance" },
            { metric: "68%", label: "Better Hiring Decisions" },
            { metric: "3.2x", label: "ROI in First Year" }
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-card p-8 text-center rounded-xl"
            >
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {item.metric}
              </div>
              <div className="text-gray-600 dark:text-gray-300">
                {item.label}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default B2BPage;