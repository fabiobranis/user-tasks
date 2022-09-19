import { DataSource } from 'typeorm';
import { Task } from '../../src/task/entities/task.entity';
import { TaskStatus } from '../../src/task/enum/task-status.enum';
import { User } from '../../src/user/entities/user.entity';

export async function createTask(
  dataSource: DataSource,
  {
    title,
    description,
    status,
    user,
  }: { title: string; description: string; status: TaskStatus; user: User },
): Promise<Task> {
  const taskRepo = dataSource.getRepository(Task);

  return taskRepo.save({ title, description, status, user });
}
