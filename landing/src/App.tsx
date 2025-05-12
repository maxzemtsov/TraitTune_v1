import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Menu, X, Brain } from 'lucide-react';
import HeroSection from './components/HeroSection';
import ProductOverview from './components/ProductOverview';
import ScientificValidation from './components/ScientificValidation';
import CompetitiveAdvantages from './components/CompetitiveAdvantages';
import UseCases from './components/UseCases';
import SocialProof from './components/SocialProof';
import PricingSection from './components/PricingSection';
import CtaSection from './components/CtaSection';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import B2CPage from './pages/B2CPage';
import B2BPage from './pages/B2BPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-gray-900 dark:to-indigo-950">
        <Navbar />
        <Routes>
          <Route path="/" element={
            <main>
              <HeroSection />
              <ProductOverview />
              <ScientificValidation />
              <CompetitiveAdvantages />
              <UseCases />
              <SocialProof />
              <PricingSection />
              <CtaSection />
            </main>
          } />
          <Route path="/b2c" element={<B2CPage />} />
          <Route path="/b2b" element={<B2BPage />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;