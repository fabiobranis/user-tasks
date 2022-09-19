import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { hash } from 'bcrypt';
import { Repository } from 'typeorm';
import { CreateUserInput } from './dto/create-user.input';
import { User } from './entities/user.entity';

const SALT_ROUNDS = 10;

@Injectable()
export class UserService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async onModuleInit(): Promise<void> {
    if (process.env.TEST) return;

    const admin = await this.userRepository.findOneBy({ username: 'admin' });

    if (admin) return;

    const hashedPass = await hash('test', 10);
    this.userRepository.save({ username: 'admin', password: hashedPass });
  }
  async create({ password, username }: CreateUserInput): Promise<User> {
    const hashedPass = await hash(password, SALT_ROUNDS);
    return this.userRepository.save({ username, password: hashedPass });
  }

  findAll(): Promise<Array<User>> {
    return this.userRepository.find();
  }

  findOne(id: number): Promise<User> {
    return this.userRepository.findOneBy({ id });
  }

  findByUserName(username: string): Promise<User> {
    return this.userRepository.findOneBy({ username });
  }
}
