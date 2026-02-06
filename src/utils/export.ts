import { Quiz, QuizAttempt, Question } from '../types';

export const downloadQuizQuestions = (quiz: Quiz) => {
  let content = `Quiz Questions\n`;
  content += `Document: ${quiz.documentName}\n`;
  content += `Type: ${quiz.type}\n`;
  content += `Difficulty: ${quiz.difficulty}\n`;
  content += `Generated: ${new Date(quiz.generatedDate).toLocaleString()}\n`;
  content += `\n${'='.repeat(50)}\n\n`;

  quiz.questions.forEach((q, index) => {
    content += `Question ${index + 1}:\n${q.question}\n\n`;

    if (q.type === 'mcq' && q.options) {
      content += `Options:\n`;
      q.options.forEach((option) => {
        content += `  ${option}\n`;
      });
      content += `\nCorrect Answer: ${q.correctAnswer}\n`;
    } else {
      content += `Expected Answer:\n${q.correctAnswer || 'Open-ended question'}\n`;
    }

    content += `\n${'-'.repeat(50)}\n\n`;
  });

  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `quiz_${quiz.documentName}_${Date.now()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
};

export const downloadQuizResults = (quiz: Quiz, attempt: QuizAttempt) => {
  let content = `Quiz Results\n`;
  content += `Document: ${quiz.documentName}\n`;
  content += `Quiz Type: ${quiz.type}\n`;
  content += `Completed: ${new Date(attempt.attemptDate).toLocaleString()}\n`;
  content += `Score: ${attempt.score}%\n`;
  content += `\n${'='.repeat(50)}\n\n`;

  quiz.questions.forEach((q, index) => {
    content += `Question ${index + 1}:\n${q.question}\n\n`;
    content += `Your Answer:\n${attempt.userAnswers[q.id] || 'No answer provided'}\n\n`;

    if (q.correctAnswer) {
      content += `Expected Answer:\n${q.correctAnswer}\n\n`;
    }

    content += `Feedback:\n${attempt.feedback[q.id]}\n`;
    content += `\n${'-'.repeat(50)}\n\n`;
  });

  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `quiz_results_${quiz.documentName}_${Date.now()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
};

export const downloadQAHistory = (questions: Question[], documentName: string) => {
  let content = `Q&A History\n`;
  content += `Document: ${documentName}\n`;
  content += `Total Questions: ${questions.length}\n`;
  content += `\n${'='.repeat(50)}\n\n`;

  questions.forEach((q, index) => {
    content += `Q${index + 1} [${new Date(q.timestamp).toLocaleString()}]:\n`;
    content += `${q.question}\n\n`;
    content += `Answer:\n${q.answer}\n`;
    content += `\n${'-'.repeat(50)}\n\n`;
  });

  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `qa_history_${documentName}_${Date.now()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
};
