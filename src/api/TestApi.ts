export interface Choice {
  text: string;
  initialChoiceIndex: number;
}

export interface Question {
  _id?: string; // id của question trong DB
  question: string;
  type: "choice" | "fill" | "essay";
  choices?: Choice[];
  keys?: number[]; // cho choice
  key?: string; // cho fill
}

export interface Section {
  title: string;
  questions: {
    index: number;
    question: string | Question; // khi fetch thô thì là id (string), khi populate thì là object Question
  }[];
}

export interface Task {
  audio?: string;   // cho listening
  passage?: string; // cho reading
  sections: Section[];
}

export interface Test {
  _id: string;
  testName: string;
  type: string;
  tasks: Task[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}
