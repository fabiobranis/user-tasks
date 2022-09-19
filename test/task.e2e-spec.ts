import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { User } from '../src/user/entities/user.entity';
import { createUser } from './helpers/create-user';
import { generateJwtToken } from './helpers/generate-jwt-token';
import { TaskStatus } from '../src/task/enum/task-status.enum';
import { createTask } from './helpers/create-task';

const gql = '/graphql';

describe('Task Resolver (e2e)', () => {
  let app: INestApplication;
  let server: { close: () => void };
  let dataSource: DataSource;
  let user: User;
  let token: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    dataSource = app.get<DataSource>(getDataSourceToken());

    server = app.getHttpServer();

    user = await createUser(dataSource, { username: 'test', password: 'fake' });
    token = await generateJwtToken(server, gql);
  });

  afterEach(async () => {
    await dataSource.dropDatabase();
    await app.close();
    server.close();
  });

  it('/createTask', async () => {
    const response = await request(server)
      .post(gql)
      .set({ Authorization: `Bearer ${token}` })
      .send({
        query: `mutation {createTask(createTaskInput:{title: "fake task", description: "fake task description", user: ${user.id} }) {id title description status user {username}}}`,
      });

    expect(response.body.data).toEqual({
      createTask: expect.objectContaining({
        id: expect.any(Number),
        title: expect.any(String),
        description: expect.any(String),
        status: expect.any(String),
        user: expect.objectContaining({
          username: expect.any(String),
        }),
      }),
    });
  });

  it('/task', async () => {
    const task = await createTask(dataSource, {
      title: 'fake task',
      description: 'fake task description',
      status: TaskStatus.TO_DO,
      user,
    });

    const response = await request(server)
      .post(gql)
      .set({ Authorization: `Bearer ${token}` })
      .send({
        query:
          'query($id: Int!){task(id: $id) {id title description status user {username} }}',
        variables: `{"id": ${task.id}}`,
      });

    expect(response.body.data).toEqual({
      task: expect.objectContaining({
        id: expect.any(Number),
        title: expect.any(String),
        description: expect.any(String),
        status: expect.any(String),
        user: expect.objectContaining({
          username: expect.any(String),
        }),
      }),
    });
  });

  it('/tasks', async () => {
    const anotherUser = await createUser(dataSource, {
      username: 'other test',
      password: 'fake',
    });

    const taskCreationPromises = [user, user, user, anotherUser].map(
      (userContext, index) =>
        createTask(dataSource, {
          title: `task n ${index}`,
          description: `Task ${index} description`,
          status: TaskStatus.TO_DO,
          user: userContext,
        }),
    );

    // never use async functions inside array functions, they aren't async
    await Promise.all(taskCreationPromises);

    const response = await request(server)
      .post(gql)
      .set({ Authorization: `Bearer ${token}` })
      .send({
        query: '{tasks {id title description status user {username}}}',
      });

    expect(response.body.data).toEqual({
      tasks: expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(Number),
          title: expect.any(String),
          description: expect.any(String),
          status: expect.any(String),
          user: expect.objectContaining({
            username: expect.any(String),
          }),
        }),
      ]),
    });
  });
  describe('/changeTaskStatus', () => {
    describe('when the status is To Do', () => {
      it('should change from To Do to In Progress status', async () => {
        const task = await createTask(dataSource, {
          title: 'task',
          description: 'Task description',
          status: TaskStatus.TO_DO,
          user,
        });

        const response = await request(server)
          .post(gql)
          .set({ Authorization: `Bearer ${token}` })
          .send({
            query: `mutation {changeTaskStatus(changeTaskStatusInput:{id: ${task.id}, status: "${TaskStatus.IN_PROGRESS}"}) {id status }}`,
          });

        expect(response.body.data).toEqual({
          changeTaskStatus: expect.objectContaining({
            id: task.id,
            status: 'IN_PROGRESS',
          }),
        });
      });

      it('should change from To Do to Archived status', async () => {
        const task = await createTask(dataSource, {
          title: 'task',
          description: 'Task description',
          status: TaskStatus.TO_DO,
          user,
        });

        const response = await request(server)
          .post(gql)
          .set({ Authorization: `Bearer ${token}` })
          .send({
            query: `mutation {changeTaskStatus(changeTaskStatusInput:{id: ${task.id}, status: "${TaskStatus.ARCHIVED}"}) {id status }}`,
          });

        expect(response.body.data).toEqual({
          changeTaskStatus: expect.objectContaining({
            id: task.id,
            status: 'ARCHIVED',
          }),
        });
      });
    });
    describe('when the status is In Progress', () => {
      it('should change from In Progress to Done status', async () => {
        const task = await createTask(dataSource, {
          title: 'task',
          description: 'Task description',
          status: TaskStatus.IN_PROGRESS,
          user,
        });

        const response = await request(server)
          .post(gql)
          .set({ Authorization: `Bearer ${token}` })
          .send({
            query: `mutation {changeTaskStatus(changeTaskStatusInput:{id: ${task.id}, status: "${TaskStatus.DONE}"}) {id status }}`,
          });

        expect(response.body.data).toEqual({
          changeTaskStatus: expect.objectContaining({
            id: task.id,
            status: 'DONE',
          }),
        });
      });

      it('should change from In Progress to Archived status', async () => {
        const task = await createTask(dataSource, {
          title: 'task',
          description: 'Task description',
          status: TaskStatus.IN_PROGRESS,
          user,
        });

        const response = await request(server)
          .post(gql)
          .set({ Authorization: `Bearer ${token}` })
          .send({
            query: `mutation {changeTaskStatus(changeTaskStatusInput:{id: ${task.id}, status: "${TaskStatus.ARCHIVED}"}) {id status }}`,
          });

        expect(response.body.data).toEqual({
          changeTaskStatus: expect.objectContaining({
            id: task.id,
            status: 'ARCHIVED',
          }),
        });
      });
    });

    describe('when the status is Done', () => {
      it('should change from Done to Archived status', async () => {
        const task = await createTask(dataSource, {
          title: 'task',
          description: 'Task description',
          status: TaskStatus.DONE,
          user,
        });

        const response = await request(server)
          .post(gql)
          .set({ Authorization: `Bearer ${token}` })
          .send({
            query: `mutation {changeTaskStatus(changeTaskStatusInput:{id: ${task.id}, status: "${TaskStatus.ARCHIVED}"}) {id status }}`,
          });

        expect(response.body.data).toEqual({
          changeTaskStatus: expect.objectContaining({
            id: task.id,
            status: 'ARCHIVED',
          }),
        });
      });

      it('should change from Done to In Progress status', async () => {
        const task = await createTask(dataSource, {
          title: 'task',
          description: 'Task description',
          status: TaskStatus.DONE,
          user,
        });

        const response = await request(server)
          .post(gql)
          .set({ Authorization: `Bearer ${token}` })
          .send({
            query: `mutation {changeTaskStatus(changeTaskStatusInput:{id: ${task.id}, status: "${TaskStatus.IN_PROGRESS}"}) {id status }}`,
          });

        expect(response.body.data).toEqual({
          changeTaskStatus: expect.objectContaining({
            id: task.id,
            status: 'IN_PROGRESS',
          }),
        });
      });
    });

    describe('when the status is Archived', () => {
      it('should not change status', async () => {
        const task = await createTask(dataSource, {
          title: 'task',
          description: 'Task description',
          status: TaskStatus.ARCHIVED,
          user,
        });

        const response = await request(server)
          .post(gql)
          .set({ Authorization: `Bearer ${token}` })
          .send({
            query: `mutation {changeTaskStatus(changeTaskStatusInput:{id: ${task.id}, status: "${TaskStatus.TO_DO}"}) {id status }}`,
          });

        expect(response.body.errors).toBeDefined();
      });
    });
  });
});
