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

// tsc never carries the sources' leading license comment into
// declaration files. Walk every workspace package's build output and
// prepend the Apache-2.0 header to any *.d.ts lacking it, so the
// published tarballs' declarations carry license information (ATR's
// license checks read them).
const fs = require('fs');
const path = require('path');

const header = fs.readFileSync(`${__dirname}/HEADER.txt`, 'utf8').trimEnd();
const root = path.join(__dirname, '..');
const outputDirs = ['lib', 'dist', 'build'];
let touched = 0;

for (const group of fs.readdirSync(`${root}/packages`)) {
  const groupDir = `${root}/packages/${group}`;
  if (!fs.statSync(groupDir).isDirectory()) continue;
  for (const pkg of fs.readdirSync(groupDir)) {
    for (const out of outputDirs) {
      const dir = path.join(groupDir, pkg, out);
      if (!fs.existsSync(dir)) continue;
      const walk = (d) => {
        for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
          const target = path.join(d, entry.name);
          if (entry.isDirectory()) {
            walk(target);
          } else if (entry.name.endsWith('.d.ts')) {
            const source = fs.readFileSync(target, 'utf8');
            if (!source.startsWith('// Copyright')) {
              fs.writeFileSync(target, `${header}\n\n${source}`);
              touched++;
            }
          }
        }
      };
      walk(dir);
    }
  }
}
console.log(`d.ts headers: ${touched} file(s) updated`);
