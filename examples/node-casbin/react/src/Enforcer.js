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

import React, { useEffect, useState } from 'react';
import { newEnforcer, StringAdapter, newModelFromString } from 'casbin';

const model = newModelFromString(`
    [request_definition]
    r = sub, obj, act

    [policy_definition]
    p = sub, obj, act

    [policy_effect]
    e = some(where (p.eft == allow))

    [matchers]
    m = r.sub == p.sub && r.obj == p.obj && r.act == p.act
    `);

const adapter = new StringAdapter(`
    p, alice, data1, read
    p, bob, data2, write
    `);

const Enforcer = ({ sub, obj, act }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(false);
  const [enforcer, setEnforcer] = useState(null);

  useEffect(() => {
    console.log('Enforcer useEffect');
    newEnforcer(model, adapter).then((e) => {
      setEnforcer(e);
    });
  }, []);

  useEffect(() => {
    if (enforcer) {
      setLoading(true);
      enforcer
        .enforce(sub, obj, act)
        .then((res) => setResult(res))
        .finally(() => setLoading(false));
    }
  }, [sub, obj, act, enforcer]);
  return (
    <>
      <h1>Casbin</h1>
      <h2>
        Request ({sub}, {obj}, {act})
      </h2>
      {loading ? <h3>Enforcing...</h3> : <h3 data-testid="enforce-result">{result === true ? 'Allowed' : 'Denied'}</h3>}
    </>
  );
};

export default Enforcer;
