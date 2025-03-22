"use client"

import type React from "react"

import { useState, useEffect } from "react"
import type { Chat } from "@/types/chat"
import { getChats, deleteChat } from "@/lib/chat-storage"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PlusCircle, MessageSquare, Trash2, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { format } from "date-fns"

interface ChatSidebarProps {
  isOpen: boolean
  onClose: () => void
  activeChat: Chat | null
  onChatSelect: (chat: Chat) => void
  onNewChat: () => void
}

export function ChatSidebar({ isOpen, onClose, activeChat, onChatSelect, onNewChat }: ChatSidebarProps) {
  const [chats, setChats] = useState<Chat[]>([])

  useEffect(() => {
    setChats(getChats().sort((a, b) => b.updatedAt - a.updatedAt))
  }, [activeChat])

  const handleDeleteChat = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation()
    deleteChat(chatId)
    setChats(chats.filter((chat) => chat.id !== chatId))
    toast.success("Chat deleted")

    // If the active chat was deleted, create a new one
    if (activeChat?.id === chatId) {
      onNewChat()
    }
  }

  return (
    <div
      className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-background border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full",
      )}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold">Chat History</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-3">
          <Button onClick={onNewChat} className="w-full justify-start gap-2">
            <PlusCircle className="h-4 w-4" />
            New Chat
          </Button>
        </div>

        <ScrollArea className="flex-1 p-3">
          <div className="space-y-2">
            {chats.length > 0 ? (
              chats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => onChatSelect(chat)}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-md cursor-pointer group",
                    activeChat?.id === chat.id ? "bg-primary/10 text-primary" : "hover:bg-muted/50",
                  )}
                >
                  <div className="flex items-start gap-2 overflow-hidden">
                    <MessageSquare className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <div className="overflow-hidden">
                      <div className="font-medium truncate">{chat.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(chat.updatedAt), "MMM d, yyyy")}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => handleDeleteChat(e, chat.id)}
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm">No chat history yet</div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}

