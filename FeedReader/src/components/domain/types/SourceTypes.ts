export type Source = {
  id: number;
  name: string;
  url: string;
  type: "reddit" | "youtube";
  selected: boolean;
  flairs?: string[];
};

export interface SourcesPanelProps {
  newSource: { name: string; url: string; type: "reddit" | "youtube" };
  setNewSource: (s: { name: string; url: string; type: "reddit" | "youtube" }) => void;
  addNewSource: () => void;
  filteredSources: Source[];
  toggleSourceSelection: (id: number) => void;
  deleteSource: (id: number) => void;
  updateSourceFlairs: (id: number, flairs: string[]) => void;
} 