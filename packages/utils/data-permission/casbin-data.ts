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

import {Enforcer} from "casbin";
import { Sequelize, Model, DataTypes } from 'sequelize';

class ErrObjCondition extends Error {
  constructor() {
    super("Need to meet the prefix required by the object condition");
    this.name = "ErrObjCondition";
  }
}

class ErrEmptyCondition extends Error {
  constructor() {
    super("GetAllowedObjectConditions have an empty condition");
    this.name = "ErrEmptyCondition";
  }
}

async function getAllowedObjectConditions(enforcer: Enforcer, user: string, action: string, prefix: string): Promise<string[]> {
  const permissions = await enforcer.getImplicitPermissionsForUser(user);

  const objectConditions: string[] = [];
  for (const policy of permissions) {
    // policy [sub, obj, act]
    if (policy[2] === action) {
      if (!policy[1].startsWith(prefix)) {
        throw new ErrObjCondition();
      }
      objectConditions.push(policy[1].substring(prefix.length));
    }
  }

  if (objectConditions.length === 0) {
    throw new ErrEmptyCondition();
  }

  return objectConditions;
}

export { getAllowedObjectConditions, ErrObjCondition, ErrEmptyCondition };
