import type { Test } from "./QuestionApi";

export const fakeTests: Test[] = [
  {
    testName: "test",
    type: "reading",
    tasks: [
      {
        passage:
          "nothing beats a jet2 holiday and right now you can save £50 per person...",
        sections: [
          {
            title: "Skibidi dop dop dop yes yes",
            questions: [
              {
                index: 0,
                question: {
                  question: "Câu hỏi 1",
                  type: "choice",
                  choices: [
                    { text: "A. 1", initialChoiceIndex: 0 },
                    { text: "B. 2", initialChoiceIndex: 1 },
                    { text: "C. 3", initialChoiceIndex: 2 },
                    { text: "D. 4", initialChoiceIndex: 3 },
                  ],
                  keys: [2],
                },
              },
              {
                index: 1,
                question: {
                  question: "Câu hỏi 2",
                  type: "fill",
                  key: "jmklasdjdsa",
                },
              },
            ],
          },
        ],
      },
      {
        passage: "OMAE CỐ TÌNH CHỬI WATASHI DESU KA? ... (đoạn văn wibu 😂)",
        sections: [
          {
            title: "Ok luôn",
            questions: [
              {
                index: 0,
                question: {
                  question: "Câu hỏi 1",
                  type: "choice",
                  choices: [
                    { text: "A. 1", initialChoiceIndex: 0 },
                    { text: "B. 2", initialChoiceIndex: 1 },
                    { text: "C. 3", initialChoiceIndex: 2 },
                    { text: "D. 4", initialChoiceIndex: 3 },
                  ],
                  keys: [0, 1],
                },
              },
              {
                index: 1,
                question: {
                  question: "Điền vào chỗ trống: This is a _",
                  type: "fill",
                  key: "bag",
                },
              },
            ],
          },
        ],
      },
      {
        passage:
          "Cuối cùng mới có một bộ anime mà nhân vật chính đúng chuẩn hình mẫu lý tưởng...",
        sections: [
          {
            title: "Xem xét đoạn văn này",
            questions: [
              {
                index: 0,
                question: {
                  question: "Question 1 yay",
                  type: "choice",
                  choices: [
                    { text: "A. 1", initialChoiceIndex: 0 },
                    { text: "B. 2", initialChoiceIndex: 1 },
                    { text: "C. 3", initialChoiceIndex: 2 },
                    { text: "D. 4", initialChoiceIndex: 3 },
                  ],
                  keys: [1, 2, 3],
                },
              },
              {
                index: 1,
                question: {
                  question: "Yas",
                  type: "fill",
                  key: "None",
                },
              },
            ],
          },
        ],
      },
    ],
  },
  {
    testName: "IELTS Practice 1",
    type: "reading",
    tasks: [
      {
        passage:
          "The invention of the internet has dramatically changed the way people communicate and share information...",
        sections: [
          {
            title: "History of the Internet",
            questions: [
              {
                index: 0,
                question: {
                  question: "Who invented the World Wide Web?",
                  type: "choice",
                  choices: [
                    { text: "A. Bill Gates", initialChoiceIndex: 0 },
                    { text: "B. Tim Berners-Lee", initialChoiceIndex: 1 },
                    { text: "C. Steve Jobs", initialChoiceIndex: 2 },
                    { text: "D. Mark Zuckerberg", initialChoiceIndex: 3 },
                  ],
                  keys: [1],
                },
              },
              {
                index: 1,
                question: {
                  question: "The first website was created in _",
                  type: "fill",
                  key: "1991",
                },
              },
            ],
          },
        ],
      },
    ],
  },
  {
    testName: "TOEIC Mock Test",
    type: "reading",
    tasks: [
      {
        passage:
          "Company XYZ is planning to launch a new product line in the coming year...",
        sections: [
          {
            title: "Business Report",
            questions: [
              {
                index: 0,
                question: {
                  question: "What is the company planning to launch?",
                  type: "choice",
                  choices: [
                    { text: "A. A new service", initialChoiceIndex: 0 },
                    { text: "B. A new product line", initialChoiceIndex: 1 },
                    { text: "C. A new office", initialChoiceIndex: 2 },
                    { text: "D. A marketing campaign", initialChoiceIndex: 3 },
                  ],
                  keys: [1],
                },
              },
              {
                index: 1,
                question: {
                  question: "The launch will take place in _",
                  type: "fill",
                  key: "next year",
                },
              },
            ],
          },
        ],
      },
    ],
  },
  {
    testName: "English Grammar Test",
    type: "reading",
    tasks: [
      {
        passage:
          "Grammar is the structural foundation of our ability to express ourselves...",
        sections: [
          {
            title: "Basic Grammar",
            questions: [
              {
                index: 0,
                question: {
                  question: "Which sentence is correct?",
                  type: "choice",
                  choices: [
                    { text: "A. She go to school every day.", initialChoiceIndex: 0 },
                    { text: "B. She goes to school every day.", initialChoiceIndex: 1 },
                    { text: "C. She going to school every day.", initialChoiceIndex: 2 },
                    { text: "D. She gone to school every day.", initialChoiceIndex: 3 },
                  ],
                  keys: [1],
                },
              },
              {
                index: 1,
                question: {
                  question: "Fill in the blank: They _ playing football.",
                  type: "fill",
                  key: "are",
                },
              },
            ],
          },
        ],
      },
    ],
  },
];
