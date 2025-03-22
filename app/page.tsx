"use client"

import { useState, useEffect } from "react"
import type { Chat, ChatMessage } from "@/types/chat"
import { createNewChat, getChats, addMessageToChat } from "@/lib/chat-storage"
import { Toaster } from "sonner"
import { PrivacyPolicyDialog } from "@/components/privacy-policy-dialog"
import { TermsOfServiceDialog } from "@/components/terms-of-service-dialog"
import { ChatDialog } from "@/components/chat-dialog"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useAutoResizeTextarea } from "@/hooks/use-auto-resize-textarea"
import { Send, Loader2, List, Sparkles, Settings, ExternalLink } from "lucide-react"
import { SettingsDialog } from "@/components/settings-dialog"
import { toast } from "sonner"
import { Markdown } from "@/components/markdown"

export default function Home() {
  const [privacyOpen, setPrivacyOpen] = useState(false)
  const [tosOpen, setTosOpen] = useState(false)
  const [chatDialogOpen, setChatDialogOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [activeChat, setActiveChat] = useState<Chat | null>(null)
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sources, setSources] = useState<any[]>([])
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 52,
    maxHeight: 200,
  })

  // Initialize with a new chat or the most recent one
  useEffect(() => {
    const chats = getChats()
    if (chats.length > 0) {
      // Get the most recent chat
      const mostRecent = chats.sort((a, b) => b.updatedAt - a.updatedAt)[0]
      setActiveChat(mostRecent)
    } else {
      handleNewChat()
    }
  }, [])

  const handleNewChat = () => {
    const newChat = createNewChat()
    setActiveChat(newChat)
    setInputValue("")
    setSources([])
  }

  const handleChatSelect = (chat: Chat) => {
    setActiveChat(chat)
    setSources([]) // Clear sources when changing chats
  }

  const handleSubmit = async () => {
    if (!inputValue.trim() || isLoading) return

    // Create a new chat if none exists
    if (!activeChat) {
      handleNewChat()
      return
    }

    setIsLoading(true)
    setSources([]) // Clear previous sources

    // Add user message
    const userMessage: ChatMessage = {
      id: Math.random().toString(36).substring(2, 15),
      role: "user",
      content: inputValue,
      timestamp: Date.now(),
    }

    const updatedChat = addMessageToChat(activeChat.id, userMessage)
    setActiveChat(updatedChat)
    setInputValue("")
    adjustHeight(true)

    try {
      // First, try to get web search results
      let searchResults = null
      try {
        const searchResponse = await fetch("/api/web-scrape", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: inputValue }),
        })

        if (searchResponse.ok) {
          const data = await searchResponse.json()
          searchResults = data.results
          // Store the search results for display
          if (searchResults && searchResults.length > 0) {
            setSources(searchResults)
          }
        }
      } catch (error) {
        console.error("Web search error:", error)
        toast.error("Search failed. Continuing with AI response without search context.")
      }

      // Prepare the message content for the AI
      let messageContent = inputValue

      // Include search results in the prompt if available
      if (searchResults && searchResults.length > 0) {
        messageContent = `
        Search query: "${inputValue}"
        
        Search results:
        ${searchResults
          .map(
            (result: any, i: number) =>
              `${i + 1}. ${result.title}
          URL: ${result.url}
          ${result.snippet}
          `,
          )
          .join("\n\n")}
        
        Based on these search results, please provide a comprehensive answer.
        `
      }

      // Call the Nebula API
      const response = await fetch("/api/nebula-proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "NebulaLabs/gpt-4o",
          messages: [
            {
              role: "system",
              content:
                "You are a helpful assistant that provides accurate information based on search results when available.",
            },
            { role: "user", content: messageContent },
          ],
        }),
      })

      if (!response.ok) {
        throw new Error("Nebula API request failed")
      }

      const data = await response.json()
      const aiContent = data.choices[0].message.content

      // Add AI response
      const aiMessage: ChatMessage = {
        id: Math.random().toString(36).substring(2, 15),
        role: "assistant",
        content: aiContent,
        timestamp: Date.now(),
        // Store sources in metadata if your ChatMessage type supports it
        metadata: { sources: searchResults || [] }
      }

      const finalChat = addMessageToChat(activeChat.id, aiMessage)
      setActiveChat(finalChat)
    } catch (error) {
      console.error("Error:", error)
      toast.error("Failed to get a response. Please check your API key in settings.")

      // Add error message
      const errorMessage: ChatMessage = {
        id: Math.random().toString(36).substring(2, 15),
        role: "assistant",
        content:
          "I'm sorry, I encountered an error while processing your request. Please check your API key in settings or try again later.",
        timestamp: Date.now(),
      }

      const errorChat = addMessageToChat(activeChat.id, errorMessage)
      setActiveChat(errorChat)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <div className="container max-w-4xl mx-auto px-4 py-8 flex-1">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Deepsearch</h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setChatDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <List className="h-4 w-4" />
              Load Chats
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setSettingsOpen(true)} className="h-9 w-9">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Current Chat Display */}
        {activeChat && activeChat.messages.length > 0 ? (
          <div className="space-y-8 mb-8">
            {activeChat.messages.map((message, index) => (
              <div key={message.id} className="rounded-lg">
                <div className="mb-2 text-sm font-medium">{message.role === "user" ? "You" : "Deepsearch"}</div>
                {message.role === "user" ? (
                  <div className="text-foreground">{message.content}</div>
                ) : (
                  <>
                    <Markdown
                      content={message.content}
                      className="text-[15px] leading-relaxed [&>p]:mb-4 [&>ul]:mb-4 [&>ol]:mb-4 [&>h1]:text-xl [&>h1]:font-bold [&>h1]:mb-3 [&>h2]:text-lg [&>h2]:font-bold [&>h2]:mb-3 [&>h3]:font-semibold [&>h3]:mb-2"
                    />
                    
                    {/* Display sources if this is an AI message that follows a user message with sources */}
                    {message.role === "assistant" && message.metadata?.sources && message.metadata.sources.length > 0 ? (
                      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-800">
                        <p className="text-sm font-medium text-muted-foreground mb-2">Sources:</p>
                        <div className="space-y-2">
                          {message.metadata.sources.map((source: any, i: number) => (
                            <div key={i} className="rounded-md bg-muted/50 p-3">
                              <div className="flex justify-between items-start">
                                <h4 className="text-sm font-medium mb-1">{source.title}</h4>
                                <a 
                                  href={source.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-primary hover:text-primary/80 flex items-center text-xs"
                                >
                                  <ExternalLink className="h-3 w-3 mr-1" />
                                  Visit
                                </a>
                              </div>
                              <p className="text-xs text-muted-foreground">{source.snippet}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      // If there are currently active sources but they're not stored in the message
                      index === activeChat.messages.length - 1 && sources.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-800">
                          <p className="text-sm font-medium text-muted-foreground mb-2">Sources:</p>
                          <div className="space-y-2">
                            {sources.map((source, i) => (
                              <div key={i} className="rounded-md bg-muted/50 p-3">
                                <div className="flex justify-between items-start">
                                  <h4 className="text-sm font-medium mb-1">{source.title}</h4>
                                  <a 
                                    href={source.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-primary hover:text-primary/80 flex items-center text-xs"
                                  >
                                    <ExternalLink className="h-3 w-3 mr-1" />
                                    Visit
                                  </a>
                                </div>
                                <p className="text-xs text-muted-foreground">{source.snippet}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center py-16">
            <div className="text-center max-w-md px-4">
              <h2 className="text-2xl font-bold mb-2">Welcome to Deepsearch</h2>
              <p className="text-muted-foreground mb-6">
                Ask any question and get answers powered by web search and Nebula Labs API.
              </p>
              <div className="flex justify-center">
                <Sparkles className="h-12 w-12 text-primary opacity-50" />
              </div>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="relative flex flex-col shadow-sm border border-gray-200 dark:border-gray-800 rounded-lg">
          <div className="overflow-y-auto max-h-[200px]">
            <Textarea
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value)
                adjustHeight()
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit()
                }
              }}
              placeholder="Ask a question..."
              ref={textareaRef}
              className="w-full rounded-lg rounded-b-none px-4 py-3 bg-background border-0 text-foreground placeholder:text-muted-foreground resize-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0 leading-[1.2]"
              disabled={isLoading}
            />
          </div>

          <div className="h-12 bg-muted/30 border-t border-gray-200 dark:border-gray-800 rounded-b-lg">
            <div className="absolute right-3 bottom-3">
              <Button
                type="button"
                variant={inputValue.trim() ? "default" : "ghost"}
                size="icon"
                onClick={handleSubmit}
                disabled={isLoading || !inputValue.trim()}
                className="h-8 w-8 rounded-full"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>

        <footer className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs text-muted-foreground">
            <div className="flex flex-col space-y-3">
              <span className="bg-yellow-900/20 text-yellow-500 dark:text-yellow-400 px-2 py-1 rounded text-xs font-medium border border-yellow-500/20 inline-block">
                Disclaimer: Content may be inaccurate. Use with discretion.
              </span>

              <div className="flex items-center text-xs text-muted-foreground">
                <Sparkles className="h-3 w-3 mr-1 text-primary" />
                <span>
                  Powered by{" "}
                  <a
                    href="https://nebulalab.xyz"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Nebula Labs API
                  </a>
                </span>
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={() => setPrivacyOpen(true)} className="hover:text-primary transition-colors">
                Privacy Policy
              </button>
              <button onClick={() => setTosOpen(true)} className="hover:text-primary transition-colors">
                Terms of Service
              </button>
            </div>
          </div>
        </footer>
      </div>

      {/* Dialogs */}
      <ChatDialog
        isOpen={chatDialogOpen}
        onOpenChange={setChatDialogOpen}
        activeChat={activeChat}
        onChatSelect={handleChatSelect}
        onNewChat={handleNewChat}
      />
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
      <PrivacyPolicyDialog open={privacyOpen} onOpenChange={setPrivacyOpen} />
      <TermsOfServiceDialog open={tosOpen} onOpenChange={setTosOpen} />
      <Toaster richColors position="top-center" />
    </main>
  )
}