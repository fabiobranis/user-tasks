import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateUserInput {
  @Field(() => String, { description: 'The user name.' })
  username: string;

  @Field(() => String, { description: 'User password' })
  password: string;
}
