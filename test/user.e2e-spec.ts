import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { createUser } from './helpers/create-user';
import { generateJwtToken } from './helpers/generate-jwt-token';

const gql = '/graphql';

describe('User Resolver (e2e)', () => {
  let app: INestApplication;
  let server: { close: () => void };
  let dataSource: DataSource;
  let token: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    dataSource = app.get<DataSource>(getDataSourceToken());

    server = app.getHttpServer();

    await createUser(dataSource, { username: 'test', password: 'fake' });
    token = await generateJwtToken(server, gql);
  });

  afterEach(async () => {
    await dataSource.dropDatabase();
    await app.close();
    server.close();
  });
  describe('with authenticated user', () => {
    it('/createUser', async () => {
      const response = await request(server)
        .post(gql)
        .set({ Authorization: `Bearer ${token}` })
        .send({
          query:
            'mutation {createUser(createUserInput:{username: "user", password: "fake-pass"}) {username}}',
        });

      expect(response.body.data).toEqual({ createUser: { username: 'user' } });
    });

    it('/user', async () => {
      const user = await createUser(dataSource, {
        username: 'test',
        password: 'fake',
      });

      const response = await request(server)
        .post(gql)
        .set({ Authorization: `Bearer ${token}` })
        .send({
          query: 'query($id: Int!){user(id: $id) {id, username}}',
          variables: `{"id": ${user.id}}`,
        });

      expect(response.body.data).toEqual({
        user: { id: expect.any(Number), username: 'test' },
      });
    });

    it('/users', async () => {
      await createUser(dataSource, {
        username: 'test',
        password: 'fake',
      });

      const response = await request(server)
        .post(gql)
        .set({ Authorization: `Bearer ${token}` })
        .send({
          query: '{users {id, username}}',
        });

      expect(response.body.data).toEqual({
        users: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(Number),
            username: expect.any(String),
          }),
        ]),
      });
    });
  });

  describe('with no authenticated user', () => {
    it('/createUser', async () => {
      const response = await request(server).post(gql).send({
        query:
          'mutation {createUser(createUserInput:{username: "user", password: "fake-pass"}) {username}}',
      });

      expect(response.body.errors).toBeDefined();
    });
  });
});
