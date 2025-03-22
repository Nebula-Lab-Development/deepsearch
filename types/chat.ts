export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  metadata?: {
    sources?: any[];
    [key: string]: any;
  };
}

export interface Chat {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: number
  updatedAt: number
}

