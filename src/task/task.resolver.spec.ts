import { Test, TestingModule } from '@nestjs/testing';
import { TaskResolver } from './task.resolver';
import { TaskService } from './task.service';

describe('TaskResolver', () => {
  let resolver: TaskResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TaskResolver, { provide: TaskService, useValue: {} }],
    }).compile();

    resolver = module.get<TaskResolver>(TaskResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
