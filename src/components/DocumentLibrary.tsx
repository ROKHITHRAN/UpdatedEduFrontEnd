import { useState, useEffect } from 'react';
import { Upload, FileText, Trash2, Download, FolderOpen } from 'lucide-react';
import { Document } from '../types';
import { apiService } from '../services/api';

interface DocumentLibraryProps {
  onDocumentSelect: (document: Document) => void;
}

export const DocumentLibrary = ({ onDocumentSelect }: DocumentLibraryProps) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      console.log('Loading documents from API...');
      const docs = await apiService.getDocuments();
      console.log('API response:', docs);
      // Transform backend data to match frontend Document type
      const transformedDocs = docs.map((doc: any) => ({
        id: doc.document_id || doc.id,
        name: doc.file_name || doc.name,
        uploadDate: doc.created_at || new Date().toISOString(),
        fileData: doc.pdf_url || '',
      }));
      console.log('Transformed docs:', transformedDocs);
      setDocuments(transformedDocs);
    } catch (error) {
      console.error('Failed to load documents:', error);
      // If API fails, show empty list instead of localStorage data
      setDocuments([]);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file');
      return;
    }

    setIsUploading(true);
    try {
      await apiService.uploadDocument(file);
      await loadDocuments();
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDelete = async (documentId: string) => {
    if (confirm('Are you sure you want to delete this document? All associated questions and quizzes will also be deleted.')) {
      try {
        await apiService.deleteDocument(documentId);
        await loadDocuments();
      } catch (error) {
        console.error('Delete failed:', error);
        alert('Failed to delete document');
      }
    }
  };

  const handleDownload = (document: Document) => {
    if (document.fileData.startsWith('http')) {
      // If it's a URL, open in new tab
      window.open(document.fileData, '_blank');
    } else {
      // If it's base64 data, download as before
      const link = window.document.createElement('a');
      link.href = document.fileData;
      link.download = document.name;
      link.click();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Document Library</h1>
        <p className="text-gray-600">Upload and manage your learning documents</p>
      </div>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed rounded-xl p-12 mb-8 transition-all ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
        }`}
      >
        <div className="flex flex-col items-center justify-center">
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-4 rounded-xl mb-4">
            <Upload className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Upload PDF Document
          </h3>
          <p className="text-gray-600 mb-4">Drag and drop or click to browse</p>
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
            />
            <span className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50">
              {isUploading ? 'Uploading...' : 'Choose File'}
            </span>
          </label>
        </div>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <FolderOpen className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No documents yet</h3>
          <p className="text-gray-600">Upload your first document to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all group"
            >
              <div className="flex items-start space-x-4 mb-4">
                <div className="bg-gradient-to-br from-blue-100 to-purple-100 p-3 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate mb-1">
                    {doc.name}
                  </h3>
                  <p className="text-sm text-gray-500">{formatDate(doc.uploadDate)}</p>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => onDocumentSelect(doc)}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all text-sm"
                >
                  Open
                </button>
                <button
                  onClick={() => handleDownload(doc)}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
                  title="Download"
                >
                  <Download className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-red-50 hover:border-red-300 transition-all"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
