import { useState } from "react";
import { ArrowLeft, CheckCircle, XCircle, Loader } from "lucide-react";
import { apiService } from "../services/api";

interface QuizTakeProps {
  quiz: any;
  documentId: string;
  onBack: () => void;
  onComplete?: () => void;
}

export const QuizTake = ({
  quiz,
  documentId,
  onBack,
  onComplete,
}: QuizTakeProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const questions = quiz.questions || [];
  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const isMCQ = currentQuestion?.type === "MCQ";
  const isShort = currentQuestion?.type === "SHORT";
  const isLong = currentQuestion?.type === "LONG";

  const handleAnswerSelect = (optionText: string) => {
    if (!isEvaluating) {
      setSelectedAnswer(optionText);
    }
  };

  const handleNext = async () => {
    if (!selectedAnswer.trim()) return;

    setIsEvaluating(true);

    try {
      let evaluation: any = {};

      if (isMCQ) {
        // MCQ - instant evaluation
        const isCorrect = selectedAnswer === currentQuestion.correct_answer;
        evaluation = {
          question_id: currentQuestion.question_id,
          user_answer: selectedAnswer,
          score: isCorrect ? 1 : 0,
          max_score: 1,
          remarks: isCorrect ? "Correct!" : "Incorrect",
          reference_pages: currentQuestion.reference_pages || [],
        };
      } else if (isShort) {
        // SHORT - call evaluate API
        evaluation = await apiService.evaluateShortAnswer(
          documentId,
          quiz.quiz_id || quiz.id,
          currentQuestion.question_id,
          selectedAnswer,
        );
        evaluation.user_answer = selectedAnswer;
      } else if (isLong) {
        // LONG - call evaluate API
        evaluation = await apiService.evaluateLongAnswer(
          documentId,
          quiz.quiz_id || quiz.id,
          currentQuestion.question_id,
          selectedAnswer,
        );
        evaluation.user_answer = selectedAnswer;
      }

      const newEvaluations = [...evaluations, evaluation];
      setEvaluations(newEvaluations);

      if (isLastQuestion) {
        // Submit quiz to backend
        await submitQuizToBackend(newEvaluations);
        setShowResults(true);
      } else {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer("");
      }
    } catch (error) {
      console.error("Evaluation failed:", error);
      alert("Failed to evaluate answer. Please try again.");
    } finally {
      setIsEvaluating(false);
    }
  };

  const submitQuizToBackend = async (allEvaluations: any[]) => {
    try {
      const totalScore = allEvaluations.reduce(
        (sum, e) => sum + (e.score || 0),
        0,
      );

      const questionsData = questions.map((q: any, index: number) => {
        const evaluation = allEvaluations[index];
        return {
          question_id: q.question_id,
          type: q.type,
          question: q.question,
          options: q.options,
          correct_answer: q.correct_answer,
          reference_pages: q.reference_pages || [],
          user_answer: evaluation.user_answer || "",
          is_correct: evaluation.score === evaluation.max_score,
          score: evaluation.score,
          feedback: evaluation.remarks || "",
        };
      });

      await apiService.submitQuiz({
        attempt_id: `attempt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        quiz_id: quiz.quiz_id || quiz.id,
        document_id: documentId,
        document_name: quiz.document_name || "Document",
        questions: questionsData,
        score: totalScore,
        attempt_date: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Failed to submit quiz:", error);
      throw error;
    }
  };

  const calculateTotalScore = () => {
    return evaluations.reduce((sum, e) => sum + (e.score || 0), 0);
  };

  const calculateMaxScore = () => {
    return evaluations.length * evaluations[0].max_score;
  };

  if (showResults) {
    const totalScore = calculateTotalScore();
    const maxScore = calculateMaxScore();

    return (
      <div className="space-y-6">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Quizzes</span>
        </button>

        <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-8 text-center border border-green-200">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Quiz Completed!
          </h2>
          <p className="text-5xl font-bold text-green-600 my-4">
            {totalScore} / {maxScore}
          </p>
          <p className="text-gray-600">
            You scored {Math.round((totalScore / maxScore) * 100)}%
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-900">Review Answers</h3>
          {questions.map((q: any, index: number) => {
            const evaluation = evaluations[index];
            const isCorrect = evaluation?.score === evaluation?.max_score;

            return (
              <div
                key={index}
                className="bg-white rounded-xl border border-gray-200 p-6"
              >
                <div className="flex items-start space-x-3 mb-4">
                  {isCorrect ? (
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                  )}
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 mb-3">
                      {index + 1}. {q.question}
                    </p>

                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        Your Answer:
                      </p>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                        {evaluation?.user_answer}
                      </p>
                    </div>

                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        Score:
                      </p>
                      <p className="text-lg font-bold text-blue-600">
                        {evaluation?.score} / {evaluation?.max_score}
                      </p>
                    </div>

                    {evaluation?.remarks && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          Feedback:
                        </p>
                        <p className="text-gray-700 bg-blue-50 p-3 rounded-lg">
                          {evaluation.remarks}
                        </p>
                      </div>
                    )}

                    {evaluation?.reference_pages &&
                      evaluation.reference_pages.length > 0 && (
                        <p className="text-sm text-gray-600">
                          📄 Reference: Page{" "}
                          {evaluation.reference_pages.join(", ")}
                        </p>
                      )}
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
        <span>Back to Quizzes</span>
      </button>

      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-600">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
              {currentQuestion?.type}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all"
              style={{
                width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
              }}
            ></div>
          </div>
        </div>

        <h3 className="text-2xl font-bold text-gray-900 mb-6">
          {currentQuestion?.question}
        </h3>

        {isMCQ && (
          <div className="space-y-3 mb-8">
            {currentQuestion?.options?.map((option: any, index: number) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(option.text)}
                disabled={isEvaluating}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  selectedAnswer === option.text
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                } ${isEvaluating ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <span className="font-semibold text-gray-900">
                  {String.fromCharCode(65 + index)}.
                </span>{" "}
                <span className="text-gray-900">{option.text}</span>
              </button>
            ))}
          </div>
        )}

        {(isShort || isLong) && (
          <div className="mb-8">
            <textarea
              value={selectedAnswer}
              onChange={(e) => setSelectedAnswer(e.target.value)}
              disabled={isEvaluating}
              placeholder="Type your answer here..."
              rows={isLong ? 8 : 4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
            />
          </div>
        )}

        <button
          onClick={handleNext}
          disabled={!selectedAnswer.trim() || isEvaluating}
          className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isEvaluating ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              <span>Evaluating...</span>
            </>
          ) : (
            <span>{isLastQuestion ? "Submit Quiz" : "Next Question"}</span>
          )}
        </button>
      </div>
    </div>
  );
};
