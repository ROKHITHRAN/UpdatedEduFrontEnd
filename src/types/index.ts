export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Document {
  id: string;
  name: string;
  uploadDate: string;
  fileData: string;
}

export interface Question {
  id: string;
  documentId: string;
  question: string;
  answer: string;
  timestamp: string;
  pages: number[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: "mcq" | "short" | "long";
  options?: string[];
  correct_answer?: string;
}

export interface Quiz {
  id: string;
  documentId: string;
  documentName: string;
  type: "mcq" | "short" | "long";
  difficulty: "easy" | "medium" | "hard";
  numberOfQuestions: number;
  questions: QuizQuestion[];
  generatedDate: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  documentId: string;
  documentName: string;
  userAnswers: { [questionId: string]: string };
  score: number;
  feedback: { [questionId: string]: string };
  attemptDate: string;
}

export type ActivityType = "question" | "quiz_generated" | "quiz_attempted";

export interface Activity {
  id: string;
  documentId: string;
  documentName: string;
  type: ActivityType;
  timestamp: string;
  metadata?: {
    score?: number;
    questionText?: string;
  };
}
