import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { Clock, Calendar, Award, Eye, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';

interface QuizAttempt {
  id: string;
  attempt_id: string;
  quiz_id: string;
  document_id: string;
  document_name: string;
  quiz_type: string;
  total_score: number;
  questions: Array<{
    question: string;
    options?: Array<{ text: string }>;
    correct_answer?: string;
    user_answer: string;
    is_correct?: boolean;
    feedback: string;
    reference_pages?: number[];
    score?: number;
  }>;
  attempt_date: string;
}

interface ActivityHistoryProps {
  documentId: string;
}

export const ActivityHistory = ({ documentId }: ActivityHistoryProps) => {
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [selectedAttempt, setSelectedAttempt] = useState<QuizAttempt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAttempts();
  }, [documentId]);

  const loadAttempts = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching attempts for document:', documentId);
      const data = await apiService.getQuizAttempts(documentId);
      console.log('Received attempts data:', data);
      const sorted = data.sort((a: QuizAttempt, b: QuizAttempt) => 
        new Date(b.attempt_date).getTime() - new Date(a.attempt_date).getTime()
      );
      setAttempts(sorted);
    } catch (err) {
      console.error('Error loading attempts:', err);
      setError('Failed to load attempts');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', day: 'numeric', year: 'numeric' 
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', { 
      hour: '2-digit', minute: '2-digit' 
    });
  };

  if (selectedAttempt) {
    const questions = selectedAttempt.questions || [];
    
    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelectedAttempt(null)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Attempts</span>
        </button>

        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedAttempt.document_name}</h2>
          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(selectedAttempt.attempt_date)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{formatTime(selectedAttempt.attempt_date)}</span>
            </div>
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
              {selectedAttempt.quiz_type}
            </span>
          </div>
          <div className="text-3xl font-bold text-blue-600">
            Score: {selectedAttempt.total_score}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-900">Questions & Answers</h3>
          {questions.map((q, index) => (
            <div key={index} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <p className="font-semibold text-gray-900 flex-1">
                  {index + 1}. {q.question}
                </p>
                {q.options && q.is_correct !== null && (
                  q.is_correct ? 
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 ml-2" /> : 
                    <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 ml-2" />
                )}
              </div>

              {q.options && Array.isArray(q.options) && q.options.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Options:</p>
                  <div className="space-y-2">
                    {q.options.map((opt, i) => (
                      <div 
                        key={i} 
                        className={`p-3 rounded-lg border ${
                          opt.text === q.correct_answer ? 'bg-green-50 border-green-300' :
                          opt.text === q.user_answer ? 'bg-red-50 border-red-300' :
                          'bg-gray-50 border-gray-200'
                        }`}
                      >
                        {opt.text}
                        {opt.text === q.correct_answer && <span className="ml-2 text-green-600 font-medium">✓ Correct</span>}
                        {opt.text === q.user_answer && opt.text !== q.correct_answer && <span className="ml-2 text-red-600 font-medium">Your answer</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!q.options && (
                <>
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">Your Answer:</p>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{q.user_answer}</p>
                  </div>
                  {q.score !== undefined && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">Score:</p>
                      <p className="text-lg font-bold text-blue-600">{q.score}</p>
                    </div>
                  )}
                </>
              )}

              {q.feedback && (
                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-700 mb-1">Feedback:</p>
                  <p className="text-gray-700 bg-blue-50 p-3 rounded-lg">{q.feedback}</p>
                </div>
              )}

              {q.reference_pages && Array.isArray(q.reference_pages) && q.reference_pages.length > 0 && (
                <p className="text-sm text-gray-600">
                  📄 Reference: Page {q.reference_pages.join(', ')}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700 font-medium">{error}</p>
        <p className="text-red-600 text-sm mt-2">Check the browser console for more details.</p>
      </div>
    );
  }

  if (attempts.length === 0) {
    return (
      <div className="text-center py-12">
        <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Quiz Attempts</h3>
        <p className="text-gray-600">Complete a quiz to see your attempt history here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Activity History</h2>
      
      {attempts.map((attempt) => (
        <div key={attempt.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(attempt.attempt_date)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{formatTime(attempt.attempt_date)}</span>
                </div>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                  {attempt.quiz_type}
                </span>
              </div>

              <div className="text-sm text-gray-600">
                Questions: {attempt.questions?.length || 0}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600">{attempt.total_score}</div>
                <div className="text-sm text-gray-600">Score</div>
              </div>

              <button
                onClick={() => setSelectedAttempt(attempt)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Eye className="w-4 h-4" />
                <span>View</span>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
