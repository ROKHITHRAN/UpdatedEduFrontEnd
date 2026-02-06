import { useEffect, useState } from 'react';
import { MessageSquare, ClipboardList, Award, Clock } from 'lucide-react';
import { Document, Activity } from '../types';
import { storage } from '../utils/storage';

interface DocumentHistoryProps {
  document: Document;
}

export const DocumentHistory = ({ document }: DocumentHistoryProps) => {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    const allActivities = storage.getActivities();
    const docActivities = allActivities
      .filter((a) => a.documentId === document.id)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setActivities(docActivities);
  }, [document.id]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'question':
        return <MessageSquare className="w-5 h-5 text-blue-600" />;
      case 'quiz_generated':
        return <ClipboardList className="w-5 h-5 text-purple-600" />;
      case 'quiz_attempted':
        return <Award className="w-5 h-5 text-green-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getActivityText = (activity: Activity) => {
    switch (activity.type) {
      case 'question':
        return (
          <>
            <span className="font-medium">Asked a question:</span>{' '}
            <span className="text-gray-700">{activity.metadata?.questionText}</span>
          </>
        );
      case 'quiz_generated':
        return <span className="font-medium">Generated a new quiz</span>;
      case 'quiz_attempted':
        return (
          <>
            <span className="font-medium">Completed a quiz</span>{' '}
            <span className="text-green-600 font-semibold">
              (Score: {activity.metadata?.score}%)
            </span>
          </>
        );
      default:
        return <span>Activity recorded</span>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Document Activity History</h3>

      {activities.length === 0 ? (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <Clock className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No activity yet</h3>
          <p className="text-gray-600">
            Ask questions or generate quizzes to see activity here
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 mb-1">{getActivityText(activity)}</p>
                  <p className="text-sm text-gray-500 flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{formatDate(activity.timestamp)}</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
