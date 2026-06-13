import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { APP_CONFIG } from '@/config/app.config';

export interface KerberosJwtPayload {
  userId: string;
  userSystemId: string;
  nroDocumento: string;
  sid: string;
  role: string;
  systems: string[];
  iat: number;
  exp: number;
}

@Injectable()
export class KerberosJwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: APP_CONFIG.jwt.secret,
    });
  }

  validate(payload: KerberosJwtPayload): KerberosJwtPayload {
    return payload;
  }
}
