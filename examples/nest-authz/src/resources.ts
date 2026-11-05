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

export enum ResourceGroup {
  USER = 'user',
  ROLE = 'role',
  // ... other resource groups
}

export enum Resource {
  USERS_LIST = 'users_list',
  USER_ROLES = 'user_roles',
  USER_PERMISSIONS = 'user_permissions',
  ROLES_LIST = 'roles_list',
  ROLE_PERMISSIONS = 'role_permissions',
}

export interface ResourceMeta {
  name: ResourceGroup | Resource;
  displayName?: string;
  description?: string;
  isGroup: boolean;
  children?: ResourceMeta[];
}

export const Resources: ResourceMeta[] = [
  {
    name: ResourceGroup.USER,
    displayName: 'User',
    isGroup: true,
    children: [
      {
        name: Resource.USERS_LIST,
        displayName: 'Users List',
        description: 'Users list',
        isGroup: false,
      },
      {
        name: Resource.USER_ROLES,
        displayName: 'User Roles',
        description: 'Roles owned by user',
        isGroup: false,
      },
      {
        name: Resource.USER_PERMISSIONS,
        displayName: 'User Permissions',
        description: 'Permissions owned by user',
        isGroup: false,
      },
    ],
  },
  {
    name: ResourceGroup.ROLE,
    displayName: 'Role',
    isGroup: true,
    children: [
      {
        name: Resource.ROLES_LIST,
        displayName: 'Roles List',
        description: 'Roles List',
        isGroup: false,
      },
      {
        name: Resource.ROLE_PERMISSIONS,
        displayName: 'Role Permission',
        description: 'Role Permission',
        isGroup: false,
      },
    ],
  },
];
