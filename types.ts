
export interface Section {
  id: string;
  title: string;
  content: string[];
}

export interface Chapter {
  id: string;
  number: number;
  title: string;
  sections: Section[];
}

export interface Bookmark {
  id: string; // format: "sectionId|index"
  memo: string;
  createdAt: number;
}

export type ViewState = 'toc' | 'reader' | 'diagram';

export type FontSize = 'text-base' | 'text-lg' | 'text-xl' | 'text-2xl';
