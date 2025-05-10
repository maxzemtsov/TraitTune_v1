import React from "react";

interface RegistrationPromptProps {
  userName: string | null;
  onSignIn: (provider: "google" | "linkedin") => void; // Example providers
  onClose: () => void;
}

const RegistrationPrompt: React.FC<RegistrationPromptProps> = ({ userName, onSignIn, onClose }) => {
  // This is a placeholder component.
  // The actual implementation was intended to be a Dialog in AssessmentPage.tsx
  // For now, this will prevent the build error.
  return (
    <div style={{ border: "1px dashed #ccc", padding: "20px", margin: "20px", textAlign: "center" }}>
      <h4>Registration Prompt Placeholder</h4>
      <p>Hello, {userName || "Guest"}!</p>
      <p>This is where the registration prompt would appear.</p>
      <button onClick={() => onSignIn("google")} style={{margin: "5px"}}>Sign in with Google (Placeholder)</button>
      <button onClick={() => onSignIn("linkedin")} style={{margin: "5px"}}>Sign in with LinkedIn (Placeholder)</button>
      <button onClick={onClose} style={{margin: "5px"}}>Close (Placeholder)</button>
    </div>
  );
};

export default RegistrationPrompt;

