import { ObjectType, Field, Int } from '@nestjs/graphql';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { TaskStatus } from '../enum/task-status.enum';

@ObjectType()
@Entity()
export class Task {
  @Field(() => Int, { description: 'Task ID.' })
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => String, { description: 'Task title.' })
  @Column()
  title: string;

  @Field(() => String, { description: 'Task description.' })
  @Column()
  description: string;

  @Field(() => TaskStatus)
  @Column({ type: 'enum', enum: TaskStatus })
  status: TaskStatus;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.tasks, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
