// Copyright 2026 The Apache Software Foundation
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from './user.service';
import { JwtPayload, User } from '../interfaces';

@Injectable()
export class AuthService {
  constructor(
    private readonly userSrv: UserService,
    private readonly jwtSrv: JwtService,
  ) {}

  async validateJwt(payload: JwtPayload): Promise<User> {
    return await this.userSrv.findById(payload.id);
  }

  async login(username: string, password: string) {
    const user = await this.userSrv.verifyCredentials(username, password);

    if (!user) {
      throw new UnauthorizedException('username or password incorrect!');
    }

    const payload = {
      id: user.id,
      username: user.username,
    };

    const token = this.jwtSrv.sign(payload);
    return {
      userId: user.id,
      accessToken: token,
    };
  }

  async register(user: User) {
    await this.userSrv.addUser(user);
  }
}
