import React from 'react';

// Define the structure of a question
interface Question {
  id: string;
  text: string;
  type: 'likert' | 'multiple-choice' | 'open-ended'; // Add more types as needed
  options?: string[]; // For multiple-choice or likert
  // Add other question-specific properties here
}

interface AssessmentQuestionProps {
  question: Question;
  onAnswer: (questionId: string, answer: any) => void;
}

const AssessmentQuestion: React.FC<AssessmentQuestionProps> = ({ question, onAnswer }) => {
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    // For open-ended questions or simple inputs
    onAnswer(question.id, event.target.value);
  };

  const handleOptionChange = (option: string) => {
    // For multiple-choice or likert scale questions
    onAnswer(question.id, option);
  };

  const renderQuestionType = () => {
    switch (question.type) {
      case 'likert':
        return (
          <div className="flex space-x-2">
            {question.options?.map((option, index) => (
              <button
                key={index}
                onClick={() => handleOptionChange(option)}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                {option}
              </button>
            ))}
          </div>
        );
      case 'multiple-choice':
        return (
          <div className="flex flex-col space-y-2">
            {question.options?.map((option, index) => (
              <button
                key={index}
                onClick={() => handleOptionChange(option)}
                className="bg-gray-200 hover:bg-gray-300 text-black font-bold py-2 px-4 rounded"
              >
                {option}
              </button>
            ))}
          </div>
        );
      case 'open-ended':
        return (
          <textarea
            className="w-full p-2 border rounded"
            rows={3}
            onChange={handleInputChange}
            placeholder="Type your answer here..."
          />
        );
      default:
        return <p>Unsupported question type</p>;
    }
  };

  return (
    <div className="my-4 p-4 bg-white shadow-md rounded-lg">
      <p className="text-lg font-semibold mb-2">{question.text}</p>
      {renderQuestionType()}
    </div>
  );
};

export default AssessmentQuestion;

