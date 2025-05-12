// gamification_setup_outline.js
// Revised: May 07 2025
// Purpose: This document provides a comprehensive conceptual guide for frontend developers 
// to integrate gamification elements (badges, evolving avatars, progress indicators) into 
// the TraitTune application. It is not executable code but a set of actionable steps and 
// considerations, ensuring alignment with project requirements (PRD, Onboarding Spec, UX Spec), 
// leveraging backend data for gamification logic, and supporting full bilingual (English/Russian) display.

// --- 1. Introduction & Core Gamification Principles ---
// TraitTune's gamification aims to enhance user engagement, encourage honest responses, 
// reduce test anxiety, and motivate assessment completion and reassessment.
// Key elements include: Score Badge Avatars, Section Badges, Progress Indicators, and Narrative Framing.
// Olivia, the AI agent, may also deliver gamification-related messages.

// --- 2. Core Gamification Concepts & Backend Dependencies ---
//    A. Score Badge Avatars (Micro-types):
//       - Concept: Unique visual representation of the user's personality archetype, derived from their dominant trait segments.
//       - Backend Driven: The backend (likely scoring_service or a dedicated gamification service) will determine the user's archetype/micro-type based on their assessment results (`user_results` table).
//       - Evolution: Avatars evolve based on reassessments and demonstrated growth, with the backend tracking this evolution.
//       - Frontend Role: Display the current avatar, animate transitions during evolution, and potentially allow users to view their avatar's progression.
//       - Bilingual Aspect: Archetype names/descriptions for display should be translatable (see Section 6).

//    B. Section Badges:
//       - Concept: Rewards for completing specific sections of the assessment (e.g., a set of questions for a dimension) or achieving milestones.
//       - Backend Driven: The backend will likely determine when a badge is earned and store this information (e.g., in `user_results` or a dedicated `user_badges` table).
//       - Frontend Role: Display earned badges, potentially with animations upon earning. Fetch list of earned badges from backend.
//       - Bilingual Aspect: Badge names and descriptions must be translatable (see Section 6).
//         The `interpretation_templates` table (fields like `microtype_hint_en`, `microtype_hint_ru`) might be a source for badge-related text or hints, or a new table `badges` might exist/be needed.

//    C. Progress Indicators:
//       - Concept: Visual feedback on assessment completion status.
//       - Backend Driven: The backend (engine_service) provides data on progress (e.g., questions answered, estimated total, percentage complete).
//       - Frontend Role: Render the progress visually (bar, percentage, steps on a journey map) and update it in real-time.
//       - Bilingual Aspect: Text accompanying progress indicators (e.g., "{percentage}% complete") must be translatable.

//    D. Narrative Framing & Olivia:
//       - Concept: Presenting the assessment as an engaging "journey" with Olivia as the guide.
//       - Frontend Role: Integrate narrative elements into the UI and chat flow. Olivia's dialogue (from `en.json`/`ru.json`) will include gamified prompts and encouragement.
//       - Example: Olivia announcing a new badge: `t("gamification.olivia_badge_unlocked", { badgeName: t("badges.optimism_explorer.name") })`

// --- 3. Data Requirements & Backend Interaction ---
//    - User's current gamification state: Current avatar (archetype, evolution level), list of earned badges.
//      This data should be fetched from the backend (e.g., `/api/v1/user/gamification-profile`).
//    - Assessment progress: Fetched from backend session data or specific progress endpoints.
//    - Badge Definitions: If not fully managed by backend, frontend might need a static list of possible badges with asset URLs, but names/descriptions should still be driven by i18n keys that map to backend-provided identifiers.
//      Ideally, the backend provides badge IDs, and the frontend uses these IDs to look up localized names/descriptions and static assets.

// --- 4. Frontend Implementation - Conceptual Steps ---

//    A. Badge Display & Logic:
//       - Fetch earned badges from the backend for the current user.
//       - Each badge object from backend should ideally include: `id`, `earned_at`.
//       - Frontend maps `badge.id` to: 
//         - Localized name: `t("badges.<badge_id>.name")`
//         - Localized description: `t("badges.<badge_id>.description")`
//         - Static image asset: `/assets/badges/<badge_id>.png` (or `<badge_name_en_slugified>.png`)
//       - UI: Display in a dedicated "Achievements" or profile section. Animate newly earned badges.

