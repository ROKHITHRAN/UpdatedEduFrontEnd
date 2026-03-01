import { BookOpen, LogOut, Library } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

interface HeaderProps {
  currentView: "library" | "document" | "webscrap";
  onNavigate: (view: "library" | "webscrap") => void;
}

export const Header = ({ currentView, onNavigate }: HeaderProps) => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                EduDoc
              </span>
            </div>

            <nav className="flex space-x-1">
              <button
                onClick={() => onNavigate("library")}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  currentView === "library" || currentView === "document"
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Library className="w-4 h-4" />
                <span>Library</span>
              </button>
            </nav>
            <nav className="flex space-x-1">
              <button
                onClick={() => onNavigate("webscrap")}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  currentView === "webscrap"
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Library className="w-4 h-4" />
                <span>WebScrap</span>
              </button>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>

            <button
              onClick={logout}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
