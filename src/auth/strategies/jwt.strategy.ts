import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ValidJwtUser } from '../types/valid-jwt-user.type';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'hide-me',
      logging: true,
    });
  }

  async validate(payload: any): Promise<ValidJwtUser> {
    return { id: payload.sub, username: payload.username };
  }
}
