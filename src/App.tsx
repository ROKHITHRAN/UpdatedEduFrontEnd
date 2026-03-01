import { useState } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Login } from "./components/Login";
import { Header } from "./components/Header";
import { DocumentLibrary } from "./components/DocumentLibrary";
import { DocumentWorkspace } from "./components/DocumentWorkspace";
import { Document } from "./types";
import { WebScrapLibrary, WebScrapWorkspace } from "./components/WebScrap";

type View = "library" | "document" | "webscrap";

function AppContent() {
  const { user, isLoading } = useAuth();
  const [currentView, setCurrentView] = useState<View>("library");
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null,
  );

  const handleDocumentSelect = (document: Document) => {
    setSelectedDocument(document);
    setCurrentView("document");
  };

  const handleNavigate = (view: "library" | "webscrap") => {
    setCurrentView(view);
    setSelectedDocument(null);
  };

  const handleBackToLibrary = () => {
    setSelectedDocument(null);
    setCurrentView("library");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }
  console.log(currentView);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <Header currentView={currentView} onNavigate={handleNavigate} />

      {currentView === "library" && (
        <DocumentLibrary onDocumentSelect={handleDocumentSelect} />
      )}

      {currentView === "document" && selectedDocument && (
        <DocumentWorkspace
          document={selectedDocument}
          onBack={handleBackToLibrary}
        />
      )}

      {currentView === "webscrap" && <WebScrapLibrary />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
