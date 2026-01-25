import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
import { TestType } from 'src/model/test/test.schema';

export function RequireFieldIfTypeMatches(field: string, typeToMatch: TestType, validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'requireFieldIfTypeMatches',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [field, typeToMatch],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [typeField, expectedType] = args.constraints;
          const typeValue = (args.object as any)?.[typeField];
          if (typeValue === expectedType) {
            return value !== null && value !== undefined && value !== '';
          }
          return true;
        },
        defaultMessage(args: ValidationArguments) {
          const [, expectedType] = args.constraints;
          return `${args.property} is required when type is ${expectedType}`;
        },
      },
    });
  };
}
