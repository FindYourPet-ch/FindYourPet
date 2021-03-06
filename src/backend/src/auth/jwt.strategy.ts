import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, VerifiedCallback } from 'passport-jwt';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ERROR_INVALID_TOKEN } from '../error/error-message';

@Injectable()
/**
 * Strategy to sign and verifiy the JwtToken
 * @author Berney Alec, Teo Ferrari, Quentin Forestier, Melvyn Herzig
 */
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
      secretOrKey: process.env.JWT_KEY,
    });
  }

  /**
   * Valide the authenticity of the token
   * @param payload Payload in the token
   * @param done Function to call after validation
   */
  async validate(payload: JwtPayload, done: VerifiedCallback) {
    const member = await this.authService.validateUser(payload);
    if (!member) {
      done(
        new HttpException(ERROR_INVALID_TOKEN, HttpStatus.UNAUTHORIZED),
        false,
      );
    }
    return done(null, member);
  }
}

export interface JwtPayload {
  email: string;
}
