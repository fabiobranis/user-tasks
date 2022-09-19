import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { createUser } from './helpers/create-user';

const gql = '/graphql';

describe('Auth Resolver (e2e)', () => {
  let app: INestApplication;
  let server: { close: () => void };
  let dataSource: DataSource;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    dataSource = app.get<DataSource>(getDataSourceToken());

    await createUser(dataSource, { username: 'test', password: 'fake' });

    server = app.getHttpServer();
  });

  afterEach(async () => {
    await dataSource.dropDatabase();
    await app.close();
    server.close();
  });

  it('/login', async () => {
    const response = await request(server).post(gql).send({
      query:
        'mutation login($input: LoginUserInput!) {login(loginUserInput:$input) {user {username} access_token}}',
      variables: '{"input": {"username": "test", "password": "fake"}}',
    });

    expect(response.body.data).toEqual({
      login: { user: { username: 'test' }, access_token: expect.any(String) },
    });
  });
});
