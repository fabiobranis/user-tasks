import { registerEnumType } from '@nestjs/graphql';

export enum TaskStatus {
  TO_DO = 'To Do',
  IN_PROGRESS = 'In Progress',
  DONE = 'Done',
  ARCHIVED = 'Archived',
}

registerEnumType(TaskStatus, {
  name: 'TaskStatus',
  description: 'The status of a given task.',
  valuesMap: {
    TO_DO: {
      description: 'The first status of a task.',
    },
    IN_PROGRESS: {
      description: 'When a task is being performed by an user.',
    },
    DONE: {
      description: 'When the task is done.',
    },
    ARCHIVED: {
      description: 'Tasks that are done and delivered, or undone and dropped.',
    },
  },
});
