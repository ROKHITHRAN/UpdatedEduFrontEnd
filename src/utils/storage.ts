import { User, Document, Question, Quiz, QuizAttempt, Activity } from '../types';

const KEYS = {
  USER: 'edu_app_user',
  DOCUMENTS: 'edu_app_documents',
  QUESTIONS: 'edu_app_questions',
  QUIZZES: 'edu_app_quizzes',
  QUIZ_ATTEMPTS: 'edu_app_quiz_attempts',
  ACTIVITIES: 'edu_app_activities',
};

export const storage = {
  getUser: (): User | null => {
    const data = localStorage.getItem(KEYS.USER);
    return data ? JSON.parse(data) : null;
  },

  setUser: (user: User) => {
    localStorage.setItem(KEYS.USER, JSON.stringify(user));
  },

  clearUser: () => {
    localStorage.removeItem(KEYS.USER);
  },

  getDocuments: (): Document[] => {
    const data = localStorage.getItem(KEYS.DOCUMENTS);
    return data ? JSON.parse(data) : [];
  },

  saveDocument: (document: Document) => {
    const documents = storage.getDocuments();
    documents.push(document);
    localStorage.setItem(KEYS.DOCUMENTS, JSON.stringify(documents));
  },

  deleteDocument: (documentId: string) => {
    const documents = storage.getDocuments().filter(d => d.id !== documentId);
    localStorage.setItem(KEYS.DOCUMENTS, JSON.stringify(documents));

    const questions = storage.getQuestions().filter(q => q.documentId !== documentId);
    localStorage.setItem(KEYS.QUESTIONS, JSON.stringify(questions));

    const quizzes = storage.getQuizzes().filter(q => q.documentId !== documentId);
    localStorage.setItem(KEYS.QUIZZES, JSON.stringify(quizzes));

    const attempts = storage.getQuizAttempts().filter(a => a.documentId !== documentId);
    localStorage.setItem(KEYS.QUIZ_ATTEMPTS, JSON.stringify(attempts));

    const activities = storage.getActivities().filter(a => a.documentId !== documentId);
    localStorage.setItem(KEYS.ACTIVITIES, JSON.stringify(activities));
  },

  getQuestions: (): Question[] => {
    const data = localStorage.getItem(KEYS.QUESTIONS);
    return data ? JSON.parse(data) : [];
  },

  saveQuestion: (question: Question) => {
    const questions = storage.getQuestions();
    questions.push(question);
    localStorage.setItem(KEYS.QUESTIONS, JSON.stringify(questions));
  },

  getQuizzes: (): Quiz[] => {
    const data = localStorage.getItem(KEYS.QUIZZES);
    return data ? JSON.parse(data) : [];
  },

  saveQuiz: (quiz: Quiz) => {
    const quizzes = storage.getQuizzes();
    quizzes.push(quiz);
    localStorage.setItem(KEYS.QUIZZES, JSON.stringify(quizzes));
  },

  getQuizAttempts: (): QuizAttempt[] => {
    const data = localStorage.getItem(KEYS.QUIZ_ATTEMPTS);
    return data ? JSON.parse(data) : [];
  },

  saveQuizAttempt: (attempt: QuizAttempt) => {
    const attempts = storage.getQuizAttempts();
    attempts.push(attempt);
    localStorage.setItem(KEYS.QUIZ_ATTEMPTS, JSON.stringify(attempts));
  },

  getActivities: (): Activity[] => {
    const data = localStorage.getItem(KEYS.ACTIVITIES);
    return data ? JSON.parse(data) : [];
  },

  addActivity: (activity: Activity) => {
    const activities = storage.getActivities();
    activities.push(activity);
    localStorage.setItem(KEYS.ACTIVITIES, JSON.stringify(activities));
  },
};
