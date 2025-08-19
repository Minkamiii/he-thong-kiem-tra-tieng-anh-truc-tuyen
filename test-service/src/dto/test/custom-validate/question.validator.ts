import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
import { TestType } from "src/model/test/test.schema";
import { CreateTestDTO } from "../create/create-test.dto";
import { QuestionType } from "src/model/question/question.schema";

@ValidatorConstraint({ name: 'TestQuestionsMatchType', async: false })
export class TestQuestionsMatchType implements ValidatorConstraintInterface {
  validate(_: any, args: ValidationArguments) {
    const dto = args.object as CreateTestDTO;
    const isWriting = dto.type === TestType.WRITING;

    for (const task of dto.tasks) {
      for (const section of task.sections) {
        for (const q of section.questions) {
          if (!isWriting && q.question.type === QuestionType.ESSAY) return false;
          if (isWriting && q.question.type !== QuestionType.ESSAY) return false;
        }
      }
    }
    return true;
  }

  defaultMessage() {
    return 'Question type không khớp với test type';
  }
}