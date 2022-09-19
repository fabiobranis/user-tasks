import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { TaskService } from './task.service';
import { Task } from './entities/task.entity';
import { CreateTaskInput } from './dto/create-task.input';
import { CurrentUser } from '../user/decorators/current-user.decorator';
import { UserContextDTO } from '../user/dto/user-context.dto';
import { ChangeTaskStatusInput } from './dto/change-task-status.input';
import { UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guards/jwt-auth.guard';

@Resolver(() => Task)
@UseGuards(JwtGuard)
export class TaskResolver {
  constructor(private readonly taskService: TaskService) {}

  @Mutation(() => Task)
  createTask(
    @Args('createTaskInput') createTaskInput: CreateTaskInput,
  ): Promise<Task> {
    return this.taskService.create(createTaskInput);
  }

  @Query(() => [Task], { name: 'tasks' })
  findAll(@CurrentUser() user: UserContextDTO): Promise<Array<Task>> {
    return this.taskService.findAll(user);
  }

  @Query(() => Task, { name: 'task' })
  findOne(@Args('id', { type: () => Int }) id: number): Promise<Task> {
    return this.taskService.findOne(id);
  }

  @Mutation(() => Task, { name: 'changeTaskStatus' })
  changeTaskStatus(
    @Args('changeTaskStatusInput') changeTaskStatusInput: ChangeTaskStatusInput,
  ) {
    return this.taskService.update(changeTaskStatusInput);
  }
}
