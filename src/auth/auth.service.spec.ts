import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { hash } from 'bcrypt';
import { UserContextDTO } from '../user/dto/user-context.dto';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';
import { LoginResponseDTO } from './dto/login-response.dto';

const mockedFindImplementation = async (username: string): Promise<User> => {
  if (username !== 'fake-name') throw new UnauthorizedException();

  const hashedPass = await hash('fake', 10);

  return {
    id: 1,
    username: 'fake-name',
    password: hashedPass,
  };
};

describe('AuthService', () => {
  let service: AuthService;
  const userService = { findByUserName: jest.fn(mockedFindImplementation) };
  const jwtService = { sign: jest.fn(() => 'fake-jwt') };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: userService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('validateUser', () => {
    describe('when password matches', () => {
      it('should return an user', () => {
        return expect(
          service.validateUser('fake-name', 'fake'),
        ).resolves.toBeInstanceOf(UserContextDTO);
      });
    });

    describe('when password does not match', () => {
      it('should throw an exception', () => {
        return expect(
          service.validateUser('fake-name', 'not-valid'),
        ).resolves.toBeNull();
      });
    });
  });

  describe('login', () => {
    describe('with valid username', () => {
      it('should return an user', () => {
        return expect(
          service.login({ username: 'fake-name', password: 'fake' }),
        ).resolves.toBeInstanceOf(LoginResponseDTO);
      });
    });

    describe('with invalid username', () => {
      it('should throw an exception', () => {
        return expect(
          service.login({
            username: 'fake-name-invalid',
            password: 'not-valid',
          }),
        ).rejects.toThrow(UnauthorizedException);
      });
    });
  });
});
