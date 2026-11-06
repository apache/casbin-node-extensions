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

import { ExecutionContext } from '@nestjs/common';

export enum AuthActionVerb {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  READ = 'read'
}

export type CustomAuthActionVerb = string;

export type AuthResource = string | Record<string, any>;

export type AuthUser = string | Record<string, any>;

export enum AuthPossession {
  ANY = 'any',
  OWN = 'own',
  OWN_ANY = 'own|any'
}

export enum AuthAction {
  CREATE_ANY = 'create:any',
  CREATE_OWN = 'create:own',

  UPDATE_ANY = 'update:any',
  UPDATE_OWN = 'update:own',

  DELETE_ANY = 'delete:any',
  DELETE_OWN = 'delete:own',

  READ_ANY = 'read:any',
  READ_OWN = 'read:own'
}

export enum BatchApproval {
  ANY = 'any',
  ALL = 'all'
}
