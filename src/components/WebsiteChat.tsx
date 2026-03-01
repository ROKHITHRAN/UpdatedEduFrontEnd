// import { useState, useEffect } from "react";
// import { Send, User, Bot, Globe } from "lucide-react";
// import { apiService } from "../services/api";
// import HTMLRenderer from "../utils/HTMLRenderer";

// interface WebsiteQuestion {
//   id: string;
//   question: string;
//   answer: string;
//   timestamp: string;
//   sections?: string[];
// }

// export const WebsiteChat = () => {
//   const [url, setUrl] = useState("");
//   const [websiteId, setWebsiteId] = useState<string | null>(null);
//   const [questions, setQuestions] = useState<WebsiteQuestion[]>([]);
//   const [inputValue, setInputValue] = useState("");
//   const [isEmbedding, setIsEmbedding] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);

//   // Load stored website_id on mount
//   useEffect(() => {
//     const storedId = localStorage.getItem("website_id");
//     if (storedId) setWebsiteId(storedId);
//   }, []);

//   // ================= EMBED WEBSITE =================
//   const handleEmbed = async () => {
//     if (!url.trim()) return;

//     try {
//       setIsEmbedding(true);

//       const response = await apiService.embedWebsite(url.trim());

//       localStorage.setItem("website_id", response.website_id);
//       setWebsiteId(response.website_id);

//       // Clear previous questions
//       setQuestions([]);

//       alert("Website embedded successfully!");
//     } catch (error) {
//       console.error("Embedding failed:", error);
//       alert("Failed to embed website.");
//     } finally {
//       setIsEmbedding(false);
//     }
//   };

//   // ================= ASK QUESTION =================
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!inputValue.trim() || !websiteId) return;

//     const userQuestion = inputValue.trim();
//     setInputValue("");
//     setIsLoading(true);

//     try {
//       const response = await apiService.askWebsiteQuestion(
//         websiteId,
//         userQuestion,
//       );

//       const newQuestion: WebsiteQuestion = {
//         id: `wq_${Date.now()}`,
//         question: userQuestion,
//         answer: response.answer,
//         timestamp: new Date().toISOString(),
//         sections: response.sections,
//       };

//       setQuestions((prev) => [...prev, newQuestion]);
//     } catch (error) {
//       console.error("Failed to get answer:", error);
//       alert("Failed to get answer.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="flex flex-col h-[650px] bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
//       {/* ================= URL INPUT ================= */}
//       <div className="mb-6">
//         <div className="flex items-center space-x-3 mb-2">
//           <Globe className="w-6 h-6 text-blue-600" />
//           <h2 className="text-lg font-semibold text-gray-900">Embed Website</h2>
//         </div>

//         <div className="flex space-x-3">
//           <input
//             type="text"
//             placeholder="Enter website URL (https://...)"
//             value={url}
//             onChange={(e) => setUrl(e.target.value)}
//             className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
//           />
//           <button
//             onClick={handleEmbed}
//             disabled={isEmbedding}
//             className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
//           >
//             {isEmbedding ? "Embedding..." : "Embed"}
//           </button>
//         </div>

//         {websiteId && (
//           <p className="text-xs text-green-600 mt-2">
//             Website embedded and ready for questions.
//           </p>
//         )}
//       </div>

//       {/* ================= CHAT SECTION ================= */}
//       <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
//         {questions.length === 0 && websiteId && !isLoading && (
//           <div className="text-center py-16">
//             <Bot className="w-10 h-10 text-blue-600 mx-auto mb-4" />
//             <p className="text-gray-600">
//               Ask questions about the embedded website
//             </p>
//           </div>
//         )}

//         {questions.map((q) => (
//           <div key={q.id} className="space-y-4">
//             {/* USER MESSAGE */}
//             <div className="flex items-start space-x-3">
//               <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
//                 <User className="w-5 h-5 text-white" />
//               </div>
//               <div className="flex-1 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl rounded-tl-none px-4 py-3">
//                 {q.question}
//               </div>
//             </div>

//             {/* BOT MESSAGE */}
//             <div className="flex items-start space-x-3">
//               <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-teal-500 rounded-full flex items-center justify-center">
//                 <Bot className="w-5 h-5 text-white" />
//               </div>
//               <div className="flex-1 bg-white border border-gray-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
//                 <HTMLRenderer answer={q.answer} />
//                 <div className="flex justify-between text-xs text-gray-500 mt-2">
//                   <span>{new Date(q.timestamp).toLocaleTimeString()}</span>
//                   {q.sections && <span>Sections: {q.sections.join(", ")}</span>}
//                 </div>
//               </div>
//             </div>
//           </div>
//         ))}

//         {isLoading && (
//           <div className="flex items-start space-x-3">
//             <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center">
//               <Bot className="w-5 h-5 text-white" />
//             </div>
//             <div className="bg-white border rounded-2xl px-4 py-3 shadow-sm">
//               Thinking...
//             </div>
//           </div>
//         )}
//       </div>

