export interface Choice {
  text: string;
  initialChoiceIndex: number;
}

export interface Question {
  _id?: string; // id của question trong DB
  question: string;
  type: "choice" | "fill" | "essay";
  choices?: Choice[];
  image?: string;
  keys?: number[]; // cho choice
  key?: string; // cho fill
}

export interface Section {
  title: string;
  image?: string;
  questions: {
    index: number;
    question:  Question; // khi fetch thô thì là id (string), khi populate thì là object Question
  }[];
}

export interface Task {
  audio?: string;   // cho listening
  passage?: string; // cho reading
  image?: string;   // cho writing
  sections: Section[];
}

export interface Test {
  _id: string;
  testName: string;
  type: string;
  tasks: Task[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}
