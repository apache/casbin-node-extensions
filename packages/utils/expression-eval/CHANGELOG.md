<!--
     Copyright 2026 The Apache Software Foundation
     
     Licensed under the Apache License, Version 2.0 (the "License");
     you may not use this file except in compliance with the License.
     You may obtain a copy of the License at
     
         http://www.apache.org/licenses/LICENSE-2.0
     
     Unless required by applicable law or agreed to in writing, software
     distributed under the License is distributed on an "AS IS" BASIS,
     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     See the License for the specific language governing permissions and
     limitations under the License.
-->

# [5.3.0](https://github.com/node-casbin/expression-eval/compare/v5.2.0...v5.3.0) (2024-11-19)

## 5.4.0

### Minor Changes

- First release from the apache/casbin-node-extensions monorepo.

  The 23 source repositories were consolidated (full git history and tags
  preserved). Future development and releases happen here; the old
  repositories will be archived. See the README for the package map.
- Build system migrated from microbundle to rollup; the artifact layout
  is byte-compatible with 5.3.0. The same four formats ship with the
  same filenames and entry fields (`main`, `module`, `unpkg`): ES5 CJS,
  ES5 ESM, ES2017 ESM (modern) and ES5 UMD exposing the
  `expressionEval` global, all with `jsep` external. Behavior verified
  identical to 5.3.0 across eval/evalAsync/compile.

### Features

- fix the logic short-circuit bug ([#8](https://github.com/node-casbin/expression-eval/issues/8)) ([7478389](https://github.com/node-casbin/expression-eval/commit/747838927b1b26ca557a2823621cbb18c4bf51e3))

# [5.2.0](https://github.com/node-casbin/expression-eval/compare/v5.1.0...v5.2.0) (2024-10-27)

### Features

- update README and fix github release ([#7](https://github.com/node-casbin/expression-eval/issues/7)) ([486e284](https://github.com/node-casbin/expression-eval/commit/486e284fa0582e3cd0a588e41cd39dc0a4964c02))

# [5.1.0](https://github.com/node-casbin/expression-eval/compare/v5.0.2...v5.1.0) (2024-10-24)

### Features

- improve package.json ([ba888a9](https://github.com/node-casbin/expression-eval/commit/ba888a96c51b921aa79f0a4cf4823f191a861ebd))
