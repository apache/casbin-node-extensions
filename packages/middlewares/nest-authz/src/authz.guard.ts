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
  CanActivate,
  ExecutionContext,
  Inject
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  AUTHZ_ENFORCER,
  PERMISSIONS_METADATA,
  AUTHZ_MODULE_OPTIONS
} from './authz.constants';
import * as casbin from 'casbin';
import {
  Permission,
  PermissionData,
  ResourceFromContextFn
} from './interfaces/permission.interface';
import { UnauthorizedException } from '@nestjs/common';
import { AuthPossession, AuthResource, AuthUser, BatchApproval } from './types';
import { AuthZModuleOptions } from './interfaces/authz-module-options.interface';

@Injectable()
export class AuthZGuard implements CanActivate {
  constructor(
    protected readonly reflector: Reflector,
    @Inject(AUTHZ_ENFORCER) protected enforcer: casbin.Enforcer,
    @Inject(AUTHZ_MODULE_OPTIONS) protected options: AuthZModuleOptions
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const permissions: Permission[] = this.reflector.get<Permission[]>(
        PERMISSIONS_METADATA,
        context.getHandler()
      );

      if (!permissions) {
        return true;
      }

      const requestUser = this.options.userFromContext(context);

      if (!requestUser) {
        throw new UnauthorizedException();
      }

      const hasPermission = async (
        user: AuthUser,
        permission: Permission
      ): Promise<boolean> => {
        const {
          possession,
          resource,
          action,
          resourceFromContext,
          batchApproval
        } = permission;

        let contextResource: AuthResource;
        if (resourceFromContext === true) {
          if (this.options.resourceFromContext) {
            // Use default resourceFromContext function if provided.
            contextResource = this.options.resourceFromContext(context, {
              possession,
              resource,
              action
            });
          } else {
            // Default to permission resource if not provided.
            contextResource = resource;
          }
        } else {
          // Use custom resourceFromContext function or default.
          contextResource = (resourceFromContext as ResourceFromContextFn)(
            context,
            { possession, resource, action }
          );
        }

        const batchApprovalPolicy = batchApproval ?? this.options.batchApproval;
        if (!this.options.enablePossession) {
          return this.enforce(
            user,
            contextResource,
            action,
            batchApprovalPolicy
          );
        }

        const poss = [];

        if (possession === AuthPossession.OWN_ANY) {
          poss.push(AuthPossession.ANY, AuthPossession.OWN);
        } else {
          poss.push(possession as AuthPossession);
        }

        return AuthZGuard.asyncSome<AuthPossession>(poss, async p => {
          if (p === AuthPossession.OWN) {
            return (permission as any).isOwn(context);
          } else {
            return this.enforce(
              user,
              contextResource,
              `${action}:${p}`,
              batchApprovalPolicy
            );
          }
        });
      };

      const result = await AuthZGuard.asyncEvery<Permission>(
        permissions,
        async permission => hasPermission(requestUser, permission)
      );

      return result;
    } catch (e) {
      throw e;
    }
  }

  async enforce(
    user: AuthUser,
    resource: AuthResource | AuthResource[],
    action: string,
    batchApprovalPolicy?: BatchApproval
  ): Promise<boolean> {
    if (Array.isArray(resource)) {
      // Batch enforce according to batchApproval option.
      const checks = resource.map(res => [user, res, action]);
      const results = await this.enforcer.batchEnforce(checks);

      if (batchApprovalPolicy === BatchApproval.ANY) {
        return results.some(result => result);
      }

      return results.every(result => result);
    }

    return this.enforcer.enforce(user, resource, action);
  }

  static async asyncSome<T>(
    array: T[],
    callback: (value: T, index: number, a: T[]) => Promise<boolean>
  ): Promise<boolean> {
    for (let i = 0; i < array.length; i++) {
      const result = await callback(array[i], i, array);
      if (result) {
        return result;
      }
    }

    return false;
  }

  static async asyncEvery<T>(
    array: T[],
    callback: (value: T, index: number, a: T[]) => Promise<boolean>
  ): Promise<boolean> {
    for (let i = 0; i < array.length; i++) {
      const result = await callback(array[i], i, array);
      if (!result) {
        return result;
      }
    }

    return true;
  }
}
