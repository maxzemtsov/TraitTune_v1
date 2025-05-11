// /home/ubuntu/traittune/platform/src/components/sharing/ShareReportSection.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
// import { supabase } from "@/lib/supabaseClient"; // Assuming supabase client is set up
import { toast } from "sonner"; // Assuming sonner is used for notifications

// --- Placeholder API Interaction Functions ---
// These would be in a separate api.ts or services file in a real application

const FAKE_API_DELAY = 500;

// Simulates generating a private email invite link via backend
const generateEmailInviteAPI = async (email: string, reportId?: string, message?: string, sharerUserId?: string) => {
  console.log("API CALL: generateEmailInvite", { email, reportId, message, sharerUserId });
  await new Promise(resolve => setTimeout(resolve, FAKE_API_DELAY));
  // In real app, this calls: service.create_private_email_link(sharer_user_id, target_email, report_id, custom_message)
  return { success: true, link: `https://traittune.com/invite/email-${Date.now().toString(36)}`, message: "Invite sent successfully!" };
};

// Simulates generating a private one-time link via backend
const generateOneTimeLinkAPI = async (reportId?: string, expiresInHours?: number, sharerUserId?: string) => {
  console.log("API CALL: generateOneTimeLink", { reportId, expiresInHours, sharerUserId });
  await new Promise(resolve => setTimeout(resolve, FAKE_API_DELAY));
  // In real app, this calls: service.create_private_onetime_link(sharer_user_id, report_id, expires_in_hours)
  return { success: true, link: `https://traittune.com/invite/onetime-${Date.now().toString(36)}` };
};

// Simulates generating a public sharing link via backend
const generatePublicLinkAPI = async (campaignTag?: string, sharerUserId?: string) => {
  console.log("API CALL: generatePublicLink", { campaignTag, sharerUserId });
  await new Promise(resolve => setTimeout(resolve, FAKE_API_DELAY));
  // In real app, this calls: service.create_public_link(sharer_user_id, campaign_tag)
  return { success: true, link: `https://traittune.com/share/public-${Date.now().toString(36)}` };
};

// Simulates generating QR code data/link via backend
const generateQRCodeDataAPI = async (reportId?: string, sharerUserId?: string) => {
  console.log("API CALL: generateQRCodeData", { reportId, sharerUserId });
  await new Promise(resolve => setTimeout(resolve, FAKE_API_DELAY));
  // In real app, this calls: service.create_qr_code_link(sharer_user_id, report_id)
  // The backend would return the URL to be encoded, e.g., qr_link_data["qr_data_url"]
  const qrDataUrl = `https://traittune.com/qr/qr-${Date.now().toString(36)}`;
  // QR image generation can happen client-side using this dataUrl or server-side returning an image path
  return { success: true, qrDataUrl: qrDataUrl, qrImageUrl: null }; // qrImageUrl could be a path to a pre-generated image
};

// Simulates fetching sharing statuses and referral counts for the user
const getShareSummaryAPI = async (userId: string) => {
  console.log("API CALL: getShareSummary for user", userId);
  await new Promise(resolve => setTimeout(resolve, FAKE_API_DELAY));
  // In real app, this would aggregate data from sharing_link_events and sharing_links
  // e.g., count public link completions, list private invite statuses
  return {
    success: true,
    data: {
      privateInvites: [
        { id: "1", email: "friend1@example.com", status: "sent", shared_at: new Date().toISOString() },
        { id: "2", email: "colleague@example.com", status: "clicked", shared_at: new Date().toISOString() },
        { id: "3", email: "mentor@example.com", status: "test_completed", shared_at: new Date().toISOString() },
      ],
      publicReferralCompletions: Math.floor(Math.random() * 20), // Simulated count
    }
  };
};

// Simulates fetching user bonus token balance
const getUserBonusBalanceAPI = async (userId: string) => {
  console.log("API CALL: getUserBonusBalance for user", userId);
  await new Promise(resolve => setTimeout(resolve, FAKE_API_DELAY));
  // In real app, this calls: service.get_user_bonus_balance(user_id)
  return { success: true, balance: Math.floor(Math.random() * 100) + 50 }; // Simulated balance
};

