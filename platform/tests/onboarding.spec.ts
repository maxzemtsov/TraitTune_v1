// /home/ubuntu/traittune_frontend/tests/onboarding.spec.ts
import { test, expect } from "@playwright/test";

test.describe("E2E Onboarding Flow", () => {
  test("E2E-ONB-001: Anonymous guest user onboarding and initial greeting", async ({ page }) => {
    // 1. Navigate to the TraitTune application URL.
    await page.goto("http://localhost:3000"); // Assuming frontend runs on port 3000

    // 2. Observe the initial page load and greeting message from the AI avatar (Olivia).
    // Verify the language is English by default.
    // For ChatWindow.tsx, the initial AI message is static for now.
    const initialAiMessage = page.locator("text=Hello! I am TraitTune AI. How can I help you start your assessment today?");
    await expect(initialAiMessage).toBeVisible();

    // 3. Enter a name when prompted.
    // The ChatInput component has a placeholder "Type your message..."
    const chatInput = page.locator("input[placeholder=\"Type your message...\"]");
    await expect(chatInput).toBeVisible();
    await chatInput.fill("Tester");
    await page.keyboard.press("Enter");

    // 4. Verify the AI avatar acknowledges the name.
    // This part is tricky without knowing the exact AI response. 
    // For now, we check if the user's message appears.
    const userMessage = page.locator("text=Tester");
    await expect(userMessage).toBeVisible();

    // Further checks for AI acknowledgement would require more specific selectors or backend mocking.
    // Example: Check for a new AI message after user input.
    // This assumes the AI responds quickly and the response is added to the message list.
    // This part will likely need adjustment based on actual AI response behavior.
    // const aiAcknowledgement = page.locator(".message-bubble-ai >> text=/.*Tester.*/i"); // Example selector
    // await expect(aiAcknowledgement).toBeVisible({ timeout: 10000 });

    // Verify progress indicator (if a selector is available)
    // const progressIndicator = page.locator("text=0% complete");
    // await expect(progressIndicator).toBeVisible();

    // Note: Supabase anonymous auth and Cloudflare Turnstile are harder to verify directly in E2E 
    // without specific hooks or visibility into network requests in a controlled manner.
  });
});

