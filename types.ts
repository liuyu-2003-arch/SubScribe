export interface BlogPost {
  id: string;
  title: string;
  summary: string;
  content: string; // The organized paragraphs
  originalSrt: string;
  fileName: string;
  createdAt: number;
}

export interface GeneratedContent {
  title: string;
  summary: string;
  content: string;
}

export enum ViewState {
  HOME = 'HOME',
  POST = 'POST',
}