// --- Component --- 
interface ShareReportSectionProps {
  reportId: string; 
  currentUserId: string; 
}

const ShareReportSection: React.FC<ShareReportSectionProps> = ({ reportId, currentUserId }) => {
  const [emailInvite, setEmailInvite] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [oneTimeLink, setOneTimeLink] = useState<string | null>(null);
  const [publicLink, setPublicLink] = useState<string | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [publicReferrals, setPublicReferrals] = useState<number>(0);
  const [bonusTokens, setBonusTokens] = useState<number>(0);
  // const [privateInviteStatuses, setPrivateInviteStatuses] = useState<any[]>([]);

  const fetchShareData = useCallback(async () => {
    setIsLoading(true);
    try {
      const summaryRes = await getShareSummaryAPI(currentUserId);
      if (summaryRes.success && summaryRes.data) {
        setPublicReferrals(summaryRes.data.publicReferralCompletions);
        // setPrivateInviteStatuses(summaryRes.data.privateInvites);
      }
      const balanceRes = await getUserBonusBalanceAPI(currentUserId);
      if (balanceRes.success) {
        setBonusTokens(balanceRes.balance);
      }
    } catch (error) {
      toast.error("Failed to load sharing data.");
      console.error("Error fetching share data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    fetchShareData();
  }, [fetchShareData]);

  const handleEmailInvite = async () => {
    if (!emailInvite) {
      toast.error("Please enter an email address.");
      return;
    }
    setIsLoading(true);
    try {
      const response = await generateEmailInviteAPI(emailInvite, reportId, customMessage, currentUserId);
      if (response.success) {
        toast.success(response.message || `Invite sent to ${emailInvite}!`);
        setEmailInvite("");
        setCustomMessage("");
        fetchShareData(); // Refresh data
      } else {
        toast.error("Failed to send invite.");
      }
    } catch (error) { toast.error("Error sending invite."); } 
    finally { setIsLoading(false); }
  };

  const handleGenerateOneTimeLink = async () => {
    setIsLoading(true);
    try {
      const response = await generateOneTimeLinkAPI(reportId, 72, currentUserId);
      if (response.success && response.link) {
        setOneTimeLink(response.link);
        toast.success("One-time link generated!");
      } else {
        toast.error("Failed to generate one-time link.");
      }
    } catch (error) { toast.error("Error generating link."); }
    finally { setIsLoading(false); }
  };

  const handleGeneratePublicLink = async () => {
    setIsLoading(true);
    try {
      const response = await generatePublicLinkAPI(undefined, currentUserId);
      if (response.success && response.link) {
        setPublicLink(response.link);
        toast.success("Public link generated!");
        // Note: Bonus tokens are awarded by the backend when a referral completes the test via this link.
        // The frontend will see updated bonusTokens after a fetchShareData() call.
      } else {
        toast.error("Failed to generate public link.");
      }
    } catch (error) { toast.error("Error generating link."); }
    finally { setIsLoading(false); }
  };

  const handleGenerateQRCode = async () => {
    setIsLoading(true);
    try {
      const response = await generateQRCodeDataAPI(reportId, currentUserId);
      if (response.success && response.qrDataUrl) {
        setQrCodeDataUrl(response.qrDataUrl);
        toast.success("QR Code data ready!");
      } else {
        toast.error("Failed to generate QR code data.");
      }
    } catch (error) { toast.error("Error generating QR code."); }
    finally { setIsLoading(false); }
  };

  const copyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      toast.success("Link copied to clipboard!");
    }).catch(err => {
      toast.error("Failed to copy link.");
    });
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Share Your Insights</h2>
        <button onClick={fetchShareData} disabled={isLoading} className="px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50">
          {isLoading ? "Refreshing..." : "Refresh Data"}
        </button>
      </div>

      {/* Bonus Tokens Display */}
      <div className="mb-8 p-4 bg-indigo-50 dark:bg-indigo-900 border border-indigo-200 dark:border-indigo-700 rounded-md">
        <h3 className="text-lg font-medium text-indigo-700 dark:text-indigo-300">Your Rewards</h3>
        <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{bonusTokens} Tokens</p>
        <p className="text-sm text-indigo-500 dark:text-indigo-400">Earn more by sharing publicly! Tokens can be used for premium platform features.</p>
      </div>

      {/* Private Email Invite */}
      <div className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-md">
        <h3 className="text-xl font-medium mb-3 text-gray-700 dark:text-gray-200">Private Invite via Email</h3>
        <input 
          type="email" 
          value={emailInvite} 
          onChange={(e) => setEmailInvite(e.target.value)} 
          placeholder="Recipient's email address"
          className="w-full p-2 mb-2 border rounded dark:bg-gray-800 dark:text-white dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
          disabled={isLoading}
        />
        <textarea 
          value={customMessage} 
          onChange={(e) => setCustomMessage(e.target.value)} 
          placeholder="Optional: Add a personal message (max 200 characters)"
          maxLength={200}
          className="w-full p-2 mb-3 border rounded dark:bg-gray-800 dark:text-white dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
          rows={3}
          disabled={isLoading}
        />
        <button onClick={handleEmailInvite} disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400">
          {isLoading ? "Sending..." : "Send Email Invite"}
        </button>
      </div>

      {/* Private One-Time Link */}
      <div className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-md">
        <h3 className="text-xl font-medium mb-3 text-gray-700 dark:text-gray-200">Private One-Time Link</h3>
        <button onClick={handleGenerateOneTimeLink} disabled={isLoading || !!oneTimeLink} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-green-400 mb-2">
          {isLoading ? "Generating..." : (oneTimeLink ? "Link Generated" : "Generate One-Time Link")}
        </button>
        {oneTimeLink && (
          <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded flex justify-between items-center">
            <span className="text-sm text-gray-700 dark:text-gray-300 truncate select-all">{oneTimeLink}</span>
            <button onClick={() => copyToClipboard(oneTimeLink)} className="ml-2 px-3 py-1 bg-gray-300 dark:bg-gray-600 text-xs rounded hover:bg-gray-400 dark:hover:bg-gray-500">
              Copy
            </button>
          </div>
        )}
      </div>

      {/* Public Link */}
      <div className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-md">
        <h3 className="text-xl font-medium mb-3 text-gray-700 dark:text-gray-200">Public Sharing Link</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          Share this link publicly. You earn {/** TODO: make this dynamic from config e.g. 10 */} bonus tokens for each new user who signs up and completes the assessment via this link.
        </p>
        <button onClick={handleGeneratePublicLink} disabled={isLoading || !!publicLink} className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-purple-400 mb-2">
          {isLoading ? "Generating..." : (publicLink ? "Link Generated" : "Generate Public Link")}
        </button>
        {publicLink && (
          <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded flex justify-between items-center">
            <span className="text-sm text-gray-700 dark:text-gray-300 truncate select-all">{publicLink}</span>
            <button onClick={() => copyToClipboard(publicLink)} className="ml-2 px-3 py-1 bg-gray-300 dark:bg-gray-600 text-xs rounded hover:bg-gray-400 dark:hover:bg-gray-500">
              Copy
            </button>
          </div>
        )}
        <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
          <p>Successful Referrals (Test Completions): {publicReferrals}</p>
        </div>
      </div>

      {/* QR Code */}
      <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-md">
        <h3 className="text-xl font-medium mb-3 text-gray-700 dark:text-gray-200">Share via QR Code</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          Let someone scan this QR code from your screen for quick sharing.
        </p>
        <button onClick={handleGenerateQRCode} disabled={isLoading || !!qrCodeDataUrl} className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 disabled:bg-teal-400 mb-2">
          {isLoading ? "Generating..." : (qrCodeDataUrl ? "QR Data Generated" : "Generate QR Code")}
        </button>
        {qrCodeDataUrl && (
          <div className="mt-3 p-3 bg-white dark:bg-gray-800 inline-block rounded shadow-lg">
            {/* For a real app, use a library like qrcode.react or similar */}
            {/* <QRCode value={qrCodeDataUrl} size={160} level="H" /> */}
            <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(qrCodeDataUrl)}`} 
                alt="QR Code" 
                width="160" 
                height="160" 
            />
            <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-1">Scan Me!</p>
          </div>
        )}
      </div>
      
      {/* TODO: Display private invite statuses if needed */}
    </div>
  );
};

export default ShareReportSection;

