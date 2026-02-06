import { useState, useEffect } from 'react';
import { apiService } from '../services/api';

// Example component showing how to use the API service
export const ApiExample = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);

  // Example: Load documents
  const loadDocuments = async () => {
    setLoading(true);
    try {
      const docs = await apiService.getDocuments();
      setDocuments(docs);
    } catch (error) {
      console.error('Failed to load documents:', error);
    } finally {
      setLoading(false);
    }
  };

  // Example: Upload document
  const handleFileUpload = async (file: File) => {
    try {
      const result = await apiService.uploadDocument(file);
      console.log('Upload successful:', result);
      await loadDocuments(); // Refresh list
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  // Example: Ask question
  const askQuestion = async (question: string, docId?: string) => {
    try {
      const response = await apiService.askQuestion(question, docId);
      console.log('Answer:', response);
    } catch (error) {
      console.error('Question failed:', error);
    }
  };

  // Example: Generate quiz
  const generateQuiz = async (docId: string) => {
    try {
      const quiz = await apiService.generateQuiz(docId, 5);
      console.log('Quiz generated:', quiz);
    } catch (error) {
      console.error('Quiz generation failed:', error);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">API Service Examples</h2>
      
      {/* Document Upload Example */}
      <div className="mb-4">
        <input
          type="file"
          accept=".pdf"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileUpload(file);
          }}
        />
      </div>

      {/* Documents List */}
      <div className="mb-4">
        <h3 className="font-semibold">Documents:</h3>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <ul>
            {documents.map((doc: any) => (
              <li key={doc.id} className="border p-2 mb-2">
                <p>{doc.name}</p>
                <button
                  onClick={() => askQuestion("What is this document about?", doc.id)}
                  className="bg-blue-500 text-white px-2 py-1 rounded mr-2"
                >
                  Ask Question
                </button>
                <button
                  onClick={() => generateQuiz(doc.id)}
                  className="bg-green-500 text-white px-2 py-1 rounded"
                >
                  Generate Quiz
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};