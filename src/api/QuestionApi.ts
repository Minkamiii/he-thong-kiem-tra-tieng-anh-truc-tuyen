export interface Choice {
  text: string;
  initialChoiceIndex: number;
}

export interface Question {
  _id: string;
  question: string;
  type: "choice" | "fill" | "essay";
  choices?: Choice[];
  keys?: number[];
  key?: string;
  __v?: number;
}

export interface Section {
  title: string | "";
  image?: string;
  questions: {
    index: number;
    question: Question;  // luôn là Question, không phải string
  }[];
}

export interface Task {
  passage?: string;
  audio?: string;
  image?: string;
  sections: Section[];
}

export interface Test {
  _id: string;
  testName: string;
  type: string;
  tasks: Task[];
  createdAt: string;
  updatedAt: string;
  __v?: number;
}
