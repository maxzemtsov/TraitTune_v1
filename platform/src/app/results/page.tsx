/*
New component: ResultsPage
Path: /home/ubuntu/traittune/platform/src/app/results/page.tsx

This component displays the user's assessment results, including a summary, detailed trait analysis, and growth tips. It fetches data based on a session ID from the URL and presents it in a structured, user-friendly manner. The page also includes options for language switching and potentially sharing or downloading the report.

Key features:
- Fetches and displays assessment results based on session ID.
- Shows user name, assessment date, and a score badge.
- Provides an overall summary of the assessment.
- Lists individual traits with scores, segments, interpretations, and potential detailed interpretations.
- Offers growth tips based on the assessment.
- Includes a radar chart for visual representation of traits (TraitRadarChart component).
- Supports bilingual (English/Russian) content display, adapting to user's language preference.
- Handles loading and error states gracefully.
- Allows users to switch language and see content in either English or Russian.
- Provides options to share results or download a PDF (functionality for PDF download is a placeholder).

Dependencies:
- React, useState, useEffect, useCallback from 'react'
- useSearchParams from 'next/navigation' for URL parameter access
- Custom components: TraitRadarChart, Button, Card, ScrollArea, etc.
- i18n for internationalization (useTranslation hook)

Structure:
- Defines interfaces for Trait and ResultsData.
- Provides mock data for English and Russian languages for development and testing.
- `getLocalizedMockData` function to select mock data based on language.
- `ResultsPage` functional component:
  - State variables for results data, loading status, error messages, language, and expanded trait details.
  - `fetchResults` function to retrieve data (currently uses mock data).
  - `useEffect` hooks to trigger data fetching and language-specific data loading.
  - Handler functions for language toggle, trait detail expansion, sharing, and downloading.
  - JSX for rendering the page structure, including header, summary, trait details, and action buttons.

Styling:
- Uses Tailwind CSS classes for styling, consistent with the project's design system.
- Responsive design for various screen sizes.

Future considerations:
- Integration with a backend API to fetch real assessment data.
- Implementation of actual PDF generation and download functionality.
- Enhanced error handling and user feedback mechanisms.
- Accessibility improvements (e.g., ARIA attributes for dynamic content).
*/

'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress'; // Assuming a progress bar component
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { ChevronDown, ChevronUp, Share2, Download, Info } from 'lucide-react'; // Icons
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'; // For charts
import { useToast } from '@/components/ui/use-toast'; // For notifications
import { useI18n } from '@/components/providers/I18nProvider'; // For internationalization

