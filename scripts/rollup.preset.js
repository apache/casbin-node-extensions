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
// The returned array runs the JS pass(es) first and the declaration
// bundle last, all inside one rollup invocation: rollup builds
// config-array entries sequentially, and the dts entry resolves its
// input lazily (options hook) once the JS pass has written the
// per-file .d.ts.
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
  return typescript({
    tsconfig: path.join(pkgDir, 'tsconfig.json'),
    compilerOptions,
  });
}

// Declaration pipeline: the typescript plugin emits per-file .d.ts into
// a temporary directory (declaration output bypasses rollup, so
// output.banner cannot reach it), then rollup-plugin-dts bundles the
// tree into the single file the package's `types` field already points
// at - through rollup, so the banner applies and no post-build header
// step is needed.
function declarationInfo(pkgDir, pkg, out, formats) {
  const firstOut = formats.length > 1 ? path.join(out, 'cjs') : out;
  // The typescript plugin requires declarationDir to live inside the
  // rollup output dir; a dot-directory there is fine because the
  // declaration build removes it when it finishes.
  const tmp = path.join(pkgDir, firstOut, '.dts-tmp');
  const typesPath = pkg.types || (pkg.main ? pkg.main.replace(/\.js$/, '.d.ts') : null);
  if (!typesPath) return null;
  const entryBase = path.basename(typesPath, '.d.ts');
  const typesOut = path.join(pkgDir, typesPath.replace(/^.?\//, ''));
  return { tmp, entryBase, typesOut };
}

// dts build used by the preset and by bespoke configs (expression-eval).
// A standalone config entry appended to a rollup config array: it runs
// after the JS pass(es) in the same invocation.
function declarationBuild(pkgDir, info) {
  const pkgRequire = createRequire(path.join(pkgDir, 'package.json'));
  const dts = pkgRequire('rollup-plugin-dts').dts;
  // The typescript plugin nests declarations under the computed rootDir,
  // so locate the entry by name rather than assuming an exact path.
  // Match the entry at the current level before descending: a nested
  // module with the same basename (e.g. src/decorators/index.ts next to
  // src/index.ts) must not shadow the entry, and readdir order is
  // filesystem-dependent across macOS/Linux CI.
  const findEntry = (dir) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isFile() && entry.name === `${info.entryBase}.d.ts`) {
        return path.join(dir, entry.name);
      }
    }
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const hit = findEntry(path.join(dir, entry.name));
        if (hit) return hit;
      }
    }
    return null;
  };
  return {
    plugins: [
      {
        name: 'resolve-declaration-entry',
        // Resolve here instead of at config-evaluation time: by the time
        // this build starts, the JS pass above has written the per-file
        // .d.ts into the temporary directory.
        options(options) {
          const entry = findEntry(info.tmp);
          if (!entry) {
            throw new Error(`declaration entry not found under ${info.tmp}`);
          }
          return { ...options, input: entry };
        },
      },
      dts(),
      {
        name: 'clean-declaration-tmp',
        closeBundle() {
          fs.rmSync(info.tmp, { recursive: true, force: true });
        },
      },
    ],
    external: (id) => !id.startsWith('.') && !path.isAbsolute(id),
    output: { file: info.typesOut, format: 'esm', banner: HEADER },
  };
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
  const external = (id) => !id.startsWith('.') && !path.isAbsolute(id);
  const pkg = JSON.parse(fs.readFileSync(path.join(pkgDir, 'package.json'), 'utf8'));
  const info = declarationInfo(pkgDir, pkg, out, formats);

  const entries = sourceEntries(pkgDir);
  const jsConfigs = formats.map((format, index) => {
    const dir = formats.length > 1 ? path.join(out, format === 'cjs' ? 'cjs' : 'esm') : out;
    return {
      input: entries,
      // Transform only workspace-relative modules; everything bare
      // (deps, peers, builtins) remains an import/require as-is.
      external,
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
          // Only the first pass emits declarations (into the temporary
          // directory); the dts build then bundles them.
          declaration: index === 0 && Boolean(info),
          declarationDir: index === 0 && info ? info.tmp : undefined,
          sourceMap: true,
          // Inline TS helpers (__awaiter & co.) the way tsc output does,
          // instead of importing them from tslib at runtime.
          importHelpers: false,
        }),
      ],
    };
  });
  return info ? [...jsConfigs, declarationBuild(pkgDir, info)] : jsConfigs;
}

module.exports = { preset, declarationBuild };
