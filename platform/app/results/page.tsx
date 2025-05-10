/* eslint-disable */
// @ts-nocheck
// prettier-ignore
/* eslint-disable */
// @ts-nocheck
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation'; // For accessing URL query parameters
import TraitRadarChart from '../components/TraitRadarChart'; // Import the new chart component

// Define a type for the results data structure for better type safety
interface Trait {
  id: string;
  name: string; 
  name_en?: string; 
  name_ru?: string; 
  score: number;
  segment: string; 
  segment_en?: string;
  segment_ru?: string;
  interpretation: string; 
  interpretation_en?: string;
  interpretation_ru?: string;
  potential: boolean;
  detailedInterpretation?: string; 
  detailedInterpretation_en?: string;
  detailedInterpretation_ru?: string;
}

interface ResultsData {
  userName: string; 
  assessmentDate: string; 
  scoreBadgeAvatarUrl: string;
  scoreBadgeName: string; 
  scoreBadgeName_en?: string;
  scoreBadgeName_ru?: string;
  overallSummary: string; 
  overallSummary_en?: string;
  overallSummary_ru?: string;
  traits: Trait[];
  growthTips: string[]; 
  growthTips_en?: string[];
  growthTips_ru?: string[];
  lowConfidenceRetake: boolean;
}


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
    { id: "3", name_en: "Detail-Oriented vs. Big Picture", name_ru: "Ориентированный на детали против Общей картины", score: 70, segment_en: "Balanced", segment_ru: "Сбалансированный", interpretation_en: "You can focus on details while keeping the overall goal in mind.", interpretation_ru: "Вы можете сосредоточиться на деталях, не упуская из виду общую цель.", potential: false },
    { id: "4", name_en: "Cautious vs. Risk-Taker", name_ru: "Осторожный против Рискованного", score: 45, segment_en: "Moderately Cautious", segment_ru: "Умеренно Осторожный", interpretation_en: "You prefer to assess risks before acting.", interpretation_ru: "Вы предпочитаете оценивать риски перед действием.", potential: false },
    { id: "5", name_en: "Structured vs. Flexible", name_ru: "Структурированный против Гибкого", score: 55, segment_en: "Adaptable", segment_ru: "Адаптивный", interpretation_en: "You can adapt to changing plans.", interpretation_ru: "Вы можете адаптироваться к меняющимся планам.", potential: true },
    { id: "6", name_en: "Introverted vs. Extraverted", name_ru: "Интроверт против Экстраверта", score: 65, segment_en: "Ambivert", segment_ru: "Амбиверт", interpretation_en: "You enjoy both social interaction and solitude.", interpretation_ru: "Вам нравится как социальное взаимодействие, так и уединение.", potential: false },
    { id: "7", name_en: "Analytical vs. Intuitive", name_ru: "Аналитический против Интуитивного", score: 75, segment_en: "Analytical", segment_ru: "Аналитический", interpretation_en: "You rely on logic and data for decisions.", interpretation_ru: "Вы полагаетесь на логику и данные при принятии решений.", potential: false },
    { id: "8", name_en: "Patient vs. Impatient", name_ru: "Терпеливый против Нетерпеливого", score: 80, segment_en: "Patient", segment_ru: "Терпеливый", interpretation_en: "You remain calm in frustrating situations.", interpretation_ru: "Вы сохраняете спокойствие в неприятных ситуациях.", potential: false },
    { id: "9", name_en: "Assertive vs. Passive", name_ru: "Напористый против Пассивного", score: 72, segment_en: "Assertive", segment_ru: "Напористый", interpretation_en: "You confidently express your needs and opinions.", interpretation_ru: "Вы уверенно выражаете свои потребности и мнения.", potential: false },
    { id: "10", name_en: "Proactive vs. Reactive", name_ru: "Проактивный против Реактивного", score: 88, segment_en: "Highly Proactive", segment_ru: "Очень Проактивный", interpretation_en: "You take initiative and anticipate future needs.", interpretation_ru: "Вы проявляете инициативу и предвидите будущие потребности.", potential: false },
    { id: "11", name_en: "Resilient vs. Sensitive", name_ru: "Устойчивый против Чувствительного", score: 78, segment_en: "Resilient", segment_ru: "Устойчивый", interpretation_en: "You bounce back quickly from setbacks.", interpretation_ru: "Вы быстро восстанавливаетесь после неудач.", potential: false },
    { id: "12", name_en: "Empathetic vs. Detached", name_ru: "Эмпатичный против Отстраненного", score: 90, segment_en: "Highly Empathetic", segment_ru: "Очень Эмпатичный", interpretation_en: "You easily understand and share the feelings of others.", interpretation_ru: "Вы легко понимаете и разделяете чувства других.", potential: false },
    { id: "13", name_en: "Traditional vs. Innovative", name_ru: "Традиционный против Инновационного", score: 82, segment_en: "Innovative", segment_ru: "Инновационный", interpretation_en: "You enjoy exploring new ideas and methods.", interpretation_ru: "Вам нравится исследовать новые идеи и методы.", potential: false },
    { id: "14", name_en: "Focused vs. Multi-tasker", name_ru: "Сосредоточенный против Многозадачного", score: 68, segment_en: "Good at Multi-tasking", segment_ru: "Хорошо справляется с многозадачностью", interpretation_en: "You can juggle multiple tasks effectively.", interpretation_ru: "Вы можете эффективно совмещать несколько задач.", potential: false },
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


