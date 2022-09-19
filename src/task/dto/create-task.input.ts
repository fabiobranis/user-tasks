import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateTaskInput {
  @Field(() => String, { description: 'Task title.' })
  title: string;

  @Field(() => String, { description: 'Task description.' })
  description: string;

  @Field(() => Int, { description: 'User id.' })
  user: number;
}
