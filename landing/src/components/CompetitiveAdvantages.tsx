import React from 'react';
import { Check, Zap, X, ArrowRight } from 'lucide-react';

const CompetitiveAdvantages: React.FC = () => {
  const competitors = [
    { name: "TraitTune", isPrimary: true },
    { name: "Traditional Tests", isPrimary: false },
    { name: "Basic Assessments", isPrimary: false }
  ];

  const features = [
    { 
      name: "Assessment Duration", 
      comparison: [
        { value: "15 minutes", highlight: true },
        { value: "60+ minutes", highlight: false },
        { value: "30 minutes", highlight: false }
      ]
    },
    { 
      name: "Scientific Validation", 
      comparison: [
        { value: "Extensive", highlight: true },
        { value: "Moderate", highlight: false },
        { value: "Limited", highlight: false }
      ]
    },
    { 
      name: "AI-Enhanced Insights", 
      comparison: [
        { value: <Check className="w-5 h-5 text-green-500" />, highlight: true },
        { value: <X className="w-5 h-5 text-red-500" />, highlight: false },
        { value: <X className="w-5 h-5 text-red-500" />, highlight: false }
      ]
    },
    { 
      name: "Team Compatibility Analysis", 
      comparison: [
        { value: <Check className="w-5 h-5 text-green-500" />, highlight: true },
        { value: <X className="w-5 h-5 text-red-500" />, highlight: false },
        { value: <X className="w-5 h-5 text-red-500" />, highlight: false }
      ]
    },
    { 
      name: "Data-Driven Development Plans", 
      comparison: [
        { value: <Check className="w-5 h-5 text-green-500" />, highlight: true },
        { value: <X className="w-5 h-5 text-red-500" />, highlight: false },
        { value: <Check className="w-5 h-5 text-green-500" />, highlight: false }
      ]
    },
    { 
      name: "Predictive Accuracy", 
      comparison: [
        { value: "87%", highlight: true },
        { value: "62%", highlight: false },
        { value: "53%", highlight: false }
      ]
    }
  ];

  const roiStats = [
    { label: "Time Savings", value: "73%", description: "Less time spent in assessment process" },
    { label: "Hiring Accuracy", value: "41%", description: "Increase in successful hires" },
    { label: "Turnover Reduction", value: "36%", description: "Decrease in early-stage turnover" },
    { label: "ROI", value: "487%", description: "Average return on investment" }
  ];

  const caseStudies = [
    {
      company: "Global Tech Leader",
      image: "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=600",
      result: "Reduced hiring time by 58% while improving quality of hires by 32%"
    },
    {
      company: "Financial Services Firm",
      image: "https://images.pexels.com/photos/936137/pexels-photo-936137.jpeg?auto=compress&cs=tinysrgb&w=600",
      result: "40% improvement in team performance after implementing TraitTune assessments"
    },
    {
      company: "Healthcare Provider",
      image: "https://images.pexels.com/photos/3985163/pexels-photo-3985163.jpeg?auto=compress&cs=tinysrgb&w=600",
      result: "Decreased employee turnover by 45% in critical care roles"
    }
  ];

  return (
    <section className="section-padding bg-gray-50 dark:bg-gray-900">
      <div className="container px-4 sm:px-6 mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-300 mb-6">
            <Zap className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">Competitive Advantages</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-display font-bold mb-6 gradient-text">
            Why TraitTune Outperforms Others
          </h2>
          
          <p className="text-lg text-gray-600 dark:text-gray-300">
            See how our advanced assessment technology compares to traditional methods and basic assessments available in the market.
          </p>
        </div>
        
        {/* Comparison Table */}
        <div className="mb-20 overflow-x-auto">
          <div className="min-w-[768px]">
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="col-span-1"></div>
              {competitors.map((competitor, index) => (
                <div 
                  key={index} 
                  className={`col-span-1 text-center p-4 rounded-t-lg font-semibold text-lg
                    ${competitor.isPrimary 
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white' 
                      : 'bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                    }`}
                >
                  {competitor.name}
                </div>
              ))}
            </div>
            
            {features.map((feature, index) => (
              <div 
                key={index} 
                className={`grid grid-cols-4 gap-4 ${
                  index % 2 === 0 
                    ? 'bg-white dark:bg-gray-800' 
                    : 'bg-gray-50 dark:bg-gray-850'
                }`}
              >
                <div className="col-span-1 p-4 font-medium text-gray-800 dark:text-gray-200 flex items-center">
                  {feature.name}
                </div>
                {feature.comparison.map((comp, compIndex) => (
                  <div 
                    key={compIndex} 
                    className={`col-span-1 p-4 text-center flex items-center justify-center ${
                      comp.highlight 
                        ? 'text-blue-600 dark:text-blue-400 font-semibold' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {comp.value}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        
        {/* ROI Metrics */}
        <div className="mb-20">
          <h3 className="text-2xl font-display font-semibold mb-8 text-center gradient-text">
            Measurable ROI & Business Impact
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {roiStats.map((stat, index) => (
              <div key={index} className="glass-card p-6 text-center">
                <div className="text-3xl font-display font-bold gradient-text mb-2">{stat.value}</div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{stat.label}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{stat.description}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Case Studies */}
        <div>
          <h3 className="text-2xl font-display font-semibold mb-8 text-center gradient-text">
            Success Stories
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {caseStudies.map((caseStudy, index) => (
              <div key={index} className="glass-card overflow-hidden flex flex-col h-full">
                <div className="h-48 overflow-hidden">
                  <img 
                    src={caseStudy.image} 
                    alt={caseStudy.company} 
                    className="w-full h-full object-cover transform transition-transform duration-500 hover:scale-110"
                  />
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <h4 className="font-semibold text-lg mb-2">{caseStudy.company}</h4>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 flex-grow">{caseStudy.result}</p>
                  <a href="#case-studies" className="text-blue-600 dark:text-blue-400 font-medium inline-flex items-center">
                    Read case study
                    <ArrowRight className="ml-1 w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CompetitiveAdvantages;