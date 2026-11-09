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
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Build parity with the microbundle output of @casbin/expression-eval 5.3.0:
// four single-file artifacts, jsep external in every format.
//   dist/expression-eval.js          ES5   CJS   (main)
//   dist/expression-eval.module.js   ES5   ESM   (module)
//   dist/expression-eval.modern.js   ES2017 ESM
//   dist/expression-eval.umd.js      ES5   UMD   (unpkg; named global
//                                               `expressionEval`, reads
//                                               global `jsep`)
// Declarations follow the workspace preset's two-stage flow: this pass
// emits per-file .d.ts into dist/.dts-tmp, and a second invocation with
// ROLLUP_STAGE=dts bundles them into dist/index.d.ts through
// rollup-plugin-dts so the banner applies at generation time.
const fs = require('fs');
const typescript = require('@rollup/plugin-typescript');

const banner = fs.readFileSync(`${__dirname}/../../../scripts/HEADER.txt`, 'utf8').trimEnd();
const input = 'index.ts';
const external = ['jsep'];
const tsOptions = (extra) => ({
  tsconfig: 'tsconfig.json',
  compilerOptions: {
    // Inline TS helpers the way tsc output does; there is no tslib
    // dependency and importHelpers would emit a require('tslib').
    importHelpers: false,
    ...extra,
  },
});

if (process.env.ROLLUP_STAGE === 'dts') {
  const dts = require('rollup-plugin-dts').dts;
  const tmp = `${__dirname}/dist/.dts-tmp`;
  const findEntry = (dir) => {
    for (const name of fs.readdirSync(dir)) {
      const full = `${dir}/${name}`;
      if (fs.statSync(full).isDirectory()) {
        const hit = findEntry(full);
        if (hit) return hit;
      } else if (name === 'index.d.ts') {
        return full;
      }
    }
    return null;
  };
  const entry = findEntry(tmp);
  if (!entry) throw new Error('declaration entry not found under dist/.dts-tmp');
  module.exports = {
    input: entry,
    external,
    output: { file: `${__dirname}/dist/index.d.ts`, format: 'esm', banner },
    plugins: [
      dts(),
      {
        name: 'clean-declaration-tmp',
        closeBundle() {
          fs.rmSync(tmp, { recursive: true, force: true });
        },
      },
    ],
  };
} else {
  module.exports = [
    {
      input,
      external,
      output: { file: 'dist/expression-eval.js', format: 'cjs', sourcemap: true, exports: 'named', banner },
      plugins: [
        typescript(
          tsOptions({
            module: 'es2015',
            target: 'es5',
            declaration: true,
            declarationDir: 'dist/.dts-tmp',
            sourceMap: true,
          })
        ),
      ],
    },
    {
      input,
      external,
      output: { file: 'dist/expression-eval.module.js', format: 'esm', sourcemap: true, banner },
      plugins: [typescript(tsOptions({ module: 'es2015', target: 'es5' }))],
    },
    {
      input,
      external,
      output: { file: 'dist/expression-eval.modern.js', format: 'esm', sourcemap: true, banner },
      plugins: [typescript(tsOptions({ module: 'es2015', target: 'es2017' }))],
    },
    {
      input,
      external,
      output: {
        file: 'dist/expression-eval.umd.js',
        format: 'umd',
        name: 'expressionEval',
        globals: { jsep: 'jsep' },
        sourcemap: true,
        exports: 'named',
        banner,
      },
      plugins: [typescript(tsOptions({ module: 'es2015', target: 'es5' }))],
    },
  ];
}
