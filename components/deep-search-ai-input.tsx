"use client"

import { Globe, Send, Loader2, AlertCircle, Settings, X, ExternalLink } from "lucide-react"
import { useState, useRef } from "react"
import { Textarea } from "@/components/ui/textarea"
import { motion, AnimatePresence } from "framer-motion"
import { useAutoResizeTextarea } from "@/hooks/use-auto-resize-textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { SettingsDialog } from "@/components/settings-dialog"
import { toast } from "sonner"
import { Markdown } from "@/components/markdown"

export default function DeepSearchAIInput() {
  const [value, setValue] = useState("")
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 52,
    maxHeight: 200,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [searchResults, setSearchResults] = useState<any[] | null>(null)
  const [response, setResponse] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const { theme } = useTheme()
  const responseRef = useRef<HTMLDivElement>(null)

  const handleNebulaRequest = async (query: string, contextResults: any[] | null = null) => {
    if (!query.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      // Create the message content based on whether we have search results
      let messageContent = query

      // Include search results in the prompt if available
      if (contextResults && contextResults.length > 0) {
        messageContent = `
        Search query: "${query}"
        
        Search results:
        ${contextResults
          .map(
            (result, i) =>
              `${i + 1}. ${result.title}
          URL: ${result.url}
          ${result.snippet}
          `,
          )
          .join("\n\n")}
        
        Based on these search results, please provide a comprehensive answer.
        `
      }

      // Call to your backend proxy for Nebula API
      const response = await fetch("/api/nebula-proxy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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
      setResponse(data.choices[0].message.content)

      // Scroll to response after a short delay to allow rendering
      setTimeout(() => {
        responseRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
      }, 100)
    } catch (error) {
      console.error("Nebula API error:", error)
      setError("Failed to get a response. Please check your API key in settings.")
      toast.error("API Error", {
        description: "Failed to get a response from Nebula API. Please check your API key.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleWebSearch = async (query: string) => {
    if (!query.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/web-scrape", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      })

      if (!response.ok) {
        throw new Error("Search request failed")
      }

      const data = await response.json()
      const results = data.results
      setSearchResults(results)

      // Pass the results to the AI
      if (results && results.length > 0) {
        await handleNebulaRequest(query, results)
      } else {
        toast.info("No search results found", {
          description: "Continuing with AI response without search context.",
        })
        await handleNebulaRequest(query)
      }
    } catch (error) {
      console.error("Web search error:", error)
      setError("Search failed. Continuing with AI response without search context.")
      toast.error("Search Error", {
        description: "Web search failed. Continuing with AI response without search context.",
      })
      await handleNebulaRequest(query)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = () => {
    if (value.trim()) {
      // Always perform web search which will then pass results to AI
      handleWebSearch(value)
    }

    setValue("")
    adjustHeight(true)
  }

  return (
    <div className="w-full">
      {/* Settings Dialog */}
      <SettingsDialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />

      {/* Error Alert */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4"
          >
            <Alert variant="destructive" className="border border-destructive/20 bg-destructive/10">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Web Search Results */}
      <AnimatePresence>
        {searchResults && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-4 rounded-lg bg-card border border-gray-200 dark:border-gray-800 max-h-[300px] overflow-y-auto shadow-sm"
          >
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium text-card-foreground">Search Results</span>
              <Button variant="ghost" size="icon" onClick={() => setSearchResults(null)} className="h-6 w-6">
                <X className="h-4 w-4" />
              </Button>
            </div>
            {searchResults && searchResults.length > 0 ? (
              <div className="space-y-3">
                {searchResults.map((result, index) => (
                  <div key={index} className="text-sm p-3 rounded-md bg-muted/50 hover:bg-muted transition-colors">
                    <div className="flex items-start justify-between">
                      <a
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-primary hover:underline flex-1"
                      >
                        {result.title}
                      </a>
                      <a
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground ml-2"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                    <p className="text-xs mt-1 text-muted-foreground">{result.snippet}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-md">No results found</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Response - Improved styling */}
      <AnimatePresence>
        {response && (
          <motion.div
            ref={responseRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 rounded-lg bg-card border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden"
          >
            <div className="flex justify-between items-center p-3 border-b border-gray-200 dark:border-gray-800 bg-muted/30">
              <span className="text-sm font-medium text-card-foreground">AI Response</span>
              <Button variant="ghost" size="icon" onClick={() => setResponse(null)} className="h-6 w-6">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-5 max-h-[500px] overflow-y-auto">
              <Markdown
                content={response}
                className="text-[15px] leading-relaxed [&>p]:mb-4 [&>ul]:mb-4 [&>ol]:mb-4 [&>h1]:text-xl [&>h1]:font-bold [&>h1]:mb-3 [&>h2]:text-lg [&>h2]:font-bold [&>h2]:mb-3 [&>h3]:font-semibold [&>h3]:mb-2"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative flex flex-col shadow-sm border border-gray-200 dark:border-gray-800 rounded-lg">
        <div className="overflow-y-auto max-h-[200px]">
          <Textarea
            id="deep-search-input"
            value={value}
            placeholder="Search the web with Nebula AI..."
            className="w-full rounded-lg rounded-b-none px-4 py-3 bg-background border-0 text-foreground placeholder:text-muted-foreground resize-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0 leading-[1.2]"
            ref={textareaRef}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSubmit()
              }
            }}
            onChange={(e) => {
              setValue(e.target.value)
              adjustHeight()
            }}
            disabled={isLoading}
          />
        </div>

        <div className="h-12 bg-muted/30 border-t border-gray-200 dark:border-gray-800 rounded-b-lg">
          <div className="absolute left-3 bottom-3 flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setIsSettingsOpen(true)}
              className="h-8 w-8 rounded-full"
              disabled={isLoading}
            >
              <Settings className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-1 text-xs text-primary">
              <Globe className="h-4 w-4" />
              <span>Deep Search</span>
            </div>
          </div>
          <div className="absolute right-3 bottom-3">
            <Button
              type="button"
              variant={value.trim() ? "default" : "ghost"}
              size="icon"
              onClick={handleSubmit}
              disabled={isLoading || !value.trim()}
              className="h-8 w-8 rounded-full"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

