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

// Shared rollup preset: preserveModules JS pass(es) (banner + sourcemap
// at generation time, layout identical to the old tsc output). The
// typescript plugin emits per-file .d.ts straight into each format's
// output dir (declaration output bypasses rollup, so output.banner cannot
// reach it); a small plugin prepends the Apache header to every .d.ts at
// closeBundle, idempotently, so declarations ship headed - matching the
// published npm layout (one .d.ts per module in cjs and esm, deep imports
// typed). Bare imports stay external; only workspace-relative modules are
// transformed.
//
// Constraints / semantics:
// - @rollup/plugin-typescript forces importHelpers: true, so the output
//   requires 'tslib' at runtime; every workspace package declares tslib
//   in dependencies.
// - Every workspace package is a CommonJS package (no "type": "module"),
//   so CJS output uses .js. If an ESM package (type: module) is ever
//   added, its CJS output must use .cjs and the main field adjusted.
//
// Usage:  const { preset } = require('../../scripts/rollup.preset.js');
//         module.exports = preset(__dirname);                    // cjs
//         preset(__dirname, { formats: ['cjs', 'esm'] })         // dual
//         preset(__dirname, { out: 'build' })                    // custom dir
const fs = require('fs');
const path = require('path');
const { createRequire } = require('module');

const HEADER = fs.readFileSync(`${__dirname}/HEADER.txt`, 'utf8').trimEnd();
const EXTERNAL = (id) => !id.startsWith('.') && !path.isAbsolute(id);
const pkgRequire = (pkgDir) => createRequire(path.join(pkgDir, 'package.json'));
// Explicit format -> output subdirectory mapping; new formats must be
// registered here or preset() rejects them.
const FORMAT_DIRS = { cjs: 'cjs', esm: 'esm' };

function pluginTypescript(pkgDir, compilerOptions) {
  return pkgRequire(pkgDir)('@rollup/plugin-typescript')({
    tsconfig: path.join(pkgDir, 'tsconfig.json'),
    compilerOptions,
  });
}

// Idempotently prepend the Apache header to every .d.ts under dir. Only
// declarations are touched (they carry no sourcemaps), so the header pass
// cannot skew mapping like it would for .js output.
function addDtsHeaders(dir) {
  const header = `${HEADER}\n`;
  const walk = (current) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.isFile() && entry.name.endsWith('.d.ts')) {
        const source = fs.readFileSync(full, 'utf8');
        if (!source.startsWith('// Licensed to the Apache Software Foundation')) {
          fs.writeFileSync(full, header + source);
        }
      }
    }
  };
  walk(dir);
}

// Rollup plugin hooking the header pass to the end of the build that
// emitted the declarations.
function dtsHeaderPlugin(dir) {
  return {
    name: 'dts-header',
    closeBundle() {
      addDtsHeaders(dir);
    },
  };
}

// Deterministic source inventory: sorted keys, .d.ts excluded, duplicate
// module names rejected, src dir required, files only.
function sourceEntries(pkgDir) {
  const srcDir = path.join(pkgDir, 'src');
  if (!fs.existsSync(srcDir)) {
    throw new Error(`src directory not found: ${srcDir}`);
  }
  const entries = {};
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.isFile() && /\.tsx?$/.test(entry.name) && !entry.name.endsWith('.d.ts')) {
        const key = path.relative(srcDir, full).replace(/\.tsx?$/, '');
        if (entries[key]) throw new Error(`duplicate module name: ${key} in ${pkgDir}`);
        entries[key] = full;
      }
    }
  };
  walk(srcDir);
  return Object.fromEntries(Object.entries(entries).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)));
}

function preset(pkgDir, opts = {}) {
  const formats = opts.formats || ['cjs'];
  for (const format of formats) {
    if (!FORMAT_DIRS[format]) {
      throw new Error(`unsupported format: ${format} (supported: ${Object.keys(FORMAT_DIRS).join(', ')})`);
    }
  }
  const out = opts.out || 'lib';
  const entries = sourceEntries(pkgDir);
  const srcDir = path.join(pkgDir, 'src');
  const baseOutput = {
    preserveModules: true,
    entryFileNames: '[name].js',
    sourcemap: true,
    banner: HEADER,
    // Named exports keep default-exported modules in the tsc-era CJS
    // shape (exports.default = ...), matching the published npm packages
    // and silencing rollup's MIXED_EXPORTS warning.
    exports: 'named',
  };

  return formats.map((format, index) => {
    const dir = path.join(pkgDir, formats.length > 1 ? path.join(out, FORMAT_DIRS[format]) : out);
    const plugins = [
      pluginTypescript(pkgDir, {
        module: 'es2015',
        sourceMap: true,
        // Pin the declaration root to src so per-file .d.ts land next to
        // their preserveModules .js (without it, tsc can nest them under
        // a src/ prefix when the package has subdirectories).
        rootDir: srcDir,
        // Every format emits its own per-file declarations into its own
        // output dir (matches the tsc-era npm layout), and the header
        // pass below runs for each of them.
        declaration: true,
        declarationDir: dir,
      }),
      dtsHeaderPlugin(dir),
    ];
    return {
      input: entries,
      external: EXTERNAL,
      output: { ...baseOutput, dir, format },
      plugins,
    };
  });
}

module.exports = { preset, dtsHeaderPlugin, addDtsHeaders };
