import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const requestData = await request.json()

    const response = await fetch("https://api.nebulalab.xyz/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${request.headers.get("nebula-api-key") || process.env.NEBULA_API_KEY || ""}`,
      },
      body: JSON.stringify(requestData),
    })

    if (!response.ok) {
        console.log("error.. key:" + process.env.NEBULA_API_KEY)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Nebula proxy error:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}

