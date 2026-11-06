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
  ExecutionContext,
  Provider,
  DynamicModule,
  ForwardReference,
  Type
} from '@nestjs/common';
import { AuthUser, BatchApproval } from '../types';
import { ResourceFromContextFn } from './permission.interface';

export interface AuthZModuleOptions<T = any> {
  model?: string;
  policy?: string | Promise<T>;
  enablePossession?: boolean;
  userFromContext: (context: ExecutionContext) => AuthUser;
  resourceFromContext?: ResourceFromContextFn;
  batchApproval?: BatchApproval;
  enforcerProvider?: Provider<any>;
  /**
   * Optional list of imported modules that export the providers which are
   * required in this module.
   */
  imports?: Array<
    Type<any> | DynamicModule | Promise<DynamicModule> | ForwardReference
  >;
}
