import { useState, useEffect } from "react";
import { Sparkles, Play, ChevronLeft, ChevronRight } from "lucide-react";
import { Document, Quiz } from "../types";
import { apiService } from "../services/api";
import { QuizTake } from "./QuizTake";

interface QuizGeneratorProps {
  document: Document;
}

export const QuizGenerator = ({ document }: QuizGeneratorProps) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [quizType, setQuizType] = useState<"mcq" | "short" | "long">("mcq");
  const [numberOfQuestions, setNumberOfQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "medium",
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  console.log(quizType);

  useEffect(() => {
    loadQuizzes();
  }, [document.id]);

  const loadQuizzes = async () => {
    try {
      const quizHistory = await apiService.getQuizHistory(document.id);
      const transformedQuizzes = quizHistory.map((q: any) => ({
        id: q.id || q.quiz_id,
        documentId: document.id,
        documentName: document.name,
        type: q.quiz_type?.toLowerCase() || "mcq",
        difficulty: "medium",
        numberOfQuestions: q.questions?.length || 0,
        questions: q.questions || [],
        generatedDate: q.created_at || new Date().toISOString(),
        status: q.status,
      }));
      const sortedQuizzes = transformedQuizzes.sort(
        (a: any, b: any) =>
          new Date(b.generatedDate).getTime() -
          new Date(a.generatedDate).getTime(),
      );
      setQuizzes(sortedQuizzes);
    } catch (error) {
      console.error("Failed to load quizzes:", error);
    }
  };

  const handleGenerateQuiz = async () => {
    setIsGenerating(true);

    try {
      console.log("Clicked");

      const response = await apiService.generateQuiz(
        document.id,
        numberOfQuestions,
        quizType,
      );
      console.log("Comp", response);

      await loadQuizzes(); // Reload quizzes from Firebase
    } catch (error) {
      console.error("Failed to generate quiz:", error);
      alert("Failed to generate quiz. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (selectedQuiz) {
    return (
      <QuizTake
        quiz={selectedQuiz}
        documentId={document.id}
        onBack={() => setSelectedQuiz(null)}
        onComplete={() => {
          loadQuizzes();
          setSelectedQuiz(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
          <Sparkles className="w-6 h-6 text-purple-600" />
          <span>Generate New Quiz</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quiz Type
            </label>
            <select
              value={quizType}
              onChange={(e) =>
                setQuizType(e.target.value as "mcq" | "short" | "long")
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="mcq">Multiple Choice</option>
              <option value="short">Short Answer</option>
              <option value="long">Long Answer</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Questions
            </label>
            <input
              type="number"
              min="1"
              max="20"
              value={numberOfQuestions}
              onChange={(e) => setNumberOfQuestions(parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Difficulty Level
            </label>
            <select
              value={difficulty}
              onChange={(e) =>
                setDifficulty(e.target.value as "easy" | "medium" | "hard")
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleGenerateQuiz}
          disabled={isGenerating}
          className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Generating Quiz...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Generate Quiz</span>
            </>
          )}
        </button>
      </div>

      {quizzes.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Generated Quizzes
          </h3>
          <div className="space-y-4">
            {quizzes
              .slice(
                (currentPage - 1) * itemsPerPage,
                currentPage * itemsPerPage,
              )
              .map((quiz) => (
                <div
                  key={quiz.id}
                  className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                          {quiz.type === "mcq"
                            ? "Multiple Choice"
                            : quiz.type === "short"
                              ? "Short Answer"
                              : "Long Answer"}
                        </span>
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full capitalize">
                          {quiz.difficulty}
                        </span>
                      </div>
                      <p className="text-gray-900 font-medium">
                        {quiz.numberOfQuestions} Questions
                      </p>
                      <p className="text-sm text-gray-500">
                        Generated on{" "}
                        {new Date(quiz.generatedDate).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </p>
                    </div>

                    <button
                      onClick={() => setSelectedQuiz(quiz)}
                      className="px-6 py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl flex items-center space-x-2"
                    >
                      <Play className="w-5 h-5" />
                      <span>
                        {quiz.status === "RETAKE" ? "Retake Quiz" : "Take Quiz"}
                      </span>
                    </button>
                  </div>
                </div>
              ))}
          </div>
          {quizzes.length > itemsPerPage && (
            <div className="flex items-center justify-center space-x-4 mt-6">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {Math.ceil(quizzes.length / itemsPerPage)}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((p) =>
                    Math.min(Math.ceil(quizzes.length / itemsPerPage), p + 1),
                  )
                }
                disabled={
                  currentPage === Math.ceil(quizzes.length / itemsPerPage)
                }
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
