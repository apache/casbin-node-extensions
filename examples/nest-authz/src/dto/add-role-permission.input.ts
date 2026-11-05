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

import { AuthAction } from 'nest-authz';
import { Resource, ResourceGroup } from '../resources';
import { ApiProperty } from '@nestjs/swagger';

export class AddRolePermissionInput {
  @ApiProperty({
    enum: [
      AuthAction.CREATE_ANY,
      AuthAction.CREATE_OWN,
      AuthAction.DELETE_ANY,
      AuthAction.DELETE_OWN,
      AuthAction.READ_ANY,
      AuthAction.READ_OWN,
      AuthAction.UPDATE_ANY,
      AuthAction.UPDATE_OWN,
    ],
  })
  operation: AuthAction;

  @ApiProperty({
    enum: [
      Resource.ROLES_LIST,
      Resource.ROLE_PERMISSIONS,
      Resource.USERS_LIST,
      Resource.USER_PERMISSIONS,
      Resource.USER_ROLES,
      ResourceGroup.ROLE,
      ResourceGroup.USER,
    ],
  })
  resource: Resource | ResourceGroup;
}
