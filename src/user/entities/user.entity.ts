import { ObjectType, Field, Int, HideField } from '@nestjs/graphql';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Task } from '../../task/entities/task.entity';

@ObjectType()
@Entity()
export class User {
  @Field(() => Int, { description: 'User ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => String, { description: 'The user name.' })
  @Column()
  username: string;

  @Field(() => String, { description: 'User password' })
  @HideField()
  @Column()
  password: string;

  @OneToMany(() => Task, (task) => task.user)
  @Field(() => [Task], { nullable: true })
  tasks?: Array<Task>;
}
