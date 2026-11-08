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

// Shared rollup preset for the workspace's Node packages: a per-file
// transform pass (preserveModules) that keeps the tsc output layout
// (lib/adapter.js, lib/cjs/..., one file per source module) while
// injecting the Apache-2.0 banner and emitting source maps at
// generation time - so headers and maps are aligned by construction.
// Every bare import (dependencies, peer dependencies, node builtins)
// stays external; only workspace-relative modules are transformed.
//
// Usage in a package's rollup.config.js:
//   const { preset } = require('../../scripts/rollup.preset.js'); // depth varies
//   module.exports = preset(__dirname);
//   // dual-format packages: preset(__dirname, { formats: ['cjs', 'esm'] })
//   // custom output dir:    preset(__dirname, { out: 'build' })
const fs = require('fs');
const path = require('path');
const { createRequire } = require('module');

const HEADER = fs.readFileSync(`${__dirname}/HEADER.txt`, 'utf8').trimEnd();

function pluginTypescript(pkgDir, compilerOptions) {
  const pkgRequire = createRequire(path.join(pkgDir, 'package.json'));
  const typescript = pkgRequire('@rollup/plugin-typescript');
  // Note: declaration files are emitted by the typescript compiler via
  // declarationDir, outside rollup's module pipeline, and neither
  // output.banner nor a transformers.afterDeclarations synthetic
  // comment reliably reaches them (the plugin's declaration printing
  // drops SourceFile-level synthetic comments). The post-build step
  // (scripts/add-output-headers.js) completes declaration headers.
  return typescript({
    tsconfig: path.join(pkgDir, 'tsconfig.json'),
    compilerOptions,
  });
}

function sourceEntries(pkgDir) {
  const srcDir = path.join(pkgDir, 'src');
  const entries = {};
  const walk = (dir) => {
    for (const name of fs.readdirSync(dir)) {
      const full = path.join(dir, name);
      if (fs.statSync(full).isDirectory()) {
        walk(full);
      } else if (/\.tsx?$/.test(name)) {
        entries[path.relative(srcDir, full).replace(/\.tsx?$/, '')] = full;
      }
    }
  };
  walk(srcDir);
  return entries;
}

function preset(pkgDir, opts = {}) {
  const formats = opts.formats || ['cjs'];
  const out = opts.out || 'lib';
  const entries = sourceEntries(pkgDir);

  return formats.map((format) => {
    const dir = formats.length > 1 ? path.join(out, format === 'cjs' ? 'cjs' : 'esm') : out;
    return {
      input: entries,
      // Transform only workspace-relative modules; everything bare
      // (deps, peers, builtins) remains an import/require as-is.
      external: (id) => !id.startsWith('.') && !path.isAbsolute(id),
      output: {
        dir: path.join(pkgDir, dir),
        format,
        preserveModules: true,
        entryFileNames: '[name].js',
        sourcemap: true,
        banner: HEADER,
      },
      plugins: [
        pluginTypescript(pkgDir, {
          module: 'es2015',
          declaration: true,
          declarationDir: path.join(pkgDir, dir),
          sourceMap: true,
          // Inline TS helpers (__awaiter & co.) the way tsc output does,
          // instead of importing them from tslib at runtime.
          importHelpers: false,
        }),
      ],
    };
  });
}

module.exports = { preset };
