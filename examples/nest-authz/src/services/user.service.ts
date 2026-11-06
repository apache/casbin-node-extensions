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
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { users } from '../fake-data';
import { User, CoreRBACUser } from '../interfaces';
import { AuthZRBACService } from 'nest-authz';

@Injectable()
export class UserService implements CoreRBACUser {
  constructor(private readonly authzSrv: AuthZRBACService) {}

  async addUser(user: User) {
    const isExist = await this.exists(user.username);
    if (isExist) {
      throw new BadRequestException(
        `The user ${user.username} is already exists.`,
      );
    }
    users.push(user);
  }

  async deleteUser(username: string) {
    const isExist = await this.exists(username);

    if (!isExist) {
      throw new NotFoundException(`The user ${username} not found.`);
    }

    for (let i = 0, j = users.length; i < j; i++) {
      const user = users[i];
      if (user.username === username) {
        users.splice(i, 1);
        break;
      }
    }

    return await this.authzSrv.deleteUser(username);
  }

  async assignedRoles(username: string): Promise<string[]> {
    const isExists = await this.exists(username);

    if (!isExists) {
      throw new NotFoundException(`The user ${username} not found.`);
    }

    return this.authzSrv.getImplicitRolesForUser(username);
  }

  async userPermissions(username: string): Promise<string[][]> {
    const isExists = await this.exists(username);

    if (!isExists) {
      throw new NotFoundException(`The user ${username} not found.`);
    }

    return this.authzSrv.getImplicitPermissionsForUser(username);
  }

  async exists(username: string): Promise<boolean> {
    for (const user of users) {
      if (user.username === username) {
        return true;
      }
    }
    return false;
  }

  async findAll(): Promise<User[]> {
    return users;
  }

  async findById(id: string): Promise<User | null> {
    for (const o of users) {
      if (o.id === id) {
        return o;
      }
    }
    return null;
  }

  async findByUserName(username: string): Promise<User | null> {
    for (const o of users) {
      if (o.username === username) {
        return o;
      }
    }
    return null;
  }

  async verifyCredentials(
    username: string,
    password: string,
  ): Promise<User | null> {
    const user = await this.findByUserName(username);

    if (!user) {
      return null;
    }

    const isPasswordCorrect = user.password === password;
    if (!isPasswordCorrect) {
      return null;
    }

    return user;
  }
}