// Define a type for the results data structure for better type safety
interface Trait {
  id: string;
  name: string;
  name_en?: string;
  name_ru?: string;
  score: number; // Assuming score is a number for chart representation
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
  scoreBadgeAvatarUrl: string; // URL for the avatar image
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

// Mock data for demonstration purposes
const mockResultsData_en: ResultsData = {
  userName: "John Doe",
  assessmentDate: "May 10, 2025",
  scoreBadgeAvatarUrl: "/placeholder-avatar.png", // Replace with actual path or URL
  scoreBadgeName: "Visionary Innovator",
  scoreBadgeName_en: "Visionary Innovator",
  scoreBadgeName_ru: "Провидец-Инноватор",
  overallSummary: "John, your results highlight your strong innovative spirit and your ability to approach challenges with a pragmatic mindset. You excel at finding creative solutions while staying grounded.",
  overallSummary_en: "John, your results highlight your strong innovative spirit and your ability to approach challenges with a pragmatic mindset. You excel at finding creative solutions while staying grounded.",
  overallSummary_ru: "Джон, ваши результаты подчеркивают ваш сильный новаторский дух и вашу способность подходить к вызовам с прагматичным мышлением. Вы преуспеваете в поиске творческих решений, оставаясь при этом на земле.",
  traits: [
    { id: "1", name: "Expressive vs. Reserved", name_en: "Expressive vs. Reserved", name_ru: "Экспрессивный против Сдержанного", score: 85, segment: "Highly Expressive", segment_en: "Highly Expressive", segment_ru: "Очень Экспрессивный", interpretation: "You readily express your thoughts and feelings, and you are outgoing.", interpretation_en: "You readily express your thoughts and feelings, and you are outgoing.", interpretation_ru: "Вы легко выражаете свои мысли и чувства, и вы общительны.", potential: false, detailedInterpretation: "Being highly expressive means you are comfortable sharing your inner world with others. This can foster strong connections and clear communication. In team settings, your willingness to voice opinions can drive discussions forward. However, be mindful of situations requiring more reserved communication to ensure all voices are heard.", detailedInterpretation_en: "Being highly expressive means you are comfortable sharing your inner world with others. This can foster strong connections and clear communication. In team settings, your willingness to voice opinions can drive discussions forward. However, be mindful of situations requiring more reserved communication to ensure all voices are heard.", detailedInterpretation_ru: "Быть очень экспрессивным означает, что вам комфортно делиться своим внутренним миром с другими. Это может способствовать прочным связям и четкому общению. В командной работе ваша готовность высказывать мнения может продвигать обсуждения вперед. Однако помните о ситуациях, требующих более сдержанного общения, чтобы все голоса были услышаны." },
    { id: "2", name: "Cooperative vs. Independent", name_en: "Cooperative vs. Independent", name_ru: "Кооперативный против Независимого", score: 60, segment: "Moderately Cooperative", segment_en: "Moderately Cooperative", segment_ru: "Умеренно Кооперативный", interpretation: "You value teamwork but can also work effectively alone.", interpretation_en: "You value teamwork but can also work effectively alone.", interpretation_ru: "Вы цените командную работу, но также можете эффективно работать в одиночку.", potential: true, detailedInterpretation: "Your balance between cooperation and independence allows you to adapt to various work styles. You can contribute effectively to group projects while also taking initiative on solo tasks. To further explore this potential, identify situations where you can lead collaborative efforts or take full ownership of independent challenges.", detailedInterpretation_en: "Your balance between cooperation and independence allows you to adapt to various work styles. You can contribute effectively to group projects while also taking initiative on solo tasks. To further explore this potential, identify situations where you can lead collaborative efforts or take full ownership of independent challenges.", detailedInterpretation_ru: "Ваш баланс между сотрудничеством и независимостью позволяет вам адаптироваться к различным стилям работы. Вы можете эффективно вносить вклад в групповые проекты, а также проявлять инициативу в сольных задачах. Чтобы дальше исследовать этот потенциал, определите ситуации, где вы можете возглавить совместные усилия или взять на себя полную ответственность за независимые вызовы." },
    { id: "3", name: "Detail-Oriented vs. Big Picture", name_en: "Detail-Oriented vs. Big Picture", name_ru: "Ориентированный на детали против Общей картины", score: 70, segment: "Balanced", segment_en: "Balanced", segment_ru: "Сбалансированный", interpretation: "You can focus on details while keeping the overall goal in mind.", interpretation_en: "You can focus on details while keeping the overall goal in mind.", interpretation_ru: "Вы можете сосредоточиться на деталях, не упуская из виду общую цель.", potential: false },
    { id: "4", name: "Cautious vs. Risk-Taker", name_en: "Cautious vs. Risk-Taker", name_ru: "Осторожный против Рискованного", score: 45, segment: "Moderately Cautious", segment_en: "Moderately Cautious", segment_ru: "Умеренно Осторожный", interpretation: "You prefer to assess risks before acting.", interpretation_en: "You prefer to assess risks before acting.", interpretation_ru: "Вы предпочитаете оценивать риски перед действием.", potential: false },
    { id: "5", name: "Structured vs. Flexible", name_en: "Structured vs. Flexible", name_ru: "Структурированный против Гибкого", score: 55, segment: "Adaptable", segment_en: "Adaptable", segment_ru: "Адаптивный", interpretation: "You can adapt to changing plans.", interpretation_en: "You can adapt to changing plans.", interpretation_ru: "Вы можете адаптироваться к меняющимся планам.", potential: true },
  ],
  growthTips: [
    "Explore leadership opportunities to leverage your proactive and innovative nature.",
    "Consider projects that require both strategic thinking and attention to detail to balance your big-picture focus.",
    "Practice active listening to further enhance your empathetic abilities in team settings."
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
    const data = mockResultsData_en; // In a real scenario, you would fetch language-specific data
    return {
        ...data,
        scoreBadgeName: lang === 'ru' ? data.scoreBadgeName_ru || data.scoreBadgeName : data.scoreBadgeName_en || data.scoreBadgeName,
        overallSummary: lang === 'ru' ? data.overallSummary_ru || data.overallSummary : data.overallSummary_en || data.overallSummary,
        traits: data.traits.map(trait => ({
            ...trait,
            name: lang === 'ru' ? trait.name_ru || trait.name : trait.name_en || trait.name,
            segment: lang === 'ru' ? trait.segment_ru || trait.segment : trait.segment_en || trait.segment,
            interpretation: lang === 'ru' ? trait.interpretation_ru || trait.interpretation : trait.interpretation_en || trait.interpretation,
            detailedInterpretation: lang === 'ru' ? trait.detailedInterpretation_ru : trait.detailedInterpretation_en,
        })),
        growthTips: lang === 'ru' ? data.growthTips_ru || data.growthTips : data.growthTips_en || data.growthTips,
    };
};

const ResultsPageContent = () => {
  const { t, locale, setLocale } = useI18n(); // Assuming useI18n is a custom hook for i18n
  const [resultsData, setResultsData] = useState<ResultsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedTraitId, setExpandedTraitId] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const sessionIdFromUrl = searchParams.get('sessionId'); // Or however you get the session ID

  useEffect(() => {
    // Simulate API call or data fetching
    // Replace with actual data fetching logic
    const fetchData = async () => {
      setLoading(true);
      try {
        // Simulate a delay for data fetching
        await new Promise(resolve => setTimeout(resolve, 1000));
        // For now, use mock data. In a real app, you'd fetch based on sessionIdFromUrl
        setResultsData(getLocalizedMockData(locale as 'en' | 'ru'));
        setError(null);
      } catch (e) {
        if (e instanceof Error) {
            setError(e.message);
        } else {
            setError("An unexpected error occurred.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [locale, sessionIdFromUrl]);

  const toggleLanguage = () => {
    setLocale(locale === 'en' ? 'ru' : 'en');
  };

  const handleToggleTraitDetail = (traitId: string) => {
    setExpandedTraitId(prevId => (prevId === traitId ? null : traitId));
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen text-lg">Loading results...</div>;
  }

  if (error || !resultsData) {
    return <div className="flex items-center justify-center h-screen text-lg text-red-500">Error loading results: {error || 'No data available'}</div>;
  }

  const { userName, assessmentDate, scoreBadgeAvatarUrl, scoreBadgeName, overallSummary, traits, growthTips } = resultsData;

  // Prepare data for the chart
  const chartData = traits.map(trait => ({
    name: trait.name,
    score: trait.score,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-4 sm:p-6 md:p-8 font-sans">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">{t('resultsPage.title', { name: userName })}</h1>
        <p className="text-lg text-gray-400">{t('resultsPage.assessmentDate', { date: assessmentDate })}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="md:col-span-1 bg-gray-800 shadow-xl rounded-lg">
          <CardHeader className="flex flex-col items-center text-center p-6">
            <img src={scoreBadgeAvatarUrl || '/placeholder-avatar.png'} alt="User Avatar" className="w-24 h-24 rounded-full mb-4 border-2 border-blue-500" />
            <CardTitle className="text-2xl font-semibold text-blue-400">{scoreBadgeName}</CardTitle>
          </CardHeader>
          <CardContent className="p-6 text-gray-300">
            <p className="text-sm italic">{overallSummary}</p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 bg-gray-800 shadow-xl rounded-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-blue-400">{t('resultsPage.traitScores')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
                <XAxis dataKey="name" tick={{ fill: '#A0AEC0', fontSize: 10 }} tickFormatter={(value: string) => value.substring(0, 3)} />
                <YAxis tick={{ fill: '#A0AEC0', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.9)', border: '1px solid #4A5568', borderRadius: '0.5rem' }}
                  labelStyle={{ color: '#E2E8F0' }}
                  itemStyle={{ color: '#CBD5E0' }}
                />
                <Legend wrapperStyle={{ color: '#A0AEC0' }} />
                <Bar dataKey="score" fill="#4299E1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-blue-300">{t('resultsPage.detailedTraits')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {traits.map((trait) => (
            <Card key={trait.id} className="bg-gray-800 shadow-md rounded-lg overflow-hidden">
              <CardHeader className="cursor-pointer" onClick={() => handleToggleTraitDetail(trait.id)}>
                <CardTitle className="text-lg font-medium text-blue-400 flex justify-between items-center">
                  {trait.name}
                  {expandedTraitId === trait.id ? <ChevronUp /> : <ChevronDown />}
                </CardTitle>
                <CardDescription className="text-sm text-gray-400">{trait.segment}</CardDescription>
              </CardHeader>
              {expandedTraitId === trait.id && (
                <CardContent className="p-4 pt-0 text-gray-300 text-sm">
                  <p className="mb-2"><strong>{t('resultsPage.interpretation')}:</strong> {trait.interpretation}</p>
                  {trait.detailedInterpretation && <p><strong>{t('resultsPage.details')}:</strong> {trait.detailedInterpretation}</p>}
                  <Progress value={trait.score} className="w-full h-2 mt-2" /> 
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4 text-blue-300">{t('resultsPage.growthTips')}</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-300">
          {growthTips.map((tip, index) => (
            <li key={index}>{tip}</li>
          ))}
        </ul>
      </div>

      {/* Language toggle and other actions */}
      <div className="fixed bottom-4 right-4 flex flex-col space-y-2">
        <Button onClick={toggleLanguage} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full shadow-lg transition duration-150 ease-in-out">
          {locale === 'en' ? 'Switch to Russian' : 'Switch to English'}
        </Button>
        <Button onClick={() => { /* Implement share functionality */ }} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full shadow-lg transition duration-150 ease-in-out">
          <Share2 className="inline-block mr-2" /> {t('resultsPage.shareResults')}
        </Button>
        <Button onClick={() => { /* Implement PDF download */ }} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full shadow-lg transition duration-150 ease-in-out">
          <Download className="inline-block mr-2" /> {t('resultsPage.downloadPdf')}
        </Button>
      </div>

      {/* Display low confidence retake message if applicable */}
      {resultsData.lowConfidenceRetake && (
        <div className="fixed bottom-4 left-4 bg-yellow-500 text-black p-3 rounded-lg shadow-lg">
          <p><Info className="inline-block mr-2" />{t('resultsPage.retakePrompt')}</p>
        </div>
      )}
    </div>
  );
};

// Suspense boundary for client components
const ResultsPageWithSuspense = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <ResultsPageContent />
  </Suspense>
);

export default ResultsPageWithSuspense;


