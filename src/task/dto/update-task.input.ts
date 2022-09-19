import { CreateTaskInput } from './create-task.input';
import { Field, InputType, Int, OmitType, PartialType } from '@nestjs/graphql';
import { TaskStatus } from '../enum/task-status.enum';

@InputType()
export class UpdateTaskInput extends PartialType(
  OmitType(CreateTaskInput, ['user'] as const),
) {
  @Field(() => Int, { description: 'Task id.' })
  id: number;

  @Field(() => String, {
    description: 'Task status. Should be TO_DO, IN_PROGRESS, DONE or ARCHIVED.',
  })
  status: TaskStatus;
}
