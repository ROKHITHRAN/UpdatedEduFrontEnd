import { WebsiteChat } from "./WebsiteChat";

export const WebScrapLibrary = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          WebScrap Library
        </h1>
        <p className="text-gray-600">
          Upload and manage your learning documents
        </p>
      </div>
      <WebsiteChat />
    </div>
  );
};
