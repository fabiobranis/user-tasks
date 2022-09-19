import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserContextDTO } from '../user/dto/user-context.dto';
import { UserService } from '../user/user.service';
import { CreateTaskInput } from './dto/create-task.input';
import { UpdateTaskInput } from './dto/update-task.input';
import { Task } from './entities/task.entity';
import { TaskStatus } from './enum/task-status.enum';

@Injectable()
export class TaskService implements OnModuleInit {
  constructor(
    @InjectRepository(Task) private taskRepository: Repository<Task>,
    private userService: UserService,
  ) {}

  async onModuleInit() {
    if (process.env.TEST) return;

    const existingTasks = await this.taskRepository.find();
    if (existingTasks.length > 0) return;

    const user = await this.userService.findOne(1);

    const taskCreationPromises = [user, user, user].map((userContext, index) =>
      this.taskRepository.save({
        title: `task n ${index}`,
        description: `Task ${index} description`,
        status: TaskStatus.TO_DO,
        user: userContext,
      }),
    );

    await Promise.all(taskCreationPromises);
  }

  async create(createTaskInput: CreateTaskInput): Promise<Task> {
    const { user: userId, ...createTaskData } = createTaskInput;
    const user = await this.userService.findOne(userId);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    return this.taskRepository.save({
      ...createTaskData,
      status: TaskStatus.TO_DO,
      user,
    });
  }

  findAll(user: UserContextDTO): Promise<Array<Task>> {
    return this.taskRepository.findBy({ user: user });
  }

  findOne(id: number): Promise<Task> {
    return this.taskRepository.findOneBy({ id });
  }

  async update({
    id,
    description,
    status,
    title,
  }: UpdateTaskInput): Promise<Task> {
    const currentTask = await this.taskRepository.findOneBy({ id });

    if (currentTask.status === TaskStatus.ARCHIVED) {
      throw new BadRequestException('Archived tasks cannot be changed.');
    }

    return this.taskRepository.save({ id, description, status, title });
  }
}
