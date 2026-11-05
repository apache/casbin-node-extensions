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

# Session Role Manager

[![CI](https://github.com/node-casbin/session-role-manager/actions/workflows/ci.yml/badge.svg)](https://github.com/node-casbin/session-role-manager/actions/workflows/ci.yml)
[![NPM version][npm-image]][npm-url]
[![NPM download][download-image]][download-url]
[![Discord](https://img.shields.io/discord/1022748306096537660?logo=discord&label=discord&color=5865F2)](https://discord.gg/S5UjpzGZjN)

[npm-image]: https://img.shields.io/npm/v/session-role-manager.svg?style=flat-square
[npm-url]: https://npmjs.com/package/session-role-manager
[download-image]: https://img.shields.io/npm/dm/session-role-manager.svg?style=flat-square
[download-url]: https://npmjs.com/package/session-role-manager

Session Role Manager is the Session-based role manager for [Node-Casbin](https://github.com/casbin/node-casbin). With this library, Node-Casbin can load session-based role hierarchy (user-role mapping) from Casbin policy or save role hierarchy to it. The session is only active in the specified time range.

## Installation

```
npm install session-role-manager
```

## Simple Example

```typescript
import { newEnforcer } from 'casbin';
import { SessionRoleManager } from 'session-role-manager';

async function app() {
  const e = await newEnforcer('examples/rbac_model_with_sessions.conf', 'examples/rbac_policy_with_sessions.csv');

  // Use our role manager.
  const rm = new SessionRoleManager(10);
  e.setRoleManager(rm);
  await e.buildRoleLinks();
}

app();
```
