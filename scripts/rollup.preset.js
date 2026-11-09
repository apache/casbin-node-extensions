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
  // declaration stage removes it when it finishes.
  const tmp = path.join(pkgDir, firstOut, '.dts-tmp');
  const typesPath = pkg.types || (pkg.main ? pkg.main.replace(/\.js$/, '.d.ts') : null);
  if (!typesPath) return null;
  const entryBase = path.basename(typesPath, '.d.ts');
  const typesOut = path.join(pkgDir, typesPath.replace(/^.?\//, ''));
  return { tmp, entryBase, typesOut };
}

function declarationStage(pkgDir, info) {
  const pkgRequire = createRequire(path.join(pkgDir, 'package.json'));
  const dts = pkgRequire('rollup-plugin-dts').dts;
  // The typescript plugin nests declarations under the computed rootDir,
  // so locate the entry by name rather than assuming an exact path.
  const findEntry = (dir) => {
    for (const name of fs.readdirSync(dir)) {
      const full = path.join(dir, name);
      if (fs.statSync(full).isDirectory()) {
        const hit = findEntry(full);
        if (hit) return hit;
      } else if (name === `${info.entryBase}.d.ts`) {
        return full;
      }
    }
    return null;
  };
  const entry = findEntry(info.tmp);
  if (!entry) {
    throw new Error(`declaration entry not found under ${info.tmp}`);
  }
  const external = (id) => !id.startsWith('.') && !path.isAbsolute(id);
  return {
    input: entry,
    external,
    output: { file: info.typesOut, format: 'esm', banner: HEADER },
    plugins: [
      dts(),
      {
        name: 'clean-declaration-tmp',
        closeBundle() {
          fs.rmSync(info.tmp, { recursive: true, force: true });
        },
      },
    ],
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

  // The declaration bundle needs the per-file .d.ts the javascript pass
  // emits, but rollup evaluates every config before building any of
  // them - so the two stages run as two rollup invocations, selected by
  // the ROLLUP_STAGE environment variable (see the build scripts).
  if (process.env.ROLLUP_STAGE === 'dts') {
    return info ? declarationStage(pkgDir, info) : [];
  }

  const entries = sourceEntries(pkgDir);
  return formats.map((format, index) => {
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
          // directory); the dts stage then bundles them.
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
}

module.exports = { preset };
