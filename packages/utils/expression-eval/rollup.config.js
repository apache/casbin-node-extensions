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

// Build parity with the microbundle output of @casbin/expression-eval 5.3.0:
// four single-file artifacts, jsep external in every format.
//   dist/expression-eval.js          ES5   CJS   (main)
//   dist/expression-eval.module.js   ES5   ESM   (module)
//   dist/expression-eval.modern.js   ES2017 ESM
//   dist/expression-eval.umd.js      ES5   UMD   (unpkg; named global
//                                               `expressionEval`, reads
//                                               global `jsep`)
import typescript from '@rollup/plugin-typescript';

const input = 'index.ts';
const external = ['jsep'];

export default [
  {
    input,
    external,
    output: { file: 'dist/expression-eval.js', format: 'cjs', sourcemap: true, exports: 'named' },
    plugins: [
      typescript({
        tsconfig: 'tsconfig.json',
        compilerOptions: {
          module: 'es2015',
          target: 'es5',
          declaration: true,
          declarationDir: 'dist',
          sourceMap: true,
        },
      }),
    ],
  },
  {
    input,
    external,
    output: { file: 'dist/expression-eval.module.js', format: 'esm', sourcemap: true },
    plugins: [
      typescript({ tsconfig: 'tsconfig.json', compilerOptions: { module: 'es2015', target: 'es5' } }),
    ],
  },
  {
    input,
    external,
    output: { file: 'dist/expression-eval.modern.js', format: 'esm', sourcemap: true },
    plugins: [
      typescript({ tsconfig: 'tsconfig.json', compilerOptions: { module: 'es2015', target: 'es2017' } }),
    ],
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
    },
    plugins: [
      typescript({ tsconfig: 'tsconfig.json', compilerOptions: { module: 'es2015', target: 'es5' } }),
    ],
  },
];
