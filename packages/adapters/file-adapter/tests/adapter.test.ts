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

import * as adapter from '../src';
import { Enforcer, newEnforcer } from 'casbin';
import { readFile } from '../src';

describe('TestAdapter', () => {
  let a: adapter.FileAdapter;
  let e: Enforcer;

  beforeEach(async () => {
    a = new adapter.FileAdapter(`${__dirname}/../examples/rbac_policy.csv`);
    e = await newEnforcer(`${__dirname}/../examples/rbac_model.conf`, a);
  });

  it('getPolicies', async () => {
    await a.loadPolicy(e.getModel());
    const policies = await e.getPolicy();
    expect(policies).toEqual([
      ['alice', 'data1', 'read'],
      ['bob', 'data2', 'write'],
      ['data2_admin', 'data2', 'read'],
      ['data2_admin', 'data2', 'write'],
      ['alice', 'data1', 'read'],
      ['bob', 'data2', 'write'],
      ['data2_admin', 'data2', 'read'],
      ['data2_admin', 'data2', 'write'],
    ]);
  });

  it('savePolicies', async () => {
    await a.savePolicy(e.getModel());
    const data = await readFile(`${__dirname}/../examples/rbac_policy.csv`);
    expect(data).toBe(
      'p, alice, data1, read\n' +
        'p, bob, data2, write\n' +
        'p, data2_admin, data2, read\n' +
        'p, data2_admin, data2, write\n' +
        'g, alice, data2_admin'
    );
  });
});
