import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { MembersService } from '../models/members/members.service';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './jwt.strategy';
import { ERROR_INVALID_TOKEN } from '../error/error-message';
import axios from 'axios';
import { LoginMemberDto } from '../models/members/dto/login.members.dto';
import { Member } from '../models/members/entities/members.entity';

export interface RegistrationsStatus {
  success: boolean;
  message: string;
}

export interface LoginStatus {
  email;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly membersService: MembersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(member: Member): Promise<RegistrationsStatus> {
    let status: RegistrationsStatus = {
      success: true,
      message: 'member registered',
    };
    try {
      await this.membersService.setMemberLocation(member);

      await this.membersService.create(member);
    } catch (err) {
      status = {
        success: false,
        message: err,
      };
    }
    return status;
  }

  async login(loginMemberDto: LoginMemberDto): Promise<LoginStatus> {
    const member = await this.membersService.findByLogin(loginMemberDto);

    const token = this._createToken(member);

    return {
      id: member.id,
      email: member.email,
      ...token,
    };
  }

  async validateUser(payload: JwtPayload): Promise<Member> {
    const member = await this.membersService.findByPayload(payload);

    if (!member) {
      throw new HttpException(ERROR_INVALID_TOKEN, HttpStatus.UNAUTHORIZED);
    }

    return member;
  }

  private _createToken({ email }: Member): any {
    const member: JwtPayload = { email };

    const accessToken = this.jwtService.sign(member);

    return {
      expiresIn: process.env.JWT_EXPIRATION,
      accessToken,
    };
  }
}
