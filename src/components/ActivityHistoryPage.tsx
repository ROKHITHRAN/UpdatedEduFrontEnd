import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { Clock, Calendar, Award, FileText } from 'lucide-react';

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
    reference_page?: number[];
    score?: number;
  }>;
  attempt_date: string;
  created_at: any;
}

export const ActivityHistoryPage = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [allAttempts, setAllAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAllAttempts();
  }, []);

  const loadAllAttempts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const docs = await apiService.getDocuments();
      setDocuments(docs);
      
      const attemptsPromises = docs.map((doc: any) => 
        apiService.getQuizAttempts(doc.document_id).catch(() => [])
      );
      
      const attemptsArrays = await Promise.all(attemptsPromises);
      const combined = attemptsArrays.flat();
      
      const sorted = combined.sort((a: QuizAttempt, b: QuizAttempt) => 
        new Date(b.attempt_date).getTime() - new Date(a.attempt_date).getTime()
      );
      
      setAllAttempts(sorted);
    } catch (err) {
      setError('Failed to load activity history');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getTotalQuestions = (questions: any[]) => {
    return questions.length;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Activity History</h1>
          <p className="text-gray-600">View all your quiz attempts and scores</p>
        </div>

        {allAttempts.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Quiz Attempts Yet</h3>
            <p className="text-gray-600">Complete a quiz to see your attempt history here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {allAttempts.map((attempt) => {
              const totalQuestions = getTotalQuestions(attempt.questions);
              
              return (
                <div 
                  key={attempt.id} 
                  className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <h3 className="text-lg font-semibold text-gray-900">
                          {attempt.document_name}
                        </h3>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
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
                        <span className="font-medium">Questions:</span> {totalQuestions}
                      </div>
                    </div>

                    <div className="text-right ml-6">
                      <div className="text-3xl font-bold text-blue-600">
                        {attempt.total_score}
                      </div>
                      <div className="text-sm text-gray-600">Score</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
