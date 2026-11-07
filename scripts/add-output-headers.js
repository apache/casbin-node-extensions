// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

// Compiled outputs must carry the full Apache-2.0 header, like
// other Apache npm packages do (echarts, @apache-airflow/ts-sdk).
// tsc is unreliable here: it drops the header from .d.ts entirely
// and truncates the header it keeps on .js at the first empty
// comment line. This pass walks every workspace package's build
// output and makes sure each .js/.d.ts file starts with the
// complete header, replacing any truncated remnant tsc left.
const fs = require('fs');
const path = require('path');

const header = fs.readFileSync(`${__dirname}/HEADER.txt`, 'utf8').trimEnd();
const headerLines = header.split('\n');
const root = path.join(__dirname, '..');
const outputDirs = ['lib', 'dist', 'build'];
let fixed = 0;
let skipped = 0;

function processFile(target) {
  const original = fs.readFileSync(target, 'utf8');
  const lines = original.split('\n');

  let i = 0;
  let shebang = null;
  if (lines[0] && lines[0].startsWith('#!')) {
    shebang = lines[0];
    i = 1;
  }
  let directive = null;
  if (lines[i] && /^["']use strict["'];?$/.test(lines[i].trim())) {
    directive = lines[i];
    i += 1;
  }
  // Consume the leading run of blank lines and // comment lines.
  const start = i;
  let sawLicense = false;
  while (i < lines.length) {
    const l = lines[i];
    if (l === '' || l.trim() === '//') {
      i += 1;
      continue;
    }
    if (l.trimStart().startsWith('//')) {
      if (/Licensed to the Apache|Copyright 20|Apache License/.test(l)) {
        sawLicense = true;
      }
      i += 1;
      continue;
    }
    break;
  }
  const rest = lines.slice(i).join('\n');
  // The file is already correct only when its leading comment block is
  // exactly the full header (e.g. rollup banner output).
  if (lines.slice(start, i).join('\n') === header) {
    skipped += 1;
    return;
  }
  const out = [
    ...(shebang ? [shebang] : []),
    ...headerLines,
    '',
    ...(directive ? [directive] : []),
    rest,
  ].join('\n');
  fs.writeFileSync(target, out);
  fixed += 1;
}

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
          } else if (/\.(js|d\.ts)$/.test(entry.name)) {
            processFile(target);
          }
        }
      };
      walk(dir);
    }
  }
}
console.log(`output headers: ${fixed} fixed, ${skipped} already ok`);