//    B. Score Badge Avatar Display & Logic:
//       - Fetch current avatar state from backend: `{ archetype_id: "visionary", evolution_level: 2 }`.
//       - Frontend maps `archetype_id` and `evolution_level` to:
//         - Localized archetype name: `t("avatars.archetypes.<archetype_id>.name")`
//         - Static avatar image/layers: `/assets/avatars/<archetype_id>/level_<evolution_level>.svg`
//       - UI: Display prominently. Animate evolution if the backend signals a change.

//    C. Progress Indicator Implementation:
//       - Fetch progress data (e.g., `{ current_step: 5, total_steps: 10, percentage: 50 }`).
//       - UI: Render using a progress bar component, text, or visual journey map.
//       - Example: `<ProgressBar current={progress.current_step} total={progress.total_steps} label={t("gamification.progress_label", { percent: progress.percentage })} />`

// --- 5. Component Structure (Conceptual for React) ---
/*
// src/components/Gamification/AvatarDisplay.js
import { useTranslation } from "react-i18next";
const AvatarDisplay = ({ avatarData }) => { // avatarData: { archetype_id: "visionary", evolution_level: 2 }
  const { t } = useTranslation();
  if (!avatarData) return null;
  const avatarName = t(`avatars.archetypes.${avatarData.archetype_id}.name`);
  const avatarImageSrc = `/assets/avatars/${avatarData.archetype_id}/level_${avatarData.evolution_level}.svg`;
  return <img src={avatarImageSrc} alt={avatarName} title={avatarName} />;
};

// src/components/Gamification/BadgeItem.js
import { useTranslation } from "react-i18next";
const BadgeItem = ({ badge }) => { // badge: { id: "optimism_explorer_badge" }
  const { t } = useTranslation();
  const badgeName = t(`badges.${badge.id}.name`);
  const badgeDescription = t(`badges.${badge.id}.description`);
  const badgeImageSrc = `/assets/badges/${badge.id}.png`; // Or a more robust mapping
  return (
    <li>
      <img src={badgeImageSrc} alt={badgeName} />
      <div>
        <strong>{badgeName}</strong>
        <p>{badgeDescription}</p>
      </div>
    </li>
  );
};

// src/components/Gamification/UserBadges.js
const UserBadges = ({ earnedBadges }) => { // earnedBadges: [{ id: "..." }, ...]
  if (!earnedBadges || earnedBadges.length === 0) return <p>{t("gamification.no_badges_yet")}</p>;
  return (
    <ul>
      {earnedBadges.map(badge => <BadgeItem key={badge.id} badge={badge} />)}
    </ul>
  );
};
*/

// --- 6. Bilingual Support for Gamification Elements ---
//    - All user-facing text related to gamification MUST be translatable.
//    - Add keys to `/src/locales/en.json` and `/src/locales/ru.json` for:
//      - Badge names (e.g., `"badges.optimism_explorer.name": "Optimism Explorer"`)
//      - Badge descriptions (e.g., `"badges.optimism_explorer.description": "Awarded for deeply exploring the optimism dimension."`) 
//      - Avatar archetype names (e.g., `"avatars.archetypes.visionary.name": "Visionary"`)
//      - Narrative text, notifications, and labels (e.g., `"gamification.badge_unlocked_title": "New Badge Unlocked!"`)
//    - The `interpretation_templates` table in the database contains `microtype_hint_en` and `microtype_hint_ru` which might serve as a basis for some archetype descriptions or badge-related text. The frontend should use localized strings for these, potentially mapping backend IDs to i18n keys.

// --- 7. State Management Considerations ---
//    - User's gamification profile (avatar, badges) should be fetched from the backend upon login/session start and potentially refreshed.
//    - Global state management (Redux, Zustand, Context API) can hold this profile for easy access by various components.
//    - Temporary UI states (e.g., animation for a newly unlocked badge) can be component-local.

// --- 8. Key Considerations & Best Practices ---
//    - Subtlety: Gamification should enhance, not distract from, the core assessment experience.
//    - Clarity: Users should understand why they received a badge or why their avatar changed.
//    - Backend Authority: The backend is the source of truth for earned achievements and avatar status.
//    - Asset Management: Organize badge and avatar image assets clearly.
//    - Performance: Ensure animations are smooth and don't degrade UI performance.

// --- 9. Conclusion ---
// This outline provides a conceptual framework for integrating gamification. The frontend team will need to 
// collaborate closely with the backend team to define API endpoints for gamification data and ensure 
// seamless data flow. The goal is to create an engaging layer that complements TraitTune's core 
// assessment capabilities, fully supporting bilingual users and leveraging Olivia's persona.

console.log("gamification_setup_outline.js has been updated to be a more comprehensive and actionable guide, emphasizing backend data integration and bilingual support.");

