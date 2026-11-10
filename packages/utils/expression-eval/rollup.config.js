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
// Declarations use the shared preset's declarationBuild entry: the first
// JS output below emits per-file .d.ts into dist/.dts-tmp, and the last
// array entry bundles them into dist/index.d.ts through rollup-plugin-dts
// (banner applied at generation) - all within this single rollup
// invocation, exactly like the preset packages.
const fs = require('fs');
const typescript = require('@rollup/plugin-typescript');
const { declarationBuild } = require('../../../scripts/rollup.preset.js');

const banner = fs.readFileSync(`${__dirname}/../../../scripts/HEADER.txt`, 'utf8').trimEnd();
const input = 'index.ts';
const external = ['jsep'];
const tsOptions = (extra) => ({
  tsconfig: 'tsconfig.json',
  compilerOptions: {
    // Inline TS helpers (__awaiter & co.) the way tsc output does, so
    // the emitted code does not require tslib at runtime.
    importHelpers: false,
    ...extra,
  },
});

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
  declarationBuild(__dirname, {
    tmp: `${__dirname}/dist/.dts-tmp`,
    entryBase: 'index',
    typesOut: `${__dirname}/dist/index.d.ts`,
  }),
];
