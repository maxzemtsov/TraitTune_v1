import React from 'react';
import { Award, CheckCircle } from 'lucide-react';

const ScientificValidation: React.FC = () => {
  const experts = [
    {
      name: "Dr. Sarah Johnson, Ph.D.",
      role: "Professor of Organizational Psychology, Stanford University",
      image: "https://images.pexels.com/photos/5490276/pexels-photo-5490276.jpeg?auto=compress&cs=tinysrgb&w=600",
      quote: "TraitTune's assessment methodology demonstrates remarkable validity coefficients that exceed industry standards. Their innovative approach to measuring cognitive abilities is truly groundbreaking."
    },
    {
      name: "Dr. Michael Chen, Ph.D.",
      role: "Research Director, Institute for Psychometric Advancement",
      image: "https://images.pexels.com/photos/5792641/pexels-photo-5792641.jpeg?auto=compress&cs=tinysrgb&w=600",
      quote: "I've reviewed dozens of assessment platforms, and TraitTune stands out for its rigorous scientific approach. The test-retest reliability scores are exceptional, and the predictive validity is among the best I've seen."
    },
    {
      name: "Dr. Elena Rodriguez, Ph.D.",
      role: "Former Head of Assessment Science, Google",
      image: "https://images.pexels.com/photos/789822/pexels-photo-789822.jpeg?auto=compress&cs=tinysrgb&w=600",
      quote: "What impresses me most about TraitTune is their commitment to continuous research and validation. Their assessment framework is built on solid scientific principles while embracing cutting-edge advancements in psychometrics."
    },
    {
      name: "Dr. James Wilson, Ph.D.",
      role: "Author, 'The Science of Personnel Selection'",
      image: "https://images.pexels.com/photos/5393594/pexels-photo-5393594.jpeg?auto=compress&cs=tinysrgb&w=600",
      quote: "TraitTune has successfully bridged the gap between academic rigor and practical application. Their assessment platform provides a level of insight that was previously only available through much lengthier and costly assessment batteries."
    }
  ];

  const metrics = [
    { label: "Validity Coefficient", value: "0.82", description: "Exceeds industry standard of 0.6" },
    { label: "Test-Retest Reliability", value: "0.91", description: "Demonstrates exceptional consistency" },
    { label: "Predictive Accuracy", value: "87%", description: "For job performance outcomes" },
    { label: "Bias Reduction", value: "94%", description: "Lower adverse impact than traditional methods" }
  ];

  return (
    <section id="science" className="section-padding">
      <div className="container px-4 sm:px-6 mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-purple-50 dark:bg-purple-900/30 border border-purple-100 dark:border-purple-800 text-purple-600 dark:text-purple-300 mb-6">
            <Award className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">Scientifically Validated</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-display font-bold mb-6 gradient-text">
            Backed by Rigorous Science
          </h2>
          
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Our assessment methodology is grounded in decades of research and validated by leading experts in psychometrics, organizational psychology, and data science.
          </p>
        </div>
        
        {/* Expert Quotes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {experts.map((expert, index) => (
            <div key={index} className="glass-card p-6 flex flex-col h-full">
              <div className="mb-4 flex items-center">
                <div className="w-12 h-12 rounded-full overflow-hidden mr-4 border-2 border-purple-200 dark:border-purple-800">
                  <img 
                    src={expert.image} 
                    alt={expert.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">{expert.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{expert.role}</p>
                </div>
              </div>
              
              <blockquote className="text-gray-600 dark:text-gray-300 italic flex-grow">
                "{expert.quote}"
              </blockquote>
            </div>
          ))}
        </div>
        
        {/* Research Data and Metrics */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl p-1 mb-16">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-8">
            <h3 className="text-2xl font-display font-semibold mb-6 text-center gradient-text">
              Assessment Validity Metrics
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {metrics.map((metric, index) => (
                <div key={index} className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{metric.label}</p>
                  <div className="text-3xl font-display font-bold text-blue-600 dark:text-blue-400 mb-2">{metric.value}</div>
                  <p className="text-xs text-gray-500 dark:text-gray-500">{metric.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Methodology Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-12">
          <div>
            <h3 className="text-2xl font-display font-semibold mb-4 gradient-text">
              Our Scientific Methodology
            </h3>
            
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              TraitTune's assessment technology is built on multiple layers of scientific validation, combining classical psychometric principles with modern machine learning techniques.
            </p>
            
            <ul className="space-y-3">
              {[
                "Large-scale normative samples across industries and job functions",
                "Iterative validation studies with Fortune 500 companies",
                "Ongoing research partnerships with leading universities",
                "Regular peer-reviewed publications in scientific journals",
                "Continuous refinement based on performance outcome data"
              ].map((item, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="glass-card p-8 overflow-hidden relative">
            <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden mb-4">
              <img 
                src="https://images.pexels.com/photos/7176026/pexels-photo-7176026.jpeg?auto=compress&cs=tinysrgb&w=600" 
                alt="Research Methodology" 
                className="object-cover w-full h-full"
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Research Papers", value: "24+" },
                { label: "Data Points", value: "5M+" },
                { label: "Validation Studies", value: "100+" }
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-xl font-display font-bold text-blue-600 dark:text-blue-400">{stat.value}</div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Certifications */}
        <div className="flex flex-wrap justify-center items-center gap-8 opacity-80">
          {[
            { name: "ISO 27001", logo: "https://images.pexels.com/photos/5668859/pexels-photo-5668859.jpeg?auto=compress&cs=tinysrgb&w=600" },
            { name: "SIOP Compliant", logo: "https://images.pexels.com/photos/5668842/pexels-photo-5668842.jpeg?auto=compress&cs=tinysrgb&w=600" },
            { name: "EEOC Guidelines", logo: "https://images.pexels.com/photos/5863407/pexels-photo-5863407.jpeg?auto=compress&cs=tinysrgb&w=600" },
            { name: "APA Standards", logo: "https://images.pexels.com/photos/5967408/pexels-photo-5967408.jpeg?auto=compress&cs=tinysrgb&w=600" }
          ].map((cert, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center p-2 mb-2">
                <img src={cert.logo} alt={cert.name} className="max-w-full max-h-full" />
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">{cert.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ScientificValidation;