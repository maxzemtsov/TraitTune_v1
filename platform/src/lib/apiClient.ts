// /home/ubuntu/traittune_frontend/src/lib/apiClient.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api/v1"; // Assuming backend runs on the same host or configured URL

interface ApiCallOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  headers?: Record<string, string>;
  body?: any;
}

async function apiClient<T>(endpoint: string, options: ApiCallOptions = {}): Promise<T> {
  const { method = "GET", headers = {}, body } = options;

  const config: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      // Add Authorization header if a token exists (e.g., from Supabase auth)
      // const token = getSupabaseToken(); // Implement this function
      // if (token) headers["Authorization"] = `Bearer ${token}`;
      ...headers,
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || `API request failed with status ${response.status}`);
    }

    if (response.status === 204) { // No Content
      return undefined as T;
    }

    return response.json() as Promise<T>;
  } catch (error) {
    console.error(`API Client Error (${method} ${endpoint}):`, error);
    throw error;
  }
}

export default apiClient;

// Helper to get Supabase token (example - implement based on your auth setup)
// import { supabase } from "./supabaseClient"; // Assuming you have a supabase client for frontend
// async function getSupabaseToken() {
//   const { data, error } = await supabase.auth.getSession();
//   if (error) return null;
//   return data.session?.access_token || null;
// }

