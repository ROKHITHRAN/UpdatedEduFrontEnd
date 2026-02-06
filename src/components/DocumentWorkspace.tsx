import { useState } from 'react';
import { ArrowLeft, MessageSquare, ClipboardList, Clock } from 'lucide-react';
import { Document } from '../types';
import { AskQuestions } from './AskQuestions';
import { QuizGenerator } from './QuizGenerator';
import { ActivityHistory } from './ActivityHistory';

interface DocumentWorkspaceProps {
  document: Document;
  onBack: () => void;
}

type Tab = 'questions' | 'quiz' | 'history';

export const DocumentWorkspace = ({ document, onBack }: DocumentWorkspaceProps) => {
  const [activeTab, setActiveTab] = useState<Tab>('questions');

  const tabs = [
    { id: 'questions' as Tab, label: 'Ask Questions', icon: MessageSquare },
    { id: 'quiz' as Tab, label: 'Quiz Generator', icon: ClipboardList },
    { id: 'history' as Tab, label: 'Activity History', icon: Clock },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Library</span>
        </button>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
            <h1 className="text-2xl font-bold text-white mb-2">{document.name}</h1>
            <p className="text-blue-100">
              Uploaded on {new Date(document.uploadDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>

          <div className="border-b border-gray-200">
            <nav className="flex space-x-1 px-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-6 py-4 font-medium border-b-2 transition-all ${
                      activeTab === tab.id
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-8">
            {activeTab === 'questions' && <AskQuestions document={document} />}
            {activeTab === 'quiz' && <QuizGenerator document={document} />}
            {activeTab === 'history' && <ActivityHistory documentId={document.id} />}
          </div>
        </div>
      </div>
    </div>
  );
};
