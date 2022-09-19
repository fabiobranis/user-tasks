# User Tasks

This is the repo for the user tasks challenge.

## About the stack

- Node.js
- Typescript
- Graphql (Apollo server)
- Nestjs
- TypeORM
- Postgresql
- Passport (local)
- Docker and docker compose

## How to run

In order to run the app you need to use `make` to build the application knowing that you have:

- Node.js and npm
- Typescript
- Docker
- build-essential (in order to use the makefile to make things easier).

Just need to run `make` and the application will build and start using the docker compose structure.

## If you want to run locally

You just need to start the docker (or your postgresql) fill the ,env with the values for the env vars provided in the .env.example file and run `npm start`. You'll need the [@nest/cli](https://github.com/nestjs/nest-cli) in order to run properly.

## Testing

For unit tests run `npm run test`.
For integration tests run `npm run test:e2e`.

## Assumptions

This application is configured to have the `/graphql` GET endpoint in order to provide the necessary documentations.

This application is using the `passport` lib with local auth and jwt. The authentication is made through a graphql mutation.

The resolvers are protected and you'll need to pass the JTW token as a Bearer token in Authorization header.

I've created some unit tests and e2e (integration) tests in this application in order to show the specific knowledge that I have about these approaches. The ideia behind this is to show where is the right place to make use of unit and integration tests, once the better is to have good coverage using the proper approach to each case. I mean, for simple crud operations where you don't have components isolated enough from this operations, integration tests are the best approach. If you have specific componentes, you'll should create a good architecture in order to provide good testable components and use the unit tests to assure that the things you've implemented are right and working good.

The business rules here are:

- Users can only list their tasks
- You can create tasks for any user
- You can move tasks through any status, but if this task is archived, you can't change this status.

There are two service classes with nest.js hooks that I've used in this app, for UserService and TaskService. These hooks are intended to be used whenever the app starts and there is no data in the database.
