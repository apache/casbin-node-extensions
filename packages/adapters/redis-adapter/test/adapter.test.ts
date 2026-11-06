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

import {Enforcer, Util} from 'casbin';
import {NodeRedisAdapter} from '../src/adapter';


async function testGetPolicy(e: Enforcer, res: string[][]) {
    const myRes = await e.getPolicy();

    expect(Util.array2DEquals(res, myRes)).toBe(true);
}

async function testGetFilteredPolicy(e: Enforcer, res: string[]) {
    const filtered = await e.getFilteredNamedPolicy('p', 0, 'alice');
    const myRes = filtered[0];

    expect(Util.arrayEquals(res, myRes)).toBe(true);
}

test('test Adapter', async () => {
    const redisAdapter = await NodeRedisAdapter.newAdapter({host: "127.0.0.1", port: 6379})
    let e = new Enforcer();

    await e.initWithFile(
        'examples/rbac_model.conf',
        'examples/rbac_policy.csv',
    );

    // This is a trick to save the current policy to the DB.
    // We can't call e.savePolicy() because the adapter in the enforcer is still the file adapter.
    // The current policy means the policy in the Node-Casbin enforcer (aka in memory).
    await redisAdapter.savePolicy(e.getModel());

    e.clearPolicy();

    await testGetPolicy(e, []);

    // Load the policy from DB.
    await redisAdapter.loadPolicy(e.getModel());
    await testGetPolicy(e, [
        ['alice', 'data1', 'read'],
        ['bob', 'data2', 'write'],
        ['data2_admin', 'data2', 'read'],
        ['data2_admin', 'data2', 'write'],
    ]);

    e = new Enforcer();
    await e.initWithAdapter('examples/rbac_model.conf', redisAdapter);
    await testGetPolicy(e, [
        ['alice', 'data1', 'read'],
        ['bob', 'data2', 'write'],
        ['data2_admin', 'data2', 'read'],
        ['data2_admin', 'data2', 'write'],
    ]);

    await redisAdapter.loadFilteredPolicy(e.getModel(), {"p": ['alice']});
    await testGetFilteredPolicy(e, ['alice', 'data1', 'read']);

    // Add policy to DB
    await redisAdapter.addPolicy('', 'p', ['role', 'res', 'action']);
    e = new Enforcer();
    await e.initWithAdapter('examples/rbac_model.conf', redisAdapter);
    await testGetPolicy(e, [
        ['alice', 'data1', 'read'],
        ['bob', 'data2', 'write'],
        ['data2_admin', 'data2', 'read'],
        ['data2_admin', 'data2', 'write'],
        ['role', 'res', 'action'],
    ]);


    // Remove policy from DB
    await redisAdapter.removePolicy('', 'p', ['role', 'res', 'action']);
    e = new Enforcer();
    await e.initWithAdapter('examples/rbac_model.conf', redisAdapter);
    await testGetPolicy(e, [
        ['alice', 'data1', 'read'],
        ['bob', 'data2', 'write'],
        ['data2_admin', 'data2', 'read'],
        ['data2_admin', 'data2', 'write'],
    ]);

    await redisAdapter.removeFilteredPolicy('', 'p', 0, 'data2_admin');
    e = new Enforcer();
    await e.initWithAdapter('examples/rbac_model.conf', redisAdapter);
    await testGetPolicy(e, [
        ['alice', 'data1', 'read'],
        ['bob', 'data2', 'write'],
    ]);

    await redisAdapter.close()
}, 30 * 1000)
