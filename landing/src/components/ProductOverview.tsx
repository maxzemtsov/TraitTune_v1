import React from 'react';
import { Brain, BarChart3, Users, Zap, ArrowRight } from 'lucide-react';

const ProductOverview: React.FC = () => {
  return (
    <section id="features" className="section-padding bg-gray-50 dark:bg-gray-900">
      <div className="container px-4 sm:px-6 mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-display font-bold mb-6 gradient-text">
            Next-Generation Assessment Technology
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Our proprietary assessment platform combines advanced psychometrics, machine learning, and decades of research to provide unparalleled insights.
          </p>
        </div>

        {/* Process visualization */}
        <div className="relative mb-20">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
              {/* Process Step 1 */}
              <div className="glass-card p-6 relative z-10">
                <div className="w-12 h-12 mb-4 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Cognitive Assessment</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Our adaptive testing algorithm measures 26 cognitive abilities with precision and efficiency.
                </p>
              </div>

              {/* Process Step 2 */}
              <div className="glass-card p-6 relative z-10">
                <div className="w-12 h-12 mb-4 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Personality Mapping</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Identify key behavioral traits and work preferences using our scientifically validated framework.
                </p>
              </div>

              {/* Process Step 3 */}
              <div className="glass-card p-6 relative z-10">
                <div className="w-12 h-12 mb-4 rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Actionable Insights</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Receive detailed reports with specific recommendations tailored for different organizational roles.
                </p>
              </div>

              {/* Connecting line for desktop */}
              <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-teal-500 -z-0 transform -translate-y-1/2"></div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: <Zap className="w-6 h-6 text-white" />,
              title: "15-Minute Assessments",
              description: "Complete comprehensive assessments in just 15 minutes with our adaptive testing technology.",
              color: "from-blue-500 to-blue-600"
            },
            {
              icon: <BarChart3 className="w-6 h-6 text-white" />,
              title: "Detailed Analytics",
              description: "Get instant access to sophisticated analytics with interactive visualization tools.",
              color: "from-purple-500 to-purple-600"
            },
            {
              icon: <Users className="w-6 h-6 text-white" />,
              title: "Team Compatibility",
              description: "Identify optimal team compositions and potential areas of conflict or synergy.",
              color: "from-teal-500 to-teal-600"
            },
            {
              icon: <Brain className="w-6 h-6 text-white" />,
              title: "AI-Driven Insights",
              description: "Our AI models analyze patterns beyond human perception for deeper insights.",
              color: "from-indigo-500 to-indigo-600"
            },
            {
              icon: <Zap className="w-6 h-6 text-white" />,
              title: "Customizable Benchmarks",
              description: "Establish role-specific benchmarks based on top performers in your organization.",
              color: "from-pink-500 to-pink-600"
            },
            {
              icon: <BarChart3 className="w-6 h-6 text-white" />,
              title: "Development Tracking",
              description: "Monitor growth and development over time with longitudinal assessment data.",
              color: "from-amber-500 to-amber-600"
            }
          ].map((feature, index) => (
            <div key={index} className="glass-card p-6 hover:translate-y-[-4px] transition-transform duration-300">
              <div className={`w-12 h-12 mb-4 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Interactive Demo CTA */}
        <div className="mt-16 text-center">
          <a href="#interactive-demo" className="button-primary inline-flex items-center">
            <span>See Interactive Demo</span>
            <ArrowRight className="ml-2 w-5 h-5" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default ProductOverview;