/* eslint-disable */
// @ts-nocheck
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation'; // For accessing URL query parameters

// Define a type for the results data structure for better type safety
interface Trait {
  id: string;
  name: string; // Assumed to be in the current language from API
  name_en?: string; // For mock data
  name_ru?: string; // For mock data
  score: number;
  segment: string; // Assumed to be in the current language from API
  segment_en?: string;
  segment_ru?: string;
  interpretation: string; // Assumed to be in the current language from API
  interpretation_en?: string;
  interpretation_ru?: string;
  potential: boolean;
  detailedInterpretation?: string; // Assumed to be in the current language from API
  detailedInterpretation_en?: string;
  detailedInterpretation_ru?: string;
}

interface ResultsData {
  userName: string; // Assumed to be in the current language from API (or not translated)
  assessmentDate: string; // Likely not translated, or backend handles format
  scoreBadgeAvatarUrl: string;
  scoreBadgeName: string; // Assumed to be in the current language from API
  scoreBadgeName_en?: string;
  scoreBadgeName_ru?: string;
  overallSummary: string; // Assumed to be in the current language from API
  overallSummary_en?: string;
  overallSummary_ru?: string;
  traits: Trait[];
  growthTips: string[]; // Assumed to be in the current language from API
  growthTips_en?: string[];
  growthTips_ru?: string[];
  lowConfidenceRetake: boolean;
}

// Mock data with bilingual fields for demonstration
const mockResultsData_en: Omit<ResultsData, 'traits' | 'growthTips'> & { traits: (Omit<Trait, 'name'|'segment'|'interpretation'|'detailedInterpretation'> & Partial<Pick<Trait, 'name_en' | 'name_ru' | 'segment_en' | 'segment_ru' | 'interpretation_en' | 'interpretation_ru' | 'detailedInterpretation_en' | 'detailedInterpretation_ru'>>)[], growthTips_en?: string[], growthTips_ru?: string[] } = {
  userName: "John Doe",
  assessmentDate: "May 10, 2025",
  scoreBadgeAvatarUrl: "/placeholder-avatar.png", 
  scoreBadgeName_en: "Visionary Innovator",
  scoreBadgeName_ru: "Провидец-Инноватор",
  overallSummary_en: "John, your results highlight your strong innovative spirit and your ability to approach challenges with a pragmatic mindset. You excel at finding creative solutions while staying grounded.",
  overallSummary_ru: "Джон, ваши результаты подчеркивают ваш сильный новаторский дух и вашу способность подходить к вызовам с прагматичным мышлением. Вы преуспеваете в поиске творческих решений, оставаясь при этом на земле.",
  traits: [
    { id: "1", name_en: "Expressive vs. Reserved", name_ru: "Экспрессивный против Сдержанного", score: 85, segment_en: "Highly Expressive", segment_ru: "Очень Экспрессивный", interpretation_en: "You readily express your thoughts and feelings, and you are outgoing.", interpretation_ru: "Вы легко выражаете свои мысли и чувства, и вы общительны.", potential: false, detailedInterpretation_en: "Being highly expressive means you are comfortable sharing your inner world with others. This can foster strong connections and clear communication. In team settings, your willingness to voice opinions can drive discussions forward. However, be mindful of situations requiring more reserved communication to ensure all voices are heard.", detailedInterpretation_ru: "Быть очень экспрессивным означает, что вам комфортно делиться своим внутренним миром с другими. Это может способствовать прочным связям и четкому общению. В командной работе ваша готовность высказывать мнения может продвигать обсуждения вперед. Однако помните о ситуациях, требующих более сдержанного общения, чтобы все голоса были услышаны." },
    { id: "2", name_en: "Cooperative vs. Independent", name_ru: "Кооперативный против Независимого", score: 60, segment_en: "Moderately Cooperative", segment_ru: "Умеренно Кооперативный", interpretation_en: "You value teamwork but can also work effectively alone.", interpretation_ru: "Вы цените командную работу, но также можете эффективно работать в одиночку.", potential: true, detailedInterpretation_en: "Your balance between cooperation and independence allows you to adapt to various work styles. You can contribute effectively to group projects while also taking initiative on solo tasks. To further explore this potential, identify situations where you can lead collaborative efforts or take full ownership of independent challenges.", detailedInterpretation_ru: "Ваш баланс между сотрудничеством и независимостью позволяет вам адаптироваться к различным стилям работы. Вы можете эффективно вносить вклад в групповые проекты, а также проявлять инициативу в сольных задачах. Чтобы дальше исследовать этот потенциал, определите ситуации, где вы можете возглавить совместные усилия или взять на себя полную ответственность за независимые вызовы." },
    { id: "15", name_en: "Optimistic vs. Realistic", name_ru: "Оптимистичный против Реалистичного", score: 78, segment_en: "Optimistic", segment_ru: "Оптимистичный", interpretation_en: "You maintain a hopeful outlook on challenges.", interpretation_ru: "Вы сохраняете оптимистичный взгляд на трудности.", potential: false, detailedInterpretation_en: "Your optimistic nature helps you stay motivated and inspire others. You tend to see the best in situations and people. While this is a great strength, ensure you also consider potential risks and downsides by seeking realistic perspectives when making important decisions.", detailedInterpretation_ru: "Ваша оптимистичная натура помогает вам оставаться мотивированным и вдохновлять других. Вы склонны видеть лучшее в ситуациях и людях. Хотя это большая сила, убедитесь, что вы также учитываете потенциальные риски и недостатки, обращаясь к реалистичным перспективам при принятии важных решений." },
  ],
  growthTips_en: [
    "Explore leadership opportunities to leverage your proactive and innovative nature.",
    "Consider projects that require both strategic thinking and attention to detail to balance your big-picture focus.",
    "Practice active listening to further enhance your empathetic abilities in team settings."
  ],
  growthTips_ru: [
    "Исследуйте возможности лидерства, чтобы использовать свою проактивную и инновационную натуру.",
    "Рассмотрите проекты, требующие как стратегического мышления, так и внимания к деталям, чтобы сбалансировать ваше видение общей картины.",
    "Практикуйте активное слушание для дальнейшего развития ваших эмпатических способностей в команде."
  ],
  lowConfidenceRetake: false,
};

