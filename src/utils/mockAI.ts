import { QuizQuestion } from '../types';

export const generateMockAnswer = (question: string, documentName: string): string => {
  const answers = [
    `Based on the content of "${documentName}", ${question.toLowerCase().replace('?', '')} can be explained as follows: This is a comprehensive topic that requires careful consideration of multiple factors and perspectives within the document context.`,
    `According to the document "${documentName}", the answer to your question involves understanding key concepts and their relationships. The document provides detailed insights that help clarify this matter.`,
    `From "${documentName}", we can see that ${question.toLowerCase().replace('?', '')} is addressed through specific examples and explanations that demonstrate the core principles involved.`,
  ];
  return answers[Math.floor(Math.random() * answers.length)];
};

export const generateMockQuiz = (
  documentName: string,
  type: 'mcq' | 'short' | 'long',
  numberOfQuestions: number,
  difficulty: 'easy' | 'medium' | 'hard'
): QuizQuestion[] => {
  const questions: QuizQuestion[] = [];

  const topics = [
    'main concepts',
    'key principles',
    'fundamental theories',
    'important applications',
    'critical analysis',
    'core methodology',
    'essential frameworks',
    'primary objectives',
  ];

  for (let i = 0; i < numberOfQuestions; i++) {
    const topic = topics[i % topics.length];
    const questionId = `q_${Date.now()}_${i}`;

    if (type === 'mcq') {
      questions.push({
        id: questionId,
        question: `What are the ${topic} discussed in "${documentName}"?`,
        type: 'mcq',
        options: [
          `Option A: Detailed explanation of ${topic} with specific examples`,
          `Option B: Alternative perspective on ${topic}`,
          `Option C: Comprehensive overview of ${topic}`,
          `Option D: Critical analysis of ${topic}`,
        ],
        correctAnswer: `Option ${String.fromCharCode(65 + (i % 4))}`,
      });
    } else if (type === 'short') {
      questions.push({
        id: questionId,
        question: `Briefly explain the ${topic} from "${documentName}".`,
        type: 'short',
        correctAnswer: `The ${topic} involve understanding the core elements presented in the document and their practical implications.`,
      });
    } else {
      questions.push({
        id: questionId,
        question: `Provide a detailed analysis of the ${topic} presented in "${documentName}".`,
        type: 'long',
        correctAnswer: `A comprehensive analysis of ${topic} requires examining multiple dimensions including theoretical foundations, practical applications, and critical evaluation of the approaches discussed in the document.`,
      });
    }
  }

  return questions;
};

export const evaluateQuizAnswer = (
  question: QuizQuestion,
  userAnswer: string
): { isCorrect: boolean; feedback: string } => {
  if (question.type === 'mcq') {
    const isCorrect = userAnswer === question.correctAnswer;
    return {
      isCorrect,
      feedback: isCorrect
        ? 'Correct! Your answer matches the expected response.'
        : `Incorrect. The correct answer is: ${question.correctAnswer}`,
    };
  }

  const wordCount = userAnswer.trim().split(/\s+/).length;
  const minWords = question.type === 'short' ? 10 : 50;

  if (wordCount < minWords) {
    return {
      isCorrect: false,
      feedback: `Your answer is too brief. Please provide at least ${minWords} words for a ${question.type} answer.`,
    };
  }

  const hasKeywords = userAnswer.toLowerCase().includes('document') ||
                      userAnswer.toLowerCase().includes('concept') ||
                      userAnswer.length > 20;

  return {
    isCorrect: hasKeywords,
    feedback: hasKeywords
      ? 'Good answer! You have demonstrated understanding of the topic.'
      : 'Your answer could be more detailed. Try to reference specific concepts from the document.',
  };
};