const getLocalizedMockData = (lang: 'en' | 'ru'): ResultsData => {
    return {
        userName: mockResultsData_en.userName, 
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
  const [showShareFeedback, setShowShareFeedback] = useState(false);

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
      setResultsData(data);
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError(currentLanguage === 'en' ? 'An unexpected error occurred while fetching your results. Please try again later or contact support.' : 'Произошла непредвиденная ошибка при загрузке ваших результатов. Пожалуйста, попробуйте позже или свяжитесь со службой поддержки.');
      }
    } finally {
      setLoading(false);
    }
  }, [currentLanguage]);

  useEffect(() => {
    if (sessionIdFromUrl) {
      fetchResults(sessionIdFromUrl);
    } else {
      console.warn("Session ID missing, using mock data for development.");
      setResultsData(getLocalizedMockData(currentLanguage));
      setLoading(false);
    }
  }, [sessionIdFromUrl, fetchResults, currentLanguage]);
  
  useEffect(() => {
    if (!sessionIdFromUrl) { 
        setResultsData(getLocalizedMockData(currentLanguage));
    }
  }, [currentLanguage, sessionIdFromUrl]);


  const handleRetry = () => {
    if (sessionIdFromUrl) {
      fetchResults(sessionIdFromUrl);
    }
  };
  
  const toggleLanguage = () => {
    setCurrentLanguage(prevLang => prevLang === 'en' ? 'ru' : 'en');
  };

  const handleLearnMore = (traitId: string) => {
    setExpandedTraitId(prevId => prevId === traitId ? null : traitId);
  };

  const handleShareSnapshot = () => {
    const snapshotUrl = `${window.location.origin}/results/snapshot/${sessionIdFromUrl || 'mock_session'}`;
    navigator.clipboard.writeText(snapshotUrl).then(() => {
        setShowShareFeedback(true);
        setTimeout(() => setShowShareFeedback(false), 3000); 
    }).catch(err => {
        console.error('Failed to copy snapshot link: ', err);
        alert(currentLanguage === 'en' ? 'Failed to copy link. Please try again.' : 'Не удалось скопировать ссылку. Пожалуйста, попробуйте еще раз.');
    });
  };

  const handleDownloadPdf = () => {
    alert(currentLanguage === 'en' ? 'PDF download functionality is not yet implemented.' : 'Функционал загрузки PDF еще не реализован.');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0B0022] to-[#121639] text-white p-4 sm:p-6 md:p-8 font-inter flex flex-col items-center justify-center" role="status" aria-live="polite">
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
      <div className="min-h-screen bg-gradient-to-br from-[#0B0022] to-[#121639] text-white p-4 sm:p-6 md:p-8 font-inter flex flex-col items-center justify-center text-center" role="alert">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-2xl font-gilroy text-red-400 mb-3" id="error-message-title">{currentLanguage === 'en' ? 'Oops! Something Went Wrong' : 'Ой! Что-то пошло не так'}</p>
        <p className="text-red-300 mb-6 max-w-md px-2" id="error-message-description">{error}</p>
        <button 
          onClick={handleRetry}
          className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#4361EE] to-[#3A0CA3] text-white font-semibold hover:opacity-90 transition-opacity"
          aria-describedby="error-message-title error-message-description"
        >
          {currentLanguage === 'en' ? 'Try Again' : 'Попробовать снова'}
        </button>
      </div>
    );
  }
  
  const dataToDisplay = resultsData; 

  if (!dataToDisplay) { 
     return (
      <div className="min-h-screen bg-gradient-to-br from-[#0B0022] to-[#121639] text-white p-4 sm:p-6 md:p-8 font-inter flex flex-col items-center justify-center text-center" role="status">
        <p className="text-xl font-gilroy">{currentLanguage === 'en' ? 'No results data available.' : 'Нет данных о результатах.'}</p>
        <p className="text-slate-400 text-sm mt-2">{currentLanguage === 'en' ? 'Please ensure you have completed an assessment or check the session ID.' : 'Пожалуйста, убедитесь, что вы завершили оценку, или проверьте идентификатор сессии.'}</p>
      </div>
    );
  }

  const radarChartData = dataToDisplay.traits.map(trait => ({
    subject: trait.name, 
    score: trait.score,
    fullMark: 100, 
  }));

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
    <div className="min-h-screen bg-gradient-to-br from-[#0B0022] to-[#121639] text-white p-4 sm:p-6 md:p-8 font-inter">
      <header className="flex flex-col sm:flex-row justify-between items-center mb-8 md:mb-12 gap-4 sm:gap-0">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#4361EE] to-[#3A0CA3] font-gilroy text-center sm:text-left">
          {currentLanguage === 'en' ? `${dataToDisplay.userName}'s TraitTune Insights` : `Результаты TraitTune для ${dataToDisplay.userName}`}
        </h1>
        <button 
          onClick={toggleLanguage}
          className="relative w-20 h-10 flex items-center bg-slate-700 rounded-full p-1 cursor-pointer transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#4CC9F0] self-center sm:self-auto"
          aria-label={currentLanguage === 'en' ? "Switch to Russian language" : "Переключиться на английский язык"}
          aria-pressed={currentLanguage === 'ru'}
          role="switch"
        >
          <span className={`absolute left-1 top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${currentLanguage === 'ru' ? 'translate-x-10' : 'translate-x-0'}`} aria-hidden="true"></span>
          <span className={`absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold transition-opacity duration-300 ${currentLanguage === 'en' ? 'opacity-100 text-slate-800' : 'opacity-50 text-white'}`} aria-hidden="true">EN</span>
          <span className={`absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold transition-opacity duration-300 ${currentLanguage === 'ru' ? 'opacity-100 text-slate-800' : 'opacity-50 text-white'}`} aria-hidden="true">RU</span>
        </button>
      </header>

      <main>
        <section aria-labelledby="profile-snapshot-title" className="mb-10 md:mb-16 p-4 sm:p-6 bg-white/10 backdrop-blur-lg rounded-xl shadow-xl border border-white/20">
          <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-6 text-center md:text-left">
            <img src={dataToDisplay.scoreBadgeAvatarUrl} alt={currentLanguage === 'en' ? `${dataToDisplay.scoreBadgeName} - Score Badge Avatar` : `${dataToDisplay.scoreBadgeName} - Аватар значка оценки`} className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-[#4CC9F0] shadow-lg" />
            <div className="flex-1">
              <h2 id="profile-snapshot-title" className="text-xl sm:text-2xl md:text-3xl font-semibold font-gilroy bg-clip-text text-transparent bg-gradient-to-r from-[#7209B7] to-[#560BAD] mb-1 sm:mb-2">
                {dataToDisplay.scoreBadgeName}
              </h2>
              <p className="text-slate-300 text-sm md:text-base leading-relaxed">
                {dataToDisplay.overallSummary}
              </p>
              <p className="text-xs text-slate-400 mt-2 sm:mt-3">
                {currentLanguage === 'en' ? 'Assessment Date:' : 'Дата оценки:'} {dataToDisplay.assessmentDate}
              </p>
            </div>
          </div>
        </section>

        <section aria-labelledby="radar-chart-title" className="mb-10 md:mb-16 p-4 sm:p-6 bg-white/10 backdrop-blur-lg rounded-xl shadow-xl border border-white/20">
          <h3 id="radar-chart-title" className="text-xl sm:text-2xl font-semibold font-gilroy mb-4 sm:mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-[#4361EE] to-[#3A0CA3]">
            {currentLanguage === 'en' ? 'Trait Dimensions Overview' : 'Обзор измерений черт'}
          </h3>
          <TraitRadarChart data={radarChartData} userName={dataToDisplay.userName} />
        </section>

        <section aria-labelledby="detailed-traits-title" className="mb-10 md:mb-16">
          <h3 id="detailed-traits-title" className="text-xl sm:text-2xl font-semibold font-gilroy mb-4 sm:mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-[#4361EE] to-[#3A0CA3]">
            {currentLanguage === 'en' ? 'Detailed Trait Breakdown' : 'Подробный анализ черт'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {dataToDisplay.traits.map((trait) => (
              <div key={trait.id} className="p-4 sm:p-5 bg-white/5 backdrop-blur-md rounded-lg shadow-lg border border-white/10 transition-all duration-300 hover:bg-white/10">
                <h4 className="text-md sm:text-lg font-semibold font-gilroy text-[#4CC9F0] mb-2">{trait.name}</h4>
                <div className="w-full bg-slate-700 rounded-full h-2.5 mb-1" role="progressbar" aria-valuenow={trait.score} aria-valuemin="0" aria-valuemax="100" aria-label={`${trait.name} score: ${trait.score} out of 100`}>
                  <div className="bg-gradient-to-r from-[#4CC9F0] to-[#7209B7] h-2.5 rounded-full" style={{ width: `${trait.score}%` }}></div>
                </div>
                <p className="text-xs text-slate-400 mb-2">{currentLanguage === 'en' ? `Score: ${trait.score}/100 - ${trait.segment}` : `Оценка: ${trait.score}/100 - ${trait.segment}`}</p>
                <p className="text-sm text-slate-300 mb-3 leading-relaxed">{trait.interpretation}</p>
                {trait.potential && (
                  <span className="inline-block bg-[#4CC9F0]/20 text-[#4CC9F0] text-xs font-medium px-2.5 py-0.5 rounded-full mb-3">
                    {currentLanguage === 'en' ? 'Explore Your Potential!' : 'Исследуйте свой потенциал!'}
                  </span>
                )}
                <button 
                  onClick={() => handleLearnMore(trait.id)}
                  className="text-sm text-[#4CC9F0] hover:text-sky-300 transition-colors duration-200 flex items-center"
                  aria-expanded={expandedTraitId === trait.id}
                  aria-controls={`trait-details-${trait.id}`}
                >
                  {expandedTraitId === trait.id ? (currentLanguage === 'en' ? 'Show Less' : 'Показать меньше') : (currentLanguage === 'en' ? 'Learn More' : 'Узнать больше')}
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ml-1 transition-transform duration-300 ${expandedTraitId === trait.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expandedTraitId === trait.id && trait.detailedInterpretation && (
                  <div id={`trait-details-${trait.id}`} className="mt-3 pt-3 border-t border-white/10" role="region" aria-live="polite">
                    <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{trait.detailedInterpretation}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="growth-exploration-title" className="mb-10 md:mb-16 p-4 sm:p-6 bg-white/10 backdrop-blur-lg rounded-xl shadow-xl border border-white/20">
          <h3 id="growth-exploration-title" className="text-xl sm:text-2xl font-semibold font-gilroy mb-4 text-center bg-clip-text text-transparent bg-gradient-to-r from-[#4361EE] to-[#3A0CA3]">
            {currentLanguage === 'en' ? 'Growth & Exploration' : 'Рост и исследование'}
          </h3>
          <ul className="list-disc list-inside space-y-2 text-slate-300 mb-6 text-sm sm:text-base">
            {dataToDisplay.growthTips.map((tip, index) => (
              <li key={index}>{tip}</li>
            ))}
          </ul>
          {dataToDisplay.lowConfidenceRetake && (
            <p className="text-sm text-amber-400 bg-amber-400/10 p-3 rounded-md mb-6" role="alert">
              {currentLanguage === 'en' ? 'Some of your traits are still unfolding! For a clearer picture, you can retake the assessment for these areas now or return in a week.' : 'Некоторые из ваших черт все еще раскрываются! Для более ясной картины вы можете пройти оценку по этим областям сейчас или вернуться через неделю.'}
            </p>
          )}
          <div className="text-center">
            <button 
              onClick={handleShareSnapshot}
              className="px-5 py-2.5 sm:px-6 sm:py-3 rounded-lg bg-gradient-to-r from-[#4361EE] to-[#3A0CA3] text-white font-semibold hover:opacity-90 transition-opacity text-sm sm:text-base">
              {currentLanguage === 'en' ? 'Share Public Snapshot' : 'Поделиться публичным снимком'}
            </button>
            {showShareFeedback && (
              <p className="text-sm text-green-400 mt-2" role="status" aria-live="polite">
                {currentLanguage === 'en' ? 'Link copied to clipboard!' : 'Ссылка скопирована в буфер обмена!'}
              </p>
            )}
          </div>
        </section>
      </main>

      <footer className="text-center pt-8 mt-12 border-t border-white/10" role="contentinfo">
        <button 
          onClick={handleDownloadPdf}
          className="px-4 py-2 sm:px-5 sm:py-2.5 mb-6 rounded-lg bg-gradient-to-r from-[#7209B7] to-[#560BAD] text-white font-semibold hover:opacity-90 transition-opacity text-sm sm:text-base">
          {currentLanguage === 'en' ? 'Download Full Report (PDF)' : 'Скачать полный отчет (PDF)'}
        </button>
        <div className="text-xs text-slate-400 space-x-2 sm:space-x-4">
          <a href="#" className="hover:text-[#4CC9F0]">{footerLinks[currentLanguage].privacy}</a>
          <span>|</span>
          <a href="#" className="hover:text-[#4CC9F0]">{footerLinks[currentLanguage].terms}</a>
          <span>|</span>
          <a href="#" className="hover:text-[#4CC9F0]">{footerLinks[currentLanguage].contact}</a>
        </div>
        <p className="text-xs text-slate-500 mt-4">&copy; {new Date().getFullYear()} TraitTune. {currentLanguage === 'en' ? 'All rights reserved.' : 'Все права защищены.'}</p>
      </footer>
    </div>
  );
};

export default ResultsPage;

