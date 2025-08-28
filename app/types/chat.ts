export interface AttachmentMeta {
  name: string;
  size?: number;
  type: string;
  domInspExtractData?: boolean;
  content?: string;
}

export type ChatMessage = { 
  id: string; 
  role: "user" | "assistant"; 
  content: string;
  toolCalls?: ToolCall[];
  toolResults?: ToolResult[];
  model?: string;
  tokensPerSecond?: number;
  totalTokens?: number;
  timeToFirstToken?: number;
  timestamp?: number;
  attachments?: AttachmentMeta[];
};

export type Thread = { 
  id: string; 
  title: string; 
  messages: ChatMessage[];
  isBranched?: boolean;
  parentId?: string; // original thread id when branched
};

export type Category = "create" | "explore" | "code" | "learn";

export interface Toolkit {
  slug: string;
  name: string;
  meta: {
    description: string;
    logo: string;
    tools_count: number;
    categories: Array<{id: string; name: string}>;
  };
  tools?: Tool[];
}

export interface Tool {
  name: string;
  slug: string;
  description: string;
  displayName: string;
}

export interface ToolCall {
  type: 'tool-call';
  toolName: string;
  toolCallId: string;
  args: any;
}

export interface ToolResult {
  type: 'tool-result';
  toolCallId: string;
  toolName: string;
  result: any;
}
