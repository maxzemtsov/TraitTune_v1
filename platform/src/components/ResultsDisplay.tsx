// /home/ubuntu/traittune_frontend/src/components/ResultsDisplay.tsx
// This component will be responsible for displaying the assessment results to the user.

"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress"; // For displaying scores or confidence
import { useI18n } from "@/components/providers/I18nProvider";

// Define a type for the result data expected by this component
// This should align with what the backend API will provide for results
export interface DimensionScore {
  id: string; // e.g., "optimistic_realistic"
  label_en: string;
  label_ru: string;
  score: number; // 0-100
  segment_en: string; // e.g., "Moderately Optimistic"
  segment_ru: string;
  confidence?: number; // 0-100
  description_en?: string; // Short narrative for this dimension
  description_ru?: string;
}

export interface AssessmentResults {
  overall_summary_en?: string;
  overall_summary_ru?: string;
  dimensions: DimensionScore[];
  score_badge_avatar_url?: string; // URL for the gamified avatar
  score_badge_type_en?: string; // e.g., "Visionary"
  score_badge_type_ru?: string;
  retake_recommendations?: { dimension_id: string; reason_en: string; reason_ru: string }[];
}

interface ResultsDisplayProps {
  results: AssessmentResults | null;
  onRetakeDimension?: (dimensionId: string) => void;
  onStartNewAssessment?: () => void;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, onRetakeDimension, onStartNewAssessment }) => {
  const { t, locale } = useI18n();

  if (!results) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8">
        <p className="text-lg mb-4">{t("results.loading_or_not_available")}</p>
        {/* Optionally, add a spinner or a placeholder graphic */}
      </div>
    );
  }

  const overallSummary = locale === "ru" ? results.overall_summary_ru : results.overall_summary_en;
  const scoreBadgeType = locale === "ru" ? results.score_badge_type_ru : results.score_badge_type_en;

  return (
    <div className="w-full max-w-3xl mx-auto p-4 space-y-6">
      <Card className="shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary">{t("results.title")}</CardTitle>
          {scoreBadgeType && (
            <CardDescription className="text-xl text-muted-foreground">
              {t("results.your_micro_type")}: <span className="font-semibold text-accent">{scoreBadgeType}</span>
            </CardDescription>
          )}
        </CardHeader>
        {results.score_badge_avatar_url && (
          <CardContent className="flex justify-center my-4">
            <img src={results.score_badge_avatar_url} alt={scoreBadgeType || t("results.score_badge_alt")} className="w-32 h-32 rounded-full border-4 border-primary shadow-lg" />
          </CardContent>
        )}
        {overallSummary && (
          <CardContent>
            <p className="text-lg text-center mb-6">{overallSummary}</p>
          </CardContent>
        )}
      </Card>

      <h2 className="text-2xl font-semibold text-center mt-8 mb-4">{t("results.dimension_details")}</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        {results.dimensions.map((dim) => {
          const label = locale === "ru" ? dim.label_ru : dim.label_en;
          const segment = locale === "ru" ? dim.segment_ru : dim.segment_en;
          const description = locale === "ru" ? dim.description_ru : dim.description_en;
          return (
            <Card key={dim.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-xl">{label}</CardTitle>
                <CardDescription className="text-md font-medium text-accent">{segment} ({dim.score}/100)</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <Progress value={dim.score} className="w-full mb-2 h-3" />
                {dim.confidence && <p className="text-sm text-muted-foreground mb-3">{t("results.confidence")}: {dim.confidence}%</p>}
                {description && <p className="text-sm">{description}</p>}
              </CardContent>
              {results.retake_recommendations?.find(rec => rec.dimension_id === dim.id) && onRetakeDimension && (
                <CardFooter>
                  <Button variant="outline" size="sm" onClick={() => onRetakeDimension(dim.id)}>
                    {t("results.retake_dimension")}
                  </Button>
                </CardFooter>
              )}
            </Card>
          );
        })}
      </div>

      {results.retake_recommendations && results.retake_recommendations.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>{t("results.retake_recommendations_title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {results.retake_recommendations.map(rec => {
              const reason = locale === "ru" ? rec.reason_ru : rec.reason_en;
              const dimensionLabel = results.dimensions.find(d => d.id === rec.dimension_id)?.
                                      (locale === "ru" ? results.dimensions.find(d => d.id === rec.dimension_id)?.label_ru : results.dimensions.find(d => d.id === rec.dimension_id)?.label_en)
                                      : rec.dimension_id;
              return (
                <p key={rec.dimension_id} className="text-sm">
                  <span className="font-semibold">{dimensionLabel}:</span> {reason}
                </p>
              );
            })}
          </CardContent>
        </Card>
      )}

      {onStartNewAssessment && (
        <div className="text-center mt-10">
          <Button size="lg" onClick={onStartNewAssessment}>{t("results.start_new_assessment")}</Button>
        </div>
      )}
    </div>
  );
};

export default ResultsDisplay;

