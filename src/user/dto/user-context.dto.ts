import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UserContextDTO {
  @Field(() => Int, { description: 'The user ID' })
  id: number;

  @Field(() => String, { description: 'The user name.' })
  username: string;

  constructor(id: number, username: string) {
    this.id = id;
    this.username = username;
  }
}
