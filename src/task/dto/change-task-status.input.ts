import { InputType, Field, Int } from '@nestjs/graphql';
import { TaskStatus } from '../enum/task-status.enum';

@InputType()
export class ChangeTaskStatusInput {
  @Field(() => Int, { description: 'Task id.' })
  id: number;

  @Field(() => String, {
    description: 'Task status. Should be TO_DO, IN_PROGRESS, DONE or ARCHIVED.',
  })
  status: TaskStatus;
}
