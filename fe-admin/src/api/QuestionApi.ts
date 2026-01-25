export interface Test {
  _id: string;
  testName: string;
  type: string;
  taskCount:number;
  questionCount:number;
  active:string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}