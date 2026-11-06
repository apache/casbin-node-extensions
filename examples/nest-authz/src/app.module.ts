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

import { Module, ExecutionContext } from '@nestjs/common';
import * as casbin from 'casbin';

import { AppController } from './controllers/app.controller';
import { UserController } from './controllers/user.controller';
import { RoleController } from './controllers/role.controller';
import { AuthController } from './controllers/auth.controller';
import { UserPermissionController } from './controllers/user-permission.controller';
import { UserRoleController } from './controllers/user-role.controller';

import { AuthZModule, AUTHZ_ENFORCER } from 'nest-authz';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from './config.module';

import {
  AuthService,
  UserService,
  RoleService,
  JwtStrategy,
  ConfigService,
} from './services';

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
    JwtModule.register({
      secret: 'secretKey',
    }),
    AuthZModule.register({
      imports: [ConfigModule],
      enforcerProvider: {
        provide: AUTHZ_ENFORCER,
        useFactory: async (configSrv: ConfigService) => {
          const config = await configSrv.getAuthConfig();
          return casbin.newEnforcer(config.model, config.policy);
        },
        inject: [ConfigService],
      },
      usernameFromContext: (ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return request.user && request.user.username;
      },
    }),
  ],
  controllers: [
    AppController,
    AuthController,
    UserController,
    RoleController,
    UserRoleController,
    UserPermissionController,
  ],
  providers: [AuthService, UserService, JwtStrategy, RoleService],
})
export class AppModule {}