// Function to get localized mock data based on current language
const getLocalizedMockData = (lang: 'en' | 'ru'): ResultsData => {
    return {
        userName: mockResultsData_en.userName, // Assuming userName is not translated or comes as is
        assessmentDate: mockResultsData_en.assessmentDate,
        scoreBadgeAvatarUrl: mockResultsData_en.scoreBadgeAvatarUrl,
        scoreBadgeName: lang === 'en' ? mockResultsData_en.scoreBadgeName_en! : mockResultsData_en.scoreBadgeName_ru!,
        overallSummary: lang === 'en' ? mockResultsData_en.overallSummary_en! : mockResultsData_en.overallSummary_ru!,
        traits: mockResultsData_en.traits.map(trait => ({
            ...trait,
            name: lang === 'en' ? trait.name_en! : trait.name_ru!,
            segment: lang === 'en' ? trait.segment_en! : trait.segment_ru!,
            interpretation: lang === 'en' ? trait.interpretation_en! : trait.interpretation_ru!,
            detailedInterpretation: lang === 'en' ? trait.detailedInterpretation_en : trait.detailedInterpretation_ru,
        })),
        growthTips: lang === 'en' ? mockResultsData_en.growthTips_en! : mockResultsData_en.growthTips_ru!,
        lowConfidenceRetake: mockResultsData_en.lowConfidenceRetake,
    };
};

