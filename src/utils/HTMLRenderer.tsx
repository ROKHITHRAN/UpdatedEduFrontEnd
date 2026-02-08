import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function HTMLRenderer({ answer }: { answer: string }) {
  return (
    <div className="prose prose-gray max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{answer}</ReactMarkdown>
    </div>
  );
}
