import type { Chat, ChatMessage } from "@/types/chat"

const STORAGE_KEY = "deep-search-chats"

export function saveChat(chat: Chat): void {
  const chats = getChats()
  const existingIndex = chats.findIndex((c) => c.id === chat.id)

  if (existingIndex >= 0) {
    chats[existingIndex] = chat
  } else {
    chats.push(chat)
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(chats))
}

export function getChats(): Chat[] {
  if (typeof window === "undefined") return []

  const storedChats = localStorage.getItem(STORAGE_KEY)
  if (!storedChats) return []

  try {
    return JSON.parse(storedChats)
  } catch (error) {
    console.error("Failed to parse chats from localStorage:", error)
    return []
  }
}

export function getChat(id: string): Chat | undefined {
  return getChats().find((chat) => chat.id === id)
}

export function deleteChat(id: string): void {
  const chats = getChats().filter((chat) => chat.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(chats))
}

export function createNewChat(): Chat {
  const id = generateId()
  const newChat: Chat = {
    id,
    title: "New Chat",
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }

  saveChat(newChat)
  return newChat
}

export function addMessageToChat(chatId: string, message: ChatMessage): Chat {
  const chat = getChat(chatId) || createNewChat()

  chat.messages.push(message)
  chat.updatedAt = Date.now()

  // Update title based on first user message if title is still default
  if (chat.title === "New Chat" && message.role === "user") {
    chat.title = message.content.slice(0, 30) + (message.content.length > 30 ? "..." : "")
  }

  saveChat(chat)
  return chat
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

