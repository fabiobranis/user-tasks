import * as request from 'supertest';

export async function generateJwtToken(
  server: {
    close: () => void;
  },
  endpoint: string,
): Promise<string> {
  const response = await request(server).post(endpoint).send({
    query:
      'mutation login($input: LoginUserInput!) {login(loginUserInput:$input) {user {username} access_token}}',
    variables: '{"input": {"username": "test", "password": "fake"}}',
  });

  return response.body.data.login.access_token;
}
