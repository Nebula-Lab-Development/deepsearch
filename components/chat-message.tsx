import type { ChatMessage as ChatMessageType } from "@/types/chat"
import { Markdown } from "@/components/markdown"
import { User, Bot } from "lucide-react"
import { cn } from "@/lib/utils"

interface ChatMessageProps {
  message: ChatMessageType
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user"

  return (
    <div className={cn("py-6 first:pt-0", isUser ? "" : "bg-muted/30")}>
      <div className="container max-w-4xl mx-auto px-4">
        <div className="flex gap-4">
          <div className="flex-shrink-0 mt-1">
            {isUser ? (
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary" />
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="text-sm font-medium mb-1">{isUser ? "You" : "Deepsearch"}</div>

            {isUser ? (
              <div className="text-foreground">{message.content}</div>
            ) : (
              <Markdown
                content={message.content}
                className="text-[15px] leading-relaxed [&>p]:mb-4 [&>ul]:mb-4 [&>ol]:mb-4 [&>h1]:text-xl [&>h1]:font-bold [&>h1]:mb-3 [&>h2]:text-lg [&>h2]:font-bold [&>h2]:mb-3 [&>h3]:font-semibold [&>h3]:mb-2"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

