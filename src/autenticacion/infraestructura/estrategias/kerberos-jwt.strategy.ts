import * as fs from 'node:fs';
import * as path from 'node:path';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

interface KerberosJwtPayload {
  userId: string;
  userSystemId: string;
  iat: number;
  exp: number;
}

@Injectable()
export class KerberosJwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    const secretOrKey = fs.readFileSync(path.join(process.cwd(), 'keys', 'public.pem'), 'utf8');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    super({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey,
      algorithms: ['RS256'],
    });
  }

  validate(payload: KerberosJwtPayload): KerberosJwtPayload {
    return payload;
  }
}
