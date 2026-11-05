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

describe('Root user root', () => {
  it('can read any user roles', async () => {
    const result = await enforcer.enforce('root', 'user_roles', 'read:any');
    expect(result).toBe(true);
  });
  it('can read any user', async () => {
    const result = await enforcer.enforce('root', 'user', 'read:any');
    expect(result).toBe(true);
  });
});

describe('manager tom', () => {
  it('can read any user roles', async () => {
    const result = await enforcer.enforce('tom', 'user_roles', 'read:any');
    expect(result).toBe(true);
  });
  it('can not read any user', async () => {
    const result = await enforcer.enforce('tom', 'user', 'read:any');
    expect(result).toBe(false);
  });
});

describe('guest bob', () => {
  it('can read own user', async () => {
    const result = await enforcer.enforce('bob', 'user', 'read:own');
    expect(result).toBe(true);
  });
  it('can not read any user', async () => {
    const result = await enforcer.enforce('bob', 'user', 'read:any');
    expect(result).toBe(false);
  });
});
