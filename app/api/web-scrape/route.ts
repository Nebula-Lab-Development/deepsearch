import { NextResponse } from "next/server"
import axios from "axios"

// Define the interface for search results
interface SearchResult {
  title: string
  url: string
  snippet: string
}

export async function POST(request: Request) {
  try {
    const { query } = await request.json()
    
    if (!query || query.trim() === "") {
      return NextResponse.json({ error: "Search query is required" }, { status: 400 })
    }
    
    const results = await fetchDuckDuckGoResults(query)
    
    return NextResponse.json({
      results,
      query,
    })
  } catch (error) {
    console.error("Web search error:", error)
    return NextResponse.json({ error: "Failed to perform web search" }, { status: 500 })
  }
}

async function fetchDuckDuckGoResults(query: string): Promise<SearchResult[]> {
  try {
    // Use the DuckDuckGo API endpoint
    const apiUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&pretty=1`
    
    const response = await axios.get(apiUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      timeout: 10000, // 10-second timeout
    })
    
    const results: SearchResult[] = []
    
    // Extract from Abstract
    if (response.data.Abstract) {
      results.push({
        title: response.data.Heading || response.data.AbstractSource || "Abstract",
        url: response.data.AbstractURL || "",
        snippet: response.data.Abstract,
      })
    }
    
    // Extract from Related Topics
    if (response.data.RelatedTopics && response.data.RelatedTopics.length > 0) {
      response.data.RelatedTopics.slice(0, 5).forEach((topic: any) => {
        if (topic.Result && topic.FirstURL) {
          // Extract title from the HTML in Result
          const titleMatch = topic.Result.match(/<a[^>]*>(.*?)<\/a>/i)
          const title = titleMatch ? titleMatch[1] : "Related Topic"
          
          results.push({
            title,
            url: topic.FirstURL,
            snippet: topic.Text || "No description available",
          })
        }
      })
    }
    
    // If we still need more results, add from Infobox
    if (results.length < 5 && response.data.Infobox && response.data.Infobox.content) {
      response.data.Infobox.content.slice(0, 5 - results.length).forEach((item: any) => {
        if (item.label && item.value) {
          results.push({
            title: item.label,
            url: response.data.AbstractURL || "",
            snippet: typeof item.value === 'string' ? item.value : JSON.stringify(item.value),
          })
        }
      })
    }
    
    return results
  } catch (error) {
    console.error("Error fetching DuckDuckGo results:", error)
    return []
  }
}