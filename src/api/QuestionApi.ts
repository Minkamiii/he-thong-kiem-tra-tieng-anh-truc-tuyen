interface Choice {
  text: string;
  initialChoiceIndex: number;
}

interface Question {
  question: string;
  type: "choice" | "fill";
  choices?: Choice[];
  keys?: number[]; // với choice
  key?: string; // với fill
}

interface Section {
  title: string;
  questions: {
    index: number;
    question: Question;
  }[];
}

interface Task {
  passage: string;
  sections: Section[];
}

export interface Test {
  testName: string;
  type: string;
  tasks: Task[];
}
