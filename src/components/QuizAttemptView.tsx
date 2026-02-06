import { useState } from 'react';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { Quiz, QuizAttempt } from '../types';
import { storage } from '../utils/storage';
import { evaluateQuizAnswer } from '../utils/mockAI';

interface QuizAttemptViewProps {
  quiz: Quiz;
  onBack: () => void;
}

export const QuizAttemptView = ({ quiz, onBack }: QuizAttemptViewProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [questionId: string]: string }>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [results, setResults] = useState<QuizAttempt | null>(null);

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;

  const handleAnswerChange = (answer: string) => {
    setAnswers({
      ...answers,
      [currentQuestion.id]: answer,
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = () => {
    let totalScore = 0;
    const feedback: { [questionId: string]: string } = {};

    quiz.questions.forEach((question) => {
      const userAnswer = answers[question.id] || '';
      const evaluation = evaluateQuizAnswer(question, userAnswer);
      feedback[question.id] = evaluation.feedback;
      if (evaluation.isCorrect) {
        totalScore++;
      }
    });

    const percentageScore = Math.round((totalScore / quiz.questions.length) * 100);

    const attempt: QuizAttempt = {
      id: `attempt_${Date.now()}`,
      quizId: quiz.id,
      documentId: quiz.documentId,
      documentName: quiz.documentName,
      userAnswers: answers,
      score: percentageScore,
      feedback,
      attemptDate: new Date().toISOString(),
    };

    storage.saveQuizAttempt(attempt);
    storage.addActivity({
      id: `activity_${Date.now()}`,
      documentId: quiz.documentId,
      documentName: quiz.documentName,
      type: 'quiz_attempted',
      timestamp: new Date().toISOString(),
      metadata: {
        score: percentageScore,
      },
    });

    setResults(attempt);
    setIsSubmitted(true);
  };

  if (isSubmitted && results) {
    return (
      <div className="space-y-6">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Quizzes</span>
        </button>

        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-8 border border-blue-200 text-center">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
            results.score >= 70 ? 'bg-green-100' : 'bg-orange-100'
          }`}>
            {results.score >= 70 ? (
              <CheckCircle className="w-10 h-10 text-green-600" />
            ) : (
              <XCircle className="w-10 h-10 text-orange-600" />
            )}
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Quiz Complete!
          </h2>
          <p className="text-xl text-gray-700 mb-4">
            Your Score: <span className="font-bold text-blue-600">{results.score}%</span>
          </p>
          <p className="text-gray-600">
            You got {Math.round((results.score / 100) * quiz.questions.length)} out of {quiz.questions.length} questions correct
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-900">Detailed Feedback</h3>
          {quiz.questions.map((question, index) => {
            const userAnswer = results.userAnswers[question.id] || 'No answer provided';
            const feedback = results.feedback[question.id];
            const evaluation = evaluateQuizAnswer(question, userAnswer);

            return (
              <div
                key={question.id}
                className="bg-white border border-gray-200 rounded-xl p-6"
              >
                <div className="flex items-start space-x-3 mb-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </span>
                  <p className="flex-1 font-medium text-gray-900">{question.question}</p>
                  {evaluation.isCorrect ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600" />
                  )}
                </div>

                <div className="ml-11 space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Your Answer:</p>
                    <p className="text-gray-900 bg-gray-50 rounded-lg p-3">{userAnswer}</p>
                  </div>

                  {question.correctAnswer && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Expected Answer:</p>
                      <p className="text-gray-900 bg-green-50 rounded-lg p-3">{question.correctAnswer}</p>
                    </div>
                  )}

                  <div className={`rounded-lg p-3 ${
                    evaluation.isCorrect ? 'bg-green-50' : 'bg-orange-50'
                  }`}>
                    <p className={`text-sm font-medium ${
                      evaluation.isCorrect ? 'text-green-800' : 'text-orange-800'
                    }`}>
                      {feedback}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-medium">Back to Quizzes</span>
      </button>

      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Question {currentQuestionIndex + 1} of {quiz.questions.length}
          </span>
          <span className="text-sm font-medium text-blue-600">
            {Math.round(((currentQuestionIndex + 1) / quiz.questions.length) * 100)}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all"
            style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6">{currentQuestion.question}</h3>

        {currentQuestion.type === 'mcq' && currentQuestion.options && (
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <label
                key={index}
                className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  answers[currentQuestion.id] === option
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name={currentQuestion.id}
                  value={option}
                  checked={answers[currentQuestion.id] === option}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  className="sr-only"
                />
                <span className="text-gray-900">{option}</span>
              </label>
            ))}
          </div>
        )}

        {currentQuestion.type === 'short' && (
          <textarea
            value={answers[currentQuestion.id] || ''}
            onChange={(e) => handleAnswerChange(e.target.value)}
            placeholder="Type your answer here..."
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
          />
        )}

        {currentQuestion.type === 'long' && (
          <textarea
            value={answers[currentQuestion.id] || ''}
            onChange={(e) => handleAnswerChange(e.target.value)}
            placeholder="Type your detailed answer here..."
            rows={8}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
          />
        )}
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        {isLastQuestion ? (
          <button
            onClick={handleSubmit}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl"
          >
            Submit Quiz
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
          >
            Next Question
          </button>
        )}
      </div>
    </div>
  );
};
