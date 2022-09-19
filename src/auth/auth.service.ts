import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { UserContextDTO } from '../user/dto/user-context.dto';
import { UserService } from '../user/user.service';
import { LoginResponseDTO } from './dto/login-response.dto';
import { LoginUserInput } from './dto/login-user.input';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    username: string,
    password: string,
  ): Promise<UserContextDTO> {
    const user = await this.userService.findByUserName(username);

    if (user && (await compare(password, user.password))) {
      return new UserContextDTO(user.id, user.username);
    }

    return null;
  }

  async login(loginUserInput: LoginUserInput): Promise<LoginResponseDTO> {
    const user = await this.userService.findByUserName(loginUserInput.username);

    if (!user) {
      throw new UnauthorizedException();
    }

    return new LoginResponseDTO(
      this.jwtService.sign({
        username: user.username,
        sub: user.id,
      }),
      user,
    );
  }
}
