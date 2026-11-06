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

import * as util from '../src/util';
import * as fs from 'fs';
import * as path from 'path';

test('test arrayToString', () => {
  expect(util.arrayToString(['test', 'test2', 'test3'])).toBe('test, test2, test3');
});

test('test readFile', async () => {
  await expect(util.readFile(`${__dirname}/../examples/rbac_model.conf`)).resolves.toContain(
    '[request_definition]\n' +
      'r = sub, obj, act\n' +
      '\n' +
      '[policy_definition]\n' +
      'p = sub, obj, act\n' +
      '\n' +
      '[role_definition]\n' +
      'g = _, _\n' +
      '\n' +
      '[policy_effect]\n' +
      'e = some(where (p.eft == allow))\n' +
      '\n' +
      '[matchers]\n' +
      'm = g(r.sub, p.sub) && r.obj == p.obj && r.act == p.act'
  );
});

test('test readFile fail', async () => {
  await expect(util.readFile('unexpected')).rejects.toBeTruthy();
});

test('test writeFile', async () => {
  await expect(util.writeFile(`${__dirname}/tmp`, 'test')).resolves.toBe(true);
  await expect(util.readFile(`${__dirname}/tmp`)).resolves.toBe('test');
  fs.unlinkSync(path.join(__dirname, 'tmp'));
});
