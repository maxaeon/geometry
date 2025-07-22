export interface Activity {
  id: string;
  title: string;
  grade: string;          // "K-2", "3-5", "6-8", "9-12"
  standards: string[];    // CCSS IDs
  icon?: 'brain' | 'book';
  steps: Step[];
  hints: string[];
  check: (state: CanvasState) => boolean;
}

export interface Step {
  prompt: string;
  autoNext?: boolean;
  keepShapes?: boolean;
  setup?: () => void;
  check: () => boolean;
}

export interface CanvasState {
  // define properties that represent the canvas state
  [key: string]: any;
}
