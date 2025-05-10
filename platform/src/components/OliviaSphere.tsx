import React from 'react';
import './OliviaSphere.css'; // Assuming CSS is in a separate file

interface OliviaSphereProps {
  isSpeaking: boolean;
  // Add any other props Olivia might need in the future
}

const OliviaSphere: React.FC<OliviaSphereProps> = ({ isSpeaking }) => {
  return (
    <div className={`olivia-sphere ${isSpeaking ? 'speaking' : ''}`}>
      {/* You can add more visual elements here if needed */}
    </div>
  );
};

export default OliviaSphere;
