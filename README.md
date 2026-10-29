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
