// /home/ubuntu/traittune_backend/src/services/user_service/user_service.js

const supabase = require("../../config/supabaseClient");

/**
 * @description Fetches or creates a user profile.
 * For anonymous users, this might involve ensuring a user_context_metadata record exists.
 * For registered users, it fetches their main profile.
 * @param {string} userId - The Supabase user ID.
 * @param {boolean} isAnonymous - Flag indicating if the user is anonymous.
 * @returns {Promise<object>} User profile data.
 */
async function getUserProfile(userId, isAnonymous = false) {
  if (!userId) throw new Error("User ID is required to get profile.");

  // For registered users, Supabase auth object might be the primary source for some details.
  // Here, we focus on data stored in our custom tables like user_context_metadata.

  const { data, error } = await supabase
    .from("user_context_metadata") // This table seems to store most profile-like info
    .select("*")
    .eq("user_id", userId)
    // If multiple sessions can create metadata, might need to order by created_at and pick latest,
    // or have a separate users/profiles table.
    // For now, assume one primary metadata record per user_id or the latest one is relevant.
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle(); // Use maybeSingle to handle cases where no metadata record exists yet

  if (error) {
    console.error(`Error fetching user profile for ${userId}:`, error);
    throw new Error(`Failed to fetch user profile: ${error.message}`);
  }

  return data; // This could be null if no record found, which is acceptable
}

/**
 * @description Updates or creates user context metadata.
 * This is crucial for the onboarding flow where users provide initial details.
 * @param {string} userId - The Supabase user ID.
 * @param {string} sessionId - The current session ID (optional, but good for linking context to a session).
 * @param {object} metadata - Key-value pairs of metadata to store (e.g., { role, industry, goals, name, language_preference }).
 * @returns {Promise<object>} The created or updated metadata record.
 */
async function updateOrCreateUserContextMetadata(userId, sessionId, metadata) {
  if (!userId || !metadata || Object.keys(metadata).length === 0) {
    throw new Error("User ID and metadata are required.");
  }

  const payload = {
    user_id: userId,
    session_id: sessionId, // Link context to a specific session if provided
    ...metadata, // Spread the rest of the metadata fields
    updated_at: new Date().toISOString(),
  };

  // Try to update if a record for this user_id (and optionally session_id) exists, otherwise insert.
  // The schema for user_context_metadata has an auto-incrementing id, so upsert needs a conflict target.
  // If we assume one main context per user, user_id could be a conflict target if it were unique.
  // Given the schema, it might be simpler to insert and let application logic handle multiple context records if necessary,
  // or ensure client sends a context_metadata_id for updates.
  // For onboarding, we usually create a new one or update a session-specific one.

  // Let's assume we insert a new record for simplicity in this context, or if sessionId is new.
  // If a specific record needs updating, an `id` for `user_context_metadata` would be needed.
  const { data, error } = await supabase
    .from("user_context_metadata")
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error("Error saving user context metadata:", error);
    // Attempt an update if insert fails due to a unique constraint (e.g., if user_id + session_id was unique)
    // This depends on actual table constraints not fully detailed in the dump for unique combinations.
    // For now, we throw the error.
    throw new Error(`Failed to save user context metadata: ${error.message}`);
  }

  console.log(`User context metadata saved for user ${userId}, session ${sessionId}.`);
  return data;
}

/**
 * @description Links an anonymous user session/data to a newly registered user account.
 * This is a conceptual function. Actual linking in Supabase involves updating the user_id
 * on relevant records from the anonymous user_id to the registered user_id.
 * Supabase handles auth linking (e.g., anonymous to email/password) separately.
 * This function would handle our application-specific data.
 * @param {string} anonymousUserId - The ID of the anonymous user.
 * @param {string} registeredUserId - The ID of the newly registered user.
 * @returns {Promise<object>} Status of the linking operation.
 */
async function linkAnonymousToRegisteredUser(anonymousUserId, registeredUserId) {
  if (!anonymousUserId || !registeredUserId) {
    throw new Error("Anonymous User ID and Registered User ID are required for linking.");
  }

  console.log(`UserService: Linking anonymous user ${anonymousUserId} data to registered user ${registeredUserId}.`);

  const tablesToUpdate = ["user_sessions", "user_context_metadata", "user_responses", "open_responses", "user_results"];
  let errors = [];

  for (const table of tablesToUpdate) {
    const { error } = await supabase
      .from(table)
      .update({ user_id: registeredUserId, updated_at: new Date().toISOString() })
      .eq("user_id", anonymousUserId);

    if (error) {
      console.error(`Error updating user_id in ${table} from ${anonymousUserId} to ${registeredUserId}:`, error);
      errors.push({ table, message: error.message });
    }
  }

  if (errors.length > 0) {
    // Partial success or failure. Decide on rollback strategy or just report errors.
    // For now, report errors.
    return {
      success: false,
      message: "Failed to link all anonymous data.",
      errors,
    };
  }

  // Optionally, delete the anonymous Supabase auth user if no longer needed and if Supabase doesn't handle this automatically upon linking.
  // This requires admin privileges: await supabase.auth.admin.deleteUser(anonymousUserId);
  // Be very careful with this operation.

  return { success: true, message: "Anonymous user data successfully linked to registered user." };
}


module.exports = {
  getUserProfile,
  updateOrCreateUserContextMetadata,
  linkAnonymousToRegisteredUser,
};
