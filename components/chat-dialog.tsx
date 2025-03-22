"use client"

import type React from "react"

import { useState, useEffect } from "react"
import type { Chat } from "@/types/chat"
import { getChats, deleteChat } from "@/lib/chat-storage"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PlusCircle, MessageSquare, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { format } from "date-fns"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface ChatDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  activeChat: Chat | null
  onChatSelect: (chat: Chat) => void
  onNewChat: () => void
}

export function ChatDialog({ isOpen, onOpenChange, activeChat, onChatSelect, onNewChat }: ChatDialogProps) {
  const [chats, setChats] = useState<Chat[]>([])

  useEffect(() => {
    if (isOpen) {
      setChats(getChats().sort((a, b) => b.updatedAt - a.updatedAt))
    }
  }, [isOpen, activeChat])

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
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Chat History</DialogTitle>
        </DialogHeader>

        <div className="py-2">
          <Button
            onClick={() => {
              onNewChat()
              onOpenChange(false)
            }}
            className="w-full justify-start gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            New Chat
          </Button>
        </div>

        <ScrollArea className="h-[400px] pr-3">
          <div className="space-y-2">
            {chats.length > 0 ? (
              chats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => {
                    onChatSelect(chat)
                    onOpenChange(false)
                  }}
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
      </DialogContent>
    </Dialog>
  )
}

