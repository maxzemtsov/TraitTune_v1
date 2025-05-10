import React, { useState } from 'react';
import { Check, X, Info, HelpCircle } from 'lucide-react';

const PricingSection: React.FC = () => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('annual');
  
  const pricingPlans = [
    {
      name: "Starter",
      description: "Perfect for small teams and startups",
      monthlyPrice: 499,
      annualPrice: 399,
      features: [
        { title: "Up to 50 assessments per month", included: true },
        { title: "Core cognitive assessments", included: true },
        { title: "Basic personality profiles", included: true },
        { title: "Standard reports", included: true },
        { title: "Email support", included: true },
        { title: "Team compatibility analysis", included: false },
        { title: "Custom benchmarks", included: false },
        { title: "API access", included: false },
        { title: "Dedicated account manager", included: false },
      ]
    },
    {
      name: "Professional",
      description: "Ideal for growing organizations",
      monthlyPrice: 999,
      annualPrice: 799,
      popular: true,
      features: [
        { title: "Up to 200 assessments per month", included: true },
        { title: "All cognitive assessments", included: true },
        { title: "Advanced personality profiles", included: true },
        { title: "Enhanced reports with insights", included: true },
        { title: "Priority support", included: true },
        { title: "Team compatibility analysis", included: true },
        { title: "Custom benchmarks", included: true },
        { title: "API access", included: false },
        { title: "Dedicated account manager", included: false },
      ]
    },
    {
      name: "Enterprise",
      description: "For large organizations with advanced needs",
      customPricing: true,
      features: [
        { title: "Unlimited assessments", included: true },
        { title: "All assessment types", included: true },
        { title: "Comprehensive personality profiles", included: true },
        { title: "Custom reports and dashboards", included: true },
        { title: "24/7 premium support", included: true },
        { title: "Advanced team analytics", included: true },
        { title: "Custom benchmarks & role profiles", included: true },
        { title: "Full API access & integrations", included: true },
        { title: "Dedicated account manager", included: true },
      ]
    }
  ];
  
  const featureDescriptions = {
    "Core cognitive assessments": "Basic set of cognitive ability assessments covering verbal, numerical, and logical reasoning.",
    "All cognitive assessments": "Comprehensive set of 26 cognitive ability assessments across multiple domains.",
    "Basic personality profiles": "Essential personality traits assessment with standard reports.",
    "Advanced personality profiles": "Detailed personality assessment with work style preferences and team fit analysis.",
    "Team compatibility analysis": "Insights into team dynamics and potential areas of conflict or synergy.",
    "Custom benchmarks": "Create role-specific benchmarks based on top performers in your organization.",
    "API access": "Integrate assessment data with your existing HR systems and tools.",
    "Dedicated account manager": "Personal support from an assessment expert to maximize value.",
  };

  return (
    <section id="pricing" className="section-padding bg-gray-50 dark:bg-gray-900">
      <div className="container px-4 sm:px-6 mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-display font-bold mb-6 gradient-text">
            Simple, Transparent Pricing
          </h2>
          
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Choose the plan that fits your organization's needs with no hidden fees or long-term commitments.
          </p>
          
          {/* Billing Period Toggle */}
          <div className="inline-flex items-center bg-gray-100 dark:bg-gray-800 p-1 rounded-lg mb-2">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                billingPeriod === 'monthly'
                  ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('annual')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                billingPeriod === 'annual'
                  ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Annual <span className="text-green-500 dark:text-green-400 text-xs font-bold">Save 20%</span>
            </button>
          </div>
          
          <p className="text-sm text-gray-500 dark:text-gray-400">
            All plans include a 14-day free trial. No credit card required.
          </p>
        </div>
        
        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {pricingPlans.map((plan, index) => (
            <div 
              key={index} 
              className={`glass-card p-6 sm:p-8 flex flex-col h-full relative ${
                plan.popular ? 'md:scale-110 md:z-10 shadow-xl' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </div>
              )}
              
              <div className="mb-6">
                <h3 className="text-xl font-display font-bold mb-2">{plan.name}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{plan.description}</p>
                
                {plan.customPricing ? (
                  <div className="text-2xl font-display font-bold">Custom Pricing</div>
                ) : (
                  <div>
                    <div className="flex items-baseline">
                      <span className="text-3xl font-display font-bold gradient-text">
                        ${billingPeriod === 'monthly' ? plan.monthlyPrice : plan.annualPrice}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400 ml-1">/month</span>
                    </div>
                    {billingPeriod === 'annual' && (
                      <div className="text-sm text-green-600 dark:text-green-400 mt-1">
                        Billed annually (${plan.annualPrice * 12}/year)
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="space-y-4 mb-8 flex-grow">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-start">
                    {feature.included ? (
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    ) : (
                      <X className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className={`${feature.included ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500 dark:text-gray-500'} flex items-center`}>
                        {feature.title}
                        {featureDescriptions[feature.title as keyof typeof featureDescriptions] && (
                          <div className="group relative ml-1">
                            <HelpCircle className="w-4 h-4 text-gray-400" />
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg text-sm text-left text-gray-700 dark:text-gray-300 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                              {featureDescriptions[feature.title as keyof typeof featureDescriptions]}
                              <div className="absolute w-2 h-2 bg-white dark:bg-gray-800 transform rotate-45 left-1/2 -ml-1 -bottom-1"></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div>
                {plan.customPricing ? (
                  <a 
                    href="#contact" 
                    className="w-full block text-center py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium hover:from-blue-700 hover:to-indigo-800 transition-all shadow-lg shadow-blue-500/20"
                  >
                    Contact Sales
                  </a>
                ) : (
                  <a 
                    href="#signup" 
                    className={`w-full block text-center py-3 rounded-lg font-medium transition-all ${
                      plan.popular
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:from-blue-700 hover:to-indigo-800 shadow-lg shadow-blue-500/20'
                        : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    Start Free Trial
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* Volume Discounts */}
        <div className="glass-card p-8 mb-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-display font-semibold mb-4">Volume Discounts</h3>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              For organizations with larger assessment needs, we offer volume-based discounts on our Professional plan.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { assessments: "250-500", discount: "10%" },
              { assessments: "501-1,000", discount: "15%" },
              { assessments: "1,000+", discount: "20%+" }
            ].map((tier, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center border border-gray-100 dark:border-gray-700">
                <div className="text-lg font-medium mb-2">{tier.assessments} assessments</div>
                <div className="text-2xl font-display font-bold text-green-600 dark:text-green-400 mb-2">{tier.discount}</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">discount on Professional plan</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* FAQ */}
        <div className="max-w-3xl mx-auto">
          <h3 className="text-2xl font-display font-semibold mb-8 text-center">Frequently Asked Questions</h3>
          
          <div className="space-y-6">
            {[
              {
                question: "How long does the free trial last?",
                answer: "Our free trial provides full access to all features of your selected plan for 14 days, with no credit card required. You can cancel at any time during the trial period."
              },
              {
                question: "Can I change plans later?",
                answer: "Yes, you can upgrade or downgrade your plan at any time. If you upgrade, the new features will be immediately available. If you downgrade, changes will take effect at the start of your next billing cycle."
              },
              {
                question: "What happens if I use all my assessments?",
                answer: "If you reach your monthly assessment limit, you can purchase additional assessments at a pro-rated price or upgrade to a higher plan. Unused assessments do not roll over to the next month."
              },
              {
                question: "Do you offer custom enterprise solutions?",
                answer: "Yes, our Enterprise plan can be fully customized to meet your organization's specific needs. This includes custom assessment types, integration with your existing HR systems, and dedicated support."
              },
              {
                question: "Is there a setup fee?",
                answer: "No, there are no setup fees for any of our plans. Your subscription covers all costs associated with using the TraitTune platform."
              }
            ].map((faq, index) => (
              <div key={index} className="glass-card p-6">
                <h4 className="text-lg font-semibold mb-2">{faq.question}</h4>
                <p className="text-gray-600 dark:text-gray-300">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;