import React, { useState } from 'react';
import { Users, Briefcase, GraduationCap, LineChart, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const UseCases: React.FC = () => {
  const [activeTab, setActiveTab] = useState('recruitment');
  
  const useCases = {
    recruitment: {
      title: "Talent Acquisition & Recruitment",
      description: "Identify top candidates efficiently and reduce hiring missteps with our comprehensive assessment platform.",
      icon: <Briefcase className="w-6 h-6" />,
      image: "https://images.pexels.com/photos/7654119/pexels-photo-7654119.jpeg?auto=compress&cs=tinysrgb&w=600",
      benefits: [
        "Screen candidates more effectively with science-backed assessments",
        "Reduce unconscious bias in the hiring process",
        "Identify candidates with the right cognitive abilities and personality fit",
        "Decrease time-to-hire by 42% with streamlined assessments"
      ],
      metrics: [
        { label: "Hiring Success Rate", value: "+68%" },
        { label: "Time-to-Hire", value: "-42%" },
        { label: "Cost-per-Hire", value: "-31%" }
      ],
      quote: {
        text: "TraitTune transformed our hiring process. We've cut our interview time in half while making better hiring decisions that stick.",
        author: "Sarah Chen",
        role: "Head of Talent Acquisition, TechVision"
      }
    },
    development: {
      title: "Team Development & Coaching",
      description: "Accelerate professional growth with targeted development plans based on individual assessment results.",
      icon: <Users className="w-6 h-6" />,
      image: "https://images.pexels.com/photos/3153198/pexels-photo-3153198.jpeg?auto=compress&cs=tinysrgb&w=600",
      benefits: [
        "Create personalized development plans based on assessment results",
        "Identify specific areas for skill enhancement and growth",
        "Improve team dynamics through greater self-awareness",
        "Track progress over time with follow-up assessments"
      ],
      metrics: [
        { label: "Employee Engagement", value: "+47%" },
        { label: "Skill Improvement", value: "+38%" },
        { label: "Team Performance", value: "+52%" }
      ],
      quote: {
        text: "The insights from TraitTune assessments have completely transformed our approach to professional development. Our coaching is now more targeted and effective.",
        author: "David Johnson",
        role: "L&D Director, Global Finance Corp"
      }
    },
    leadership: {
      title: "Leadership Assessment & Succession",
      description: "Identify and develop future leaders with scientific precision and strategic foresight.",
      icon: <GraduationCap className="w-6 h-6" />,
      image: "https://images.pexels.com/photos/7647913/pexels-photo-7647913.jpeg?auto=compress&cs=tinysrgb&w=600",
      benefits: [
        "Identify high-potential employees with leadership capabilities",
        "Create targeted development plans for future leaders",
        "Ensure smooth succession planning with data-backed decisions",
        "Reduce leadership transition risks and costs"
      ],
      metrics: [
        { label: "Succession Readiness", value: "+76%" },
        { label: "Leadership Bench Strength", value: "+63%" },
        { label: "Executive Retention", value: "+45%" }
      ],
      quote: {
        text: "TraitTune has been instrumental in our succession planning process. We now have a clear picture of our leadership pipeline and can develop talent with precision.",
        author: "Michael Rodriguez",
        role: "CHRO, Enterprise Solutions Inc."
      }
    },
    performance: {
      title: "Performance Optimization",
      description: "Maximize team performance by aligning roles with innate capabilities and strengths.",
      icon: <LineChart className="w-6 h-6" />,
      image: "https://images.pexels.com/photos/7176305/pexels-photo-7176305.jpeg?auto=compress&cs=tinysrgb&w=600",
      benefits: [
        "Optimize team compositions based on complementary traits",
        "Align individual strengths with role requirements",
        "Identify and address team capability gaps",
        "Improve collaboration and reduce workplace conflicts"
      ],
      metrics: [
        { label: "Team Productivity", value: "+58%" },
        { label: "Project Success Rate", value: "+49%" },
        { label: "Employee Satisfaction", value: "+61%" }
      ],
      quote: {
        text: "Using TraitTune to align our team structure with individual strengths has dramatically improved our performance metrics across all departments.",
        author: "Jennifer Lewis",
        role: "COO, Innovative Health Systems"
      }
    }
  };
  
  const selectedUseCase = useCases[activeTab as keyof typeof useCases];

  return (
    <section id="usecases" className="section-padding bg-white dark:bg-gray-900 py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">Solutions for Every Need</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
            Whether you're an individual seeking growth or an organization building high-performing teams, we have the right solution for you.
          </p>
          <div className="flex justify-center gap-6">
            <Link 
              to="/b2c" 
              className="inline-flex items-center px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              <Users className="w-5 h-5 mr-2" />
              Individual Solutions
            </Link>
            <Link 
              to="/b2b" 
              className="inline-flex items-center px-6 py-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
            >
              <Briefcase className="w-5 h-5 mr-2" />
              Business Solutions
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          {Object.entries(useCases).map(([key, _]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`p-4 text-left transition-all rounded-lg ${
                activeTab === key
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center">
                {useCases[key as keyof typeof useCases].icon}
                <span className="ml-3 font-medium">
                  {useCases[key as keyof typeof useCases].title}
                </span>
              </div>
            </button>
          ))}
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold mb-6">{selectedUseCase.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-8">{selectedUseCase.description}</p>
              <ul className="space-y-4">
                {selectedUseCase.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-blue-600 mt-1 mr-3" />
                    <span className="text-gray-700 dark:text-gray-200">{benefit}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 grid grid-cols-3 gap-6">
                {selectedUseCase.metrics.map((metric, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{metric.value}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{metric.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <img
                src={selectedUseCase.image}
                alt={selectedUseCase.title}
                className="rounded-lg shadow-2xl"
              />
              <blockquote className="absolute bottom-6 right-6 left-6 bg-white dark:bg-gray-900 p-6 rounded-lg shadow-xl">
                <p className="text-gray-600 dark:text-gray-300 italic mb-4">{selectedUseCase.quote.text}</p>
                <footer>
                  <strong className="text-gray-900 dark:text-white">{selectedUseCase.quote.author}</strong>
                  <div className="text-sm text-gray-500">{selectedUseCase.quote.role}</div>
                </footer>
              </blockquote>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UseCases;