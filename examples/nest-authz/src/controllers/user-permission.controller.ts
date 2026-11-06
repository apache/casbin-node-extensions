// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at

//   http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

import {
  Controller,
  Get,
  UseGuards,
  Param,
  Post,
  Body,
  NotFoundException,
  Delete,
  Req,
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import {
  AuthZGuard,
  AuthActionVerb,
  AuthPossession,
  UsePermissions,
} from 'nest-authz';

import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import { Resource } from '../resources';

@ApiTags('UserPermission')
@ApiBearerAuth()
@Controller()
export class UserPermissionController {
  constructor(private readonly usersSrv: UserService) {}

  @ApiOperation({
    summary: 'Get all permissions owned by the given user',
  })
  @Get('/users/:id/permissions')
  @UseGuards(AuthGuard(), AuthZGuard)
  @UsePermissions({
    action: AuthActionVerb.READ,
    resource: Resource.USER_ROLES,
    possession: AuthPossession.OWN_ANY,
    isOwn: (req: any): boolean => {
      return Number(req.user.id) === Number(req.params.id);
    },
  })
  async findUserPermissions(@Param('id') id: string) {
    const user = await this.usersSrv.findById(id);

    if (!user) {
      throw new NotFoundException('The user not found');
    }

    if (user.username === 'root') {
      // built-in superuser with all permissions
      return ['*'];
    }

    return this.usersSrv.userPermissions(user.username);
  }
}
