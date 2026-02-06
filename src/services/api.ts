const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

class ApiService {
  private getAuthHeaders() {
    const token = localStorage.getItem("firebase_token") || "";
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }

  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }

  // Auth endpoints
  async register(email: string, password: string, name: string) {
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    });
  }

  async getProfile() {
    return this.request("/auth/me", { method: "POST" });
  }

  // Document endpoints
  async uploadDocument(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const token = localStorage.getItem("firebase_token") || "";
    return fetch(`${API_BASE_URL}/documents/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    }).then((res) => res.json());
  }

  async getDocuments() {
    return this.request("/documents/");
  }

  async deleteDocument(docId: string) {
    return this.request(`/documents/${docId}`, { method: "DELETE" });
  }

  // Ask questions
  async askQuestion(question: string, docId?: string) {
    return this.request("/question/ask", {
      method: "POST",
      body: JSON.stringify({ question, document_id: docId }),
    });
  }

  // Quiz endpoints
  async generateQuiz(docId: string, numQuestions: number, quiz_type: string) {
    const payload =
      quiz_type === "MCQ"
        ? { document_id: docId, mcq: numQuestions }
        : quiz_type === "SHORT"
          ? { document_id: docId, short: numQuestions }
          : { document_id: docId, long: numQuestions };

    return this.request("/quiz/create", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async getQuizHistory(docId: string) {
    return this.request(`/quiz/history/${docId}`);
  }

  async getQuizAttempts(docId: string) {
    return this.request(`/quiz/attempts/${docId}`);
  }

  async evaluateShortAnswer(
    documentId: string,
    quizId: string,
    questionId: string,
    answer: string,
  ) {
    return this.request("/quiz/evaluate/short", {
      method: "POST",
      body: JSON.stringify({
        document_id: documentId,
        quiz_id: quizId,
        question_id: questionId,
        answer,
      }),
    });
  }

  async evaluateLongAnswer(
    documentId: string,
    quizId: string,
    questionId: string,
    answer: string,
  ) {
    return this.request("/quiz/evaluate/long", {
      method: "POST",
      body: JSON.stringify({
        document_id: documentId,
        quiz_id: quizId,
        question_id: questionId,
        answer,
      }),
    });
  }

  async submitQuiz(payload: any) {
    console.log(payload);

    return this.request("/quiz/submit", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }
}

export const apiService = new ApiService();