const ResultsPage = () => {
  const [resultsData, setResultsData] = useState<ResultsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'ru'>('en');
  const [expandedTraitId, setExpandedTraitId] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const sessionIdFromUrl = searchParams.get('sessionId');

  const fetchResults = useCallback(async (sessionId: string | null) => {
    if (!sessionId) {
      setError(currentLanguage === 'en' ? 'Session ID is missing from the URL. Please check the link and try again.' : 'Идентификатор сессии отсутствует в URL. Пожалуйста, проверьте ссылку и попробуйте снова.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Actual API endpoint from TraitTune backend
      // The API should ideally return data in the requested language or provide bilingual data.
      // For now, we assume the API might take a lang parameter or use user's profile language.
      // const response = await fetch(`/api/v1/report/user/${sessionId}?lang=${currentLanguage}`); 
      const response = await fetch(`/api/v1/report/user/${sessionId}`); 
      if (!response.ok) {
        let errorText = `Failed to fetch results (status: ${response.status}).`;
        try {
            const errorData = await response.json();
            errorText = errorData.message || errorData.error || errorText;
        } catch (jsonError) { /* Ignore */ }
        throw new Error(currentLanguage === 'en' ? `${errorText} Please try again later or contact support if the issue persists.` : `Не удалось загрузить результаты (статус: ${response.status}). ${errorText} Пожалуйста, попробуйте позже или свяжитесь со службой поддержки, если проблема не исчезнет.`);
      }
      const data: ResultsData = await response.json();
      // If API returns bilingual data, you'd process it here based on currentLanguage.
      // For now, assuming API returns data in one language or frontend has to manage all strings (which is not the case here without i18n lib).
      setResultsData(data);
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError(currentLanguage === 'en' ? 'An unexpected error occurred while fetching your results. Please try again later or contact support.' : 'Произошла непредвиденная ошибка при загрузке ваших результатов. Пожалуйста, попробуйте позже или свяжитесь со службой поддержки.');
      }
      // Fallback to mock data for development if API fails and no session ID (for easier UI dev)
      // console.warn("API fetch error, using mock data for development.");
      // setResultsData(getLocalizedMockData(currentLanguage)); 
    } finally {
      setLoading(false);
    }
  }, [currentLanguage]);

  useEffect(() => {
    if (sessionIdFromUrl) {
      fetchResults(sessionIdFromUrl);
    } else {
      // Using mock data if no session ID for development purposes
      console.warn("Session ID missing, using mock data for development.");
      setResultsData(getLocalizedMockData(currentLanguage));
      setLoading(false);
      // setError(currentLanguage === 'en' ? 'Session ID is missing from the URL. Cannot fetch results. Please check the link you used.' : 'Идентификатор сессии отсутствует в URL. Невозможно загрузить результаты. Пожалуйста, проверьте используемую ссылку.');
      // setLoading(false);
    }
  }, [sessionIdFromUrl, fetchResults, currentLanguage]);
  
  // Effect to update mock data when language changes, if mock data is currently in use
  useEffect(() => {
    if (!sessionIdFromUrl) { // Only if we are using mock data
        setResultsData(getLocalizedMockData(currentLanguage));
    }
    // If using real data, the API would ideally handle language or we'd re-fetch with lang param.
    // Or, if API provides bilingual data, we'd re-process it here.
  }, [currentLanguage, sessionIdFromUrl]);


  const handleRetry = () => {
    if (sessionIdFromUrl) {
      fetchResults(sessionIdFromUrl);
    }
  };
  
  const toggleLanguage = () => {
    setCurrentLanguage(prevLang => prevLang === 'en' ? 'ru' : 'en');
    // TODO: If using an i18n library (e.g., next-intl), call its changeLanguage method here.
    // This would typically involve updating a global context or re-fetching/re-rendering with new language strings.
    // For now, local state change triggers re-renders which pick up new conditional text.
  };

  const handleLearnMore = (traitId: string) => {
    setExpandedTraitId(prevId => prevId === traitId ? null : traitId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0B0022] to-[#121639] text-white p-4 md:p-8 font-inter flex flex-col items-center justify-center">
        <div className="w-full max-w-md mb-4">
          <div className="loading-gradient-bar">
            <div className="loading-gradient-bar-inner"></div>
          </div>
        </div>
        <p className="text-xl font-gilroy">{currentLanguage === 'en' ? 'Loading Your Insights...' : 'Загружаем ваши результаты...'}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0B0022] to-[#121639] text-white p-4 md:p-8 font-inter flex flex-col items-center justify-center text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-2xl font-gilroy text-red-400 mb-3">{currentLanguage === 'en' ? 'Oops! Something Went Wrong' : 'Ой! Что-то пошло не так'}</p>
        <p className="text-red-300 mb-6 max-w-md px-2">{error}</p>
        <button 
          onClick={handleRetry}
          className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#4361EE] to-[#3A0CA3] text-white font-semibold hover:opacity-90 transition-opacity">
          {currentLanguage === 'en' ? 'Try Again' : 'Попробовать снова'}
        </button>
      </div>
    );
  }
  
  const dataToDisplay = resultsData; 

  if (!dataToDisplay) { 
     return (
      <div className="min-h-screen bg-gradient-to-br from-[#0B0022] to-[#121639] text-white p-4 md:p-8 font-inter flex flex-col items-center justify-center text-center">
        <p className="text-xl font-gilroy">{currentLanguage === 'en' ? 'No results data available.' : 'Нет данных о результатах.'}</p>
        <p className="text-slate-400 text-sm mt-2">{currentLanguage === 'en' ? 'Please ensure you have completed an assessment or check the session ID.' : 'Пожалуйста, убедитесь, что вы завершили оценку, или проверьте идентификатор сессии.'}</p>
      </div>
    );
  }

  // Texts for footer links
  const footerLinks = {
    en: {
      privacy: "Privacy Policy",
      terms: "Terms of Service",
      contact: "Contact Us",
    },
    ru: {
      privacy: "Политика конфиденциальности",
      terms: "Условия использования",
      contact: "Связаться с нами",
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0022] to-[#121639] text-white p-4 md:p-8 font-inter">
      <header className="flex justify-between items-center mb-8 md:mb-12">
        <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#4361EE] to-[#3A0CA3] font-gilroy">
          {currentLanguage === 'en' ? `${dataToDisplay.userName}'s TraitTune Insights` : `Результаты TraitTune для ${dataToDisplay.userName}`}
        </h1>
        {/* Language Toggle Slider */}
        <button 
          onClick={toggleLanguage}
          className="relative w-20 h-10 flex items-center bg-slate-700 rounded-full p-1 cursor-pointer transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#4CC9F0]"
          aria-label={currentLanguage === 'en' ? "Switch to Russian" : "Переключиться на английский"}
        >
          <div className={`absolute text-xs font-medium ${currentLanguage === 'en' ? 'text-[#4CC9F0]' : 'text-slate-400'} left-3 transition-opacity duration-300`}>EN</div>
          <div className={`absolute text-xs font-medium ${currentLanguage === 'ru' ? 'text-[#4CC9F0]' : 'text-slate-400'} right-3 transition-opacity duration-300`}>RU</div>
          <div 
            className={`absolute bg-white w-8 h-8 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${currentLanguage === 'en' ? 'translate-x-0' : 'translate-x-10'}`}
          ></div>
        </button>
      </header>

      <main className="space-y-8 md:space-y-12">
        <section className="glass-card-2 p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 md:gap-8">
          <div className="w-32 h-32 md:w-48 md:h-48 bg-gradient-to-br from-[#7209B7] to-[#560BAD] rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
            <img src={dataToDisplay.scoreBadgeAvatarUrl || '/placeholder-avatar.png'} alt={dataToDisplay.scoreBadgeName} className="w-28 h-28 md:w-40 md:h-40 rounded-full object-cover" />
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-gilroy font-semibold mb-2 text-[#4CC9F0]">{dataToDisplay.scoreBadgeName}</h2>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">{dataToDisplay.overallSummary}</p>
            <p className="text-xs text-slate-400 mt-2">
              {currentLanguage === 'en' ? 'Assessment Date:' : 'Дата оценки:'} {dataToDisplay.assessmentDate}
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl md:text-3xl font-gilroy font-semibold mb-6 text-center md:text-left">
            {currentLanguage === 'en' ? 'Detailed Trait Breakdown' : 'Подробный анализ черт'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dataToDisplay.traits.map((trait) => (
              <div key={trait.id} className="glass-card-2 p-5 md:p-6 hover:shadow-xl transition-shadow duration-300 flex flex-col">
                <h3 className="text-lg font-gilroy font-semibold text-[#4CC9F0] mb-2">{trait.name}</h3>
                <div className="w-full bg-slate-700/50 rounded-full h-2.5 mb-1">
                  <div 
                    className="bg-gradient-to-r from-[#4CC9F0] to-[#7209B7] h-2.5 rounded-full"
                    style={{ width: `${trait.score}%` }}
                  ></div>
                </div>
                <p className="text-xs text-slate-400 mb-2 text-right">{trait.score}/100 - {trait.segment}</p>
                <p className="text-sm text-slate-300 leading-relaxed mb-3 flex-grow">{trait.interpretation}</p>
                {trait.potential && (
                  <span className="inline-block bg-[#4CC9F0]/20 text-[#4CC9F0] text-xs font-medium px-2.5 py-0.5 rounded-full self-start mb-3">
                    {currentLanguage === 'en' ? 'Explore Your Potential!' : 'Раскройте свой потенциал!'}
                  </span>
                )}
                <button 
                  onClick={() => handleLearnMore(trait.id)}
                  className="mt-auto self-start px-3 py-1.5 rounded-md bg-white/10 backdrop-blur-md border border-white/20 text-xs text-slate-200 hover:bg-white/20 transition-colors">
                  {currentLanguage === 'en' ? 'Learn More' : 'Узнать больше'}
                </button>
                {expandedTraitId === trait.id && trait.detailedInterpretation && (
                  <div className="mt-3 p-3 bg-slate-700/30 rounded-lg text-xs text-slate-300">
                    <p>{trait.detailedInterpretation}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="glass-card-2 p-6 md:p-8">
          <h2 className="text-2xl md:text-3xl font-gilroy font-semibold mb-4 text-[#4CC9F0]">
            {currentLanguage === 'en' ? 'Growth & Exploration' : 'Развитие и исследование'}
          </h2>
          <ul className="list-disc list-inside space-y-2 text-slate-300 mb-6">
            {dataToDisplay.growthTips.map((tip, index) => (
              <li key={index}>{tip}</li>
            ))}
          </ul>
          {dataToDisplay.lowConfidenceRetake && (
            <p className="text-amber-400 bg-amber-400/10 p-3 rounded-lg mb-6 text-sm">
              {currentLanguage === 'en' ? 
                "Some of your traits are still unfolding! For a clearer picture, you can retake the assessment for these areas now or return in a week."
                : "Некоторые из ваших черт еще раскрываются! Для более ясной картины вы можете пройти оценку по этим областям сейчас или вернуться через неделю."}
            </p>
          )}
          <button className="w-full md:w-auto px-6 py-3 rounded-lg bg-gradient-to-r from-[#4361EE] to-[#3A0CA3] text-white font-semibold hover:opacity-90 transition-opacity">
            {currentLanguage === 'en' ? 'Share Your Snapshot' : 'Поделиться своим профилем'}
          </button>
        </section>
      </main>

      <footer className="text-center text-slate-400 text-sm mt-12 md:mt-16 pt-8 border-t border-white/10">
        <p>&copy; {new Date().getFullYear()} TraitTune. {currentLanguage === 'en' ? 'All rights reserved.' : 'Все права защищены.'}</p>
        <nav className="mt-2 space-x-4">
          <a href="#" className="hover:text-[#4CC9F0] transition-colors">{footerLinks[currentLanguage].privacy}</a>
          <a href="#" className="hover:text-[#4CC9F0] transition-colors">{footerLinks[currentLanguage].terms}</a>
          <a href="#" className="hover:text-[#4CC9F0] transition-colors">{footerLinks[currentLanguage].contact}</a>
        </nav>
        <button className="mt-4 px-4 py-2 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-xs hover:bg-white/20 transition-colors">
            {currentLanguage === 'en' ? 'Download Report (PDF)' : 'Скачать отчет (PDF)'}
        </button>
      </footer>
    </div>
  );
};

export default ResultsPage;

