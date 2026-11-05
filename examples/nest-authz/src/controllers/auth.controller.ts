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

import { Controller, Post, Body } from '@nestjs/common';
import uuid = require('uuid');

import { AuthService } from '../services/auth.service';

import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { LoginInput } from '../dto/login.input';
import { RegisterInput } from '../dto/register.input';
import { User } from '../interfaces';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authSrv: AuthService) {}

  @ApiOperation({
    summary: 'User login',
  })
  @Post('login')
  async login(@Body() credentials: LoginInput) {
    return this.authSrv.login(credentials.username, credentials.password);
  }

  @ApiOperation({
    summary: 'User register',
  })
  @Post('register')
  async register(@Body() userDto: RegisterInput) {
    const data: User = Object.assign({ id: uuid.v1() }, userDto);
    return this.authSrv.register(data);
  }
}
