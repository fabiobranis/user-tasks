import { hash } from 'bcrypt';
import { DataSource } from 'typeorm';
import { CreateUserInput } from '../../src/user/dto/create-user.input';
import { User } from '../../src/user/entities/user.entity';

export async function createUser(
  dataSource: DataSource,
  user: CreateUserInput,
): Promise<User> {
  const userRepo = dataSource.getRepository(User);
  const hashedPass = await hash(user.password, 10);
  return userRepo.save({ username: user.username, password: hashedPass });
}
