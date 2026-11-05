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

import {
  Controller,
  Get,
  UseGuards,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import {
  AuthZGuard,
  AuthActionVerb,
  AuthPossession,
  UsePermissions,
  AuthZRBACService,
} from 'nest-authz';

import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import { Resource } from '../resources';

import { Request } from 'express';

@ApiTags('User')
@ApiBearerAuth()
@Controller()
export class UserController {
  constructor(
    private readonly usersSrv: UserService,
    private readonly rbacSrv: AuthZRBACService) {}

  @ApiOperation({
    summary: 'Find all users',
  })
  @Get('users')
  @UseGuards(AuthGuard(), AuthZGuard)
  @UsePermissions({
    action: AuthActionVerb.READ,
    resource: Resource.USERS_LIST,
    possession: AuthPossession.ANY,
  })
  async findUsers() {
    return await this.usersSrv.findAll();
  }

  @ApiOperation({
    summary: 'Get own info',
  })
  @Get('users/me')
  @UseGuards(AuthGuard())
  async printCurrentUser(@Req() request: Request) {
    return request.user;
  }

  @ApiOperation({
    summary: 'Find all users, inject and use `AuthzRBACService`',
  })
  @UseGuards(AuthGuard())
  @Get('all-users')
  async findAllUsers(@Req() request: Request<any>) {
    let username = request.user['username'];
    // There is a policy  `p, root, user, read:any` in policy.csv
    // thus user root can do this operation
    const isPermitted = await this.rbacSrv.hasPermissionForUser(username, "user", "read:any");
    if (!isPermitted) {
      throw new UnauthorizedException(
        'You are not authorized to read users list'
      );
    }
    // A user can not reach this point if he/she is not granted for permission read users
    return await this.usersSrv.findAll();
  }
}
