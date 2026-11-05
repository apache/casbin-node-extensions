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

# Apache Casbin Node Extensions

Monorepo for the [Apache Casbin](https://github.com/apache/casbin-node-casbin)
Node.js extensions: storage adapters, watchers, framework middlewares, and
utilities. Each package keeps its own npm package name and semantic version.

## Layout

```
packages/
├── adapters/       # storage adapters (file, redis, sequelize, typeorm, ...)
├── watchers/       # multi-instance policy synchronization
├── middlewares/    # framework integrations (express, koa, egg, nest, hapi)
├── role-managers/  # role managers (session-based)
└── utils/          # shared utilities
examples/           # runnable examples (not published to npm)
```

## Development

Requires [pnpm](https://pnpm.io).

```bash
pnpm install
pnpm -r build
pnpm -r test
```

## Import history

Packages were imported from their original repositories with full git
history preserved (authors, dates, tags) via `git filter-repo
--to-subdirectory-filter`, with tags renamed to `<package>-<version>`.

## License

Apache License 2.0. See [LICENSE](./LICENSE) and [NOTICE](./NOTICE).
