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

import * as casbin from 'casbin';
import * as path from 'path';

let enforcer: casbin.Enforcer;
const modelPath = path.join(__dirname, '../model.conf');
const policyPath = path.join(__dirname, '../policy.csv');

beforeEach(async () => {
  enforcer = await casbin.newEnforcer(modelPath, policyPath);
});

describe('Resource hierarchy using g2', () => {
  it('should allow manager to read user_roles (resource hierarchy)', async () => {
    // manager role has permission to read:any on user_roles
    // user_roles is a child resource of user (via g2)
    const result = await enforcer.enforce('tom', 'user_roles', 'read:any');
    expect(result).toBe(true);
  });

  it('should allow superuser to read user (resource group)', async () => {
    // superuser has permission to read:any on user
    const result = await enforcer.enforce('alice', 'user', 'read:any');
    expect(result).toBe(true);
  });

  it('should allow superuser to read users_list (via resource hierarchy)', async () => {
    // superuser has permission on user, users_list inherits from user via g2
    const result = await enforcer.enforce('alice', 'users_list', 'read:any');
    expect(result).toBe(true);
  });

  it('should allow superuser to read user_roles (via resource hierarchy)', async () => {
    // superuser has permission on user, user_roles inherits from user via g2
    const result = await enforcer.enforce('alice', 'user_roles', 'read:any');
    expect(result).toBe(true);
  });

  it('should allow superuser to read user_permissions (via resource hierarchy)', async () => {
    // superuser has permission on user, user_permissions inherits from user via g2
    const result = await enforcer.enforce('alice', 'user_permissions', 'read:any');
    expect(result).toBe(true);
  });
});

describe('Resource ROLE_PERMISSIONS with correct name', () => {
  it('should recognize role_permissions resource in policy', async () => {
    // Verify that role_permissions (with 's') is properly loaded
    // Check if the g2 relationship exists (note: policy.csv has trailing commas)
    const hasRelation = await enforcer.hasNamedGroupingPolicy('g2', 'role_permissions', 'role', '');
    expect(hasRelation).toBe(true);
  });
});
