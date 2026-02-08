import { useState, useEffect } from "react";
import { Send, User, Bot } from "lucide-react";
import { Document, Question } from "../types";
import { apiService } from "../services/api";
import HTMLRenderer from "../utils/HTMLRenderer";

interface AskQuestionsProps {
  document: Document;
}

export const AskQuestions = ({ document }: AskQuestionsProps) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load questions from local storage for now
    // TODO: Implement API endpoint for getting questions by document
    const allQuestions = JSON.parse(localStorage.getItem("questions") || "[]");
    const docQuestions = allQuestions.filter(
      (q: Question) => q.documentId === document.id,
    );
    setQuestions(docQuestions);
  }, [document.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userQuestion = inputValue.trim();
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await apiService.askQuestion(userQuestion, document.id);
      const newQuestion: Question = {
        id: `q_${Date.now()}`,
        documentId: document.id,
        question: userQuestion,
        answer: response.answer || response.message,
        timestamp: new Date().toISOString(),
        pages: response.pages,
      };

      // Save to local storage for now
      const allQuestions = JSON.parse(
        localStorage.getItem("questions") || "[]",
      );
      allQuestions.push(newQuestion);
      localStorage.setItem("questions", JSON.stringify(allQuestions));

      setQuestions([...questions, newQuestion]);
    } catch (error) {
      console.error("Failed to get answer:", error);
      alert("Failed to get answer. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  console.log(questions);

  return (
    <div className="flex flex-col h-[600px]">
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
        {questions.length === 0 && !isLoading && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full mb-4">
              <Bot className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Ask questions about this document
            </h3>
            <p className="text-gray-600">
              Type your question below and get instant answers
            </p>
          </div>
        )}

        {questions.map((q) => (
          <div key={q.id} className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl rounded-tl-none px-4 py-3">
                <p className="text-gray-900">{q.question}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-green-400 to-teal-500 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1  bg-white border border-gray-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                <HTMLRenderer answer={q.answer} />
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <p>
                    {new Date(q.timestamp).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <p>{`Ref Page : ${q.pages.map((pg) => pg)}`}</p>
                </div>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-green-400 to-teal-500 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 bg-white border border-gray-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.4s" }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex space-x-3">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={`Ask a question about "${document.name}"...`}
          className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !inputValue.trim()}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          <Send className="w-5 h-5" />
          <span>Send</span>
        </button>
      </form>
    </div>
  );
};
