export interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
}

export interface Session {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}
