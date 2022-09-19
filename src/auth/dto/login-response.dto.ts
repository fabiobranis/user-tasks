import { Field, ObjectType } from '@nestjs/graphql';
import { UserContextDTO } from '../../user/dto/user-context.dto';

@ObjectType()
export class LoginResponseDTO {
  @Field(() => String)
  access_token: string;

  @Field(() => UserContextDTO)
  user: UserContextDTO;

  constructor(access_token: string, user: UserContextDTO) {
    this.access_token = access_token;
    this.user = user;
  }
}
