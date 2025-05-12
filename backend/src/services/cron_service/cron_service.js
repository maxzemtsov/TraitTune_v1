// /home/ubuntu/traittune_backend/src/services/cron_service/cron_service.js

const cron = require("node-cron");
const supabase = require("../../config/supabaseClient");

/**
 * @description Archives guest session data older than 7 days in an anonymized format.
 * This function would be called by a cron job.
 */
async function archiveOldGuestSessions() {
  console.log("CronService: Starting job to archive old guest sessions...");

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  // 1. Identify guest users (e.g., users with is_anonymous=true in Supabase auth.users or a custom flag in our users table)
  //    For this example, let's assume we have a way to identify guest user_ids.
  //    A more robust way would be to join user_sessions with a users table that has an is_anonymous flag.
  //    Or, if Supabase auth stores anonymous user metadata, query that.
  //    For now, we will assume any session older than 7 days not linked to a registered user (e.g. email is null in auth.users) is a guest session.

  // Fetch sessions older than 7 days
  const { data: oldSessions, error: fetchSessionsError } = await supabase
    .from("user_sessions")
    .select("id, user_id, created_at")
    .lt("created_at", sevenDaysAgo)
    .eq("status", "completed") // Or any other status that means it's done and archivable
    // .is("archived_at", null) // Add a flag to avoid re-archiving
  
  if (fetchSessionsError) {
    console.error("CronService: Error fetching old sessions:", fetchSessionsError);
    return;
  }

  if (!oldSessions || oldSessions.length === 0) {
    console.log("CronService: No old guest sessions found to archive.");
    return;
  }

  console.log(`CronService: Found ${oldSessions.length} sessions to potentially archive.`);

  for (const session of oldSessions) {
    try {
      // Check if the user is anonymous. This is a simplified check.
      // In a real scenario, you'd query supabase.auth.admin.getUserById(session.user_id)
      // and check if user.email is null or if user.is_anonymous is true (if that field exists).
      // This requires admin privileges for Supabase Auth.
      // For now, we proceed with archiving, assuming these are guest sessions.
      // A `is_guest` flag on `user_sessions` or `users` table would be better.

      console.log(`CronService: Archiving session ${session.id} for user ${session.user_id}.`);

      // 2. Anonymize data: This is highly dependent on what data needs to be kept and what needs to be anonymized.
      //    - user_context_metadata: Remove PII (name, email, linkedin_profile_url, etc.) or replace with placeholders.
      //    - user_responses, open_responses: Keep response data but ensure user_id is not directly linkable if full anonymization is needed.
      //    - user_results: Keep aggregated results.

      // Example: Update user_context_metadata to remove PII for the archived user_id if it's a guest.
      // This is a conceptual step. Actual anonymization might involve creating new anonymized records
      // in separate archive tables rather than updating live tables, or nullifying fields.

      // For this example, we will just mark the session as archived.
      // True anonymization would be more complex.
      const { error: archiveError } = await supabase
        .from("user_sessions")
        .update({ 
          status: "archived", 
          // archived_at: new Date().toISOString() // Add this field to your table
          // anonymized_data: true // Add a flag indicating anonymization has occurred
        })
        .eq("id", session.id);

      if (archiveError) {
        console.error(`CronService: Error marking session ${session.id} as archived:`, archiveError);
      } else {
        console.log(`CronService: Session ${session.id} successfully marked as archived.`);
        // Further anonymization steps would go here, e.g., updating user_context_metadata
        // await supabase.from("user_context_metadata").update({ name: "[archived]", email_address: null, ... }).eq("user_id", session.user_id).eq("session_id", session.id);
      }
    } catch (err) {
      console.error(`CronService: Error processing session ${session.id} for archiving:`, err);
    }
  }
  console.log("CronService: Finished archiving job.");
}

/**
 * @description Initializes and starts the cron job for archiving.
 */
function initializeCronJobs() {
  // Schedule to run once a day at midnight, for example.
  cron.schedule("0 0 * * *", archiveOldGuestSessions, {
    scheduled: true,
    timezone: "UTC",
  });
  console.log("CronService: Archiving job scheduled to run daily at midnight UTC.");

  // For testing, you might want to run it more frequently, e.g., every minute
  // cron.schedule("* * * * *", archiveOldGuestSessions);
  // console.log("CronService: Archiving job scheduled to run every minute (for testing).");
}

module.exports = {
  archiveOldGuestSessions,
  initializeCronJobs,
};