//       {/* ================= ASK INPUT ================= */}
//       {websiteId && (
//         <form onSubmit={handleSubmit} className="flex space-x-3">
//           <input
//             type="text"
//             value={inputValue}
//             onChange={(e) => setInputValue(e.target.value)}
//             placeholder="Ask a question about this website..."
//             className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
//             disabled={isLoading}
//           />
//           <button
//             type="submit"
//             disabled={isLoading || !inputValue.trim()}
//             className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 flex items-center space-x-2"
//           >
//             <Send className="w-5 h-5" />
//             <span>Send</span>
//           </button>
//         </form>
//       )}
//     </div>
//   );
// };

import { useState, useEffect } from "react";
import { Send, User, Bot, Globe } from "lucide-react";
import { apiService } from "../services/api";
import HTMLRenderer from "../utils/HTMLRenderer";

interface WebsiteQuestion {
  id: string;
  question: string;
  answer: string;
  timestamp: string;
  sections?: string[];
}

interface WebsiteStorage {
  website_id: string;
  questions: WebsiteQuestion[];
}

export const WebsiteChat = () => {
  const [url, setUrl] = useState("");
  const [websiteId, setWebsiteId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<WebsiteQuestion[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isEmbedding, setIsEmbedding] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // ================= LOAD FROM LOCAL STORAGE =================
  useEffect(() => {
    const stored = localStorage.getItem("website_data");
    if (stored) {
      const parsed: WebsiteStorage = JSON.parse(stored);
      setWebsiteId(parsed.website_id);
      setQuestions(parsed.questions || []);
    }
  }, []);

  // ================= EMBED WEBSITE =================
  const handleEmbed = async () => {
    if (!url.trim()) return;

    try {
      setIsEmbedding(true);

      const response = await apiService.embedWebsite(url.trim());

      const newStorage: WebsiteStorage = {
        website_id: response.website_id,
        questions: [], // clear old questions
      };

      localStorage.setItem("website_data", JSON.stringify(newStorage));

      setWebsiteId(response.website_id);
      setQuestions([]);

      alert("Website embedded successfully!");
    } catch (error) {
      console.error("Embedding failed:", error);
      alert("Failed to embed website.");
    } finally {
      setIsEmbedding(false);
    }
  };

  // ================= ASK QUESTION =================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !websiteId) return;

    const userQuestion = inputValue.trim();
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await apiService.askWebsiteQuestion(
        websiteId,
        userQuestion,
      );

      const newQuestion: WebsiteQuestion = {
        id: `wq_${Date.now()}`,
        question: userQuestion,
        answer: response.answer,
        timestamp: new Date().toISOString(),
        sections: response.sections,
      };

      const updatedQuestions = [...questions, newQuestion];

      setQuestions(updatedQuestions);

      // ✅ Save updated questions to localStorage
      localStorage.setItem(
        "website_data",
        JSON.stringify({
          website_id: websiteId,
          questions: updatedQuestions,
        }),
      );
    } catch (error) {
      console.error("Failed to get answer:", error);
      alert("Failed to get answer.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[650px] bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      {/* ================= URL INPUT ================= */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <Globe className="w-6 h-6 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Embed Website</h2>
        </div>

        <div className="flex space-x-3">
          <input
            type="text"
            placeholder="Enter website URL (https://...)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <button
            onClick={handleEmbed}
            disabled={isEmbedding}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
          >
            {isEmbedding ? "Embedding..." : "Embed"}
          </button>
        </div>

        {websiteId && (
          <p className="text-xs text-green-600 mt-2">
            Website embedded and ready for questions.
          </p>
        )}
      </div>

      {/* ================= CHAT ================= */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
        {questions.length === 0 && websiteId && !isLoading && (
          <div className="text-center py-16">
            <Bot className="w-10 h-10 text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">
              Ask questions about the embedded website
            </p>
          </div>
        )}

        {questions.map((q) => (
          <div key={q.id} className="space-y-4">
            {/* USER */}
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl rounded-tl-none px-4 py-3">
                {q.question}
              </div>
            </div>

            {/* BOT */}
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-teal-500 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 bg-white border border-gray-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                <HTMLRenderer answer={q.answer} />
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>{new Date(q.timestamp).toLocaleTimeString()}</span>
                  {q.sections && <span>Sections: {q.sections.join(", ")}</span>}
                </div>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="bg-white border rounded-2xl px-4 py-3 shadow-sm">
              Thinking...
            </div>
          </div>
        )}
      </div>

      {/* ================= ASK INPUT ================= */}
      {websiteId && (
        <form onSubmit={handleSubmit} className="flex space-x-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask a question about this website..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 flex items-center space-x-2"
          >
            <Send className="w-5 h-5" />
            <span>Send</span>
          </button>
        </form>
      )}
    </div>
  );
};
