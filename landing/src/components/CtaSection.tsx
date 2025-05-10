import React, { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';

const CtaSection: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    message: '',
    demoType: 'personal'
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <section id="demo" className="section-padding bg-gradient-to-br from-blue-600 to-indigo-900 text-white">
      <div className="container px-4 sm:px-6 mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div>
            <h2 className="text-3xl sm:text-4xl font-display font-bold mb-6">
              Ready to Transform Your Talent Strategy?
            </h2>
            
            <p className="text-xl text-blue-100 mb-8">
              Schedule a personalized demo to see how TraitTune can help your organization make better people decisions.
            </p>
            
            <div className="space-y-4 mb-8">
              {[
                "See the assessment platform in action with a live demo",
                "Learn how TraitTune can be tailored to your specific needs",
                "Get your questions answered by our assessment experts",
                "Discuss implementation options and timeline"
              ].map((benefit, index) => (
                <div key={index} className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-blue-400/30 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-blue-50">{benefit}</span>
                </div>
              ))}
            </div>
            
            <div className="glass-card bg-white/10 backdrop-blur-lg p-6 rounded-xl border border-white/20">
              <div className="flex items-start mb-6">
                <img
                  src="https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=600"
                  alt="Customer Success Manager"
                  className="w-16 h-16 rounded-full object-cover mr-4 border-2 border-white/30"
                />
                <div>
                  <div className="font-semibold text-white">Rachel Chen</div>
                  <div className="text-blue-200 text-sm">Customer Success Manager</div>
                  <p className="mt-2 text-blue-100 italic">
                    "I'm excited to show you how TraitTune can transform your talent processes. Our team is ready to help you implement the right solution for your organization."
                  </p>
                </div>
              </div>
              
              <a 
                href="tel:+1-800-123-4567" 
                className="flex items-center text-white"
              >
                <span className="text-blue-200 mr-2">Prefer to talk now?</span>
                <span className="font-semibold">Call (800) 123-4567</span>
              </a>
            </div>
          </div>
          
          {/* Right Content - Form */}
          <div className="glass-card bg-white/10 backdrop-blur-lg p-8 rounded-xl border border-white/20">
            <h3 className="text-2xl font-display font-semibold mb-6">Schedule Your Free Demo</h3>
            
            <form className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-blue-100 mb-2" htmlFor="name">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-white/10 border border-blue-300/30 rounded-lg px-4 py-3 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Your name"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-blue-100 mb-2" htmlFor="email">
                    Work Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-white/10 border border-blue-300/30 rounded-lg px-4 py-3 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="you@company.com"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-blue-100 mb-2" htmlFor="company">
                    Company Name
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full bg-white/10 border border-blue-300/30 rounded-lg px-4 py-3 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Your company"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-blue-100 mb-2" htmlFor="phone">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-white/10 border border-blue-300/30 rounded-lg px-4 py-3 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="(123) 456-7890"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-blue-100 mb-2" htmlFor="message">
                  What are your main talent challenges?
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  className="w-full bg-white/10 border border-blue-300/30 rounded-lg px-4 py-3 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                  placeholder="Tell us a bit about your needs..."
                ></textarea>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-blue-100 mb-2" htmlFor="demoType">
                  Demo Preference
                </label>
                <select
                  id="demoType"
                  name="demoType"
                  value={formData.demoType}
                  onChange={handleChange}
                  className="w-full bg-white/10 border border-blue-300/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-400 appearance-none"
                >
                  <option value="personal" className="bg-indigo-900">Personal Demo (30 min)</option>
                  <option value="team" className="bg-indigo-900">Team Demo (45 min)</option>
                  <option value="recorded" className="bg-indigo-900">Recorded Demo + Q&A</option>
                </select>
              </div>
              
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="consent"
                  className="mt-1 mr-2"
                  required
                />
                <label htmlFor="consent" className="text-sm text-blue-100">
                  I agree to receive communications from TraitTune. I understand that I can unsubscribe at any time. View our <a href="#privacy" className="underline">Privacy Policy</a>.
                </label>
              </div>
              
              <button 
                type="submit"
                className="w-full bg-white text-indigo-800 font-medium py-3 px-6 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center"
              >
                <span>Schedule My Demo</span>
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>
              
              <p className="text-center text-sm text-blue-200">
                We typically respond within 24 hours during business days.
              </p>
            </form>
          </div>
        </div>
        
        {/* Free Trial CTA */}
        <div className="mt-20 text-center">
          <h3 className="text-2xl font-display font-semibold mb-4">Not ready for a demo yet?</h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Try our free assessment to experience the platform firsthand. No commitment required.
          </p>
          <a 
            href="#try-free" 
            className="inline-flex items-center px-6 py-3 rounded-lg bg-white/20 hover:bg-white/30 text-white font-medium transition-colors border border-white/40"
          >
            <span>Try Free Assessment</span>
            <ArrowRight className="ml-2 w-5 h-5" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default CtaSection;