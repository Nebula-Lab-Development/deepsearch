"use client"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { cn } from "@/lib/utils"

interface MarkdownProps {
  content: string
  className?: string
}

export function Markdown({ content, className }: MarkdownProps) {
  return (
    <div className={cn("prose dark:prose-invert prose-sm max-w-none", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ node, ...props }) => (
            <a
              {...props}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            />
          ),
          code: ({ node, className, children, ...props }) => (
            <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
              {children}
            </code>
          ),
          pre: ({ node, children, ...props }) => (
            <pre
              className="bg-muted p-4 rounded-md overflow-x-auto text-sm my-4 border border-gray-200 dark:border-gray-800"
              {...props}
            >
              {children}
            </pre>
          ),
          ul: ({ node, ...props }) => <ul className="list-disc pl-6 space-y-2" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal pl-6 space-y-2" {...props} />,
          li: ({ node, ...props }) => <li className="mb-1" {...props} />,
          p: ({ node, ...props }) => <p className="mb-4 last:mb-0" {...props} />,
          h1: ({ node, ...props }) => <h1 className="text-xl font-bold mt-6 mb-3" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-lg font-bold mt-5 mb-3" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-base font-semibold mt-4 mb-2" {...props} />,
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="border-l-4 border-gray-200 dark:border-gray-700 pl-4 italic text-gray-700 dark:text-gray-300 my-4"
              {...props}
            />
          ),
          hr: ({ node, ...props }) => <hr className="my-6 border-gray-200 dark:border-gray-800" {...props} />,
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-6">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800" {...props} />
            </div>
          ),
          th: ({ node, ...props }) => (
            <th
              className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-800"
              {...props}
            />
          ),
          td: ({ node, ...props }) => <td className="px-3 py-2 whitespace-nowrap text-sm" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

