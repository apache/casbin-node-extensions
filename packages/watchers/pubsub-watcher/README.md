<!--
     Licensed to the Apache Software Foundation (ASF) under one
     or more contributor license agreements.  See the NOTICE file
     distributed with this work for additional information
     regarding copyright ownership.  The ASF licenses this file
     to you under the Apache License, Version 2.0 (the
     "License"); you may not use this file except in compliance
     with the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

     Unless required by applicable law or agreed to in writing,
     software distributed under the License is distributed on an
     "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
     KIND, either express or implied.  See the License for the
     specific language governing permissions and limitations
     under the License.
-->

# pubsub-watcher

[![NPM version][npm-image]][npm-url]
![CI](https://github.com/node-casbin/pubsub-watcher/workflows/CI/badge.svg)

[npm-image]: https://img.shields.io/npm/v/@casbin/pubsub-watcher.svg?style=flat-square
[npm-url]: https://npmjs.org/package/@casbin/pubsub-watcher

Google Cloud Pub/Sub watcher for node-casbin

# Installation

```shell script
# NPM
npm install --save @casbin/pubsub-watcher

# Yarn
yarn add @casbin/pubsub-watcher
```

# Simple Example

```typescript
import { PubsubWatcher } from '@casbin/pubsub-watcher';
import { newEnforcer } from 'casbin';

// Initialize the watcher.
// You need to create Pubsub topic and subscription(per casbin instance) first
const watcher = await PubsubWatcher.newWatcher();

// Initialize the enforcer.
const enforcer = await newEnforcer('examples/authz_model.conf', 'examples/authz_policy.csv');

enforcer.setWatcher(watcher);

// By default, the watcher's callback is automatically set to the
// enforcer's loadPolicy() in the setWatcher() call.
// We can change it by explicitly setting a callback.
watcher.setUpdateCallback(() => console.log('Casbin need update'));
```

# Test

Set `GOOGLE_APPLICATION_CREDENTIALS` in environment variable and `npm run test`

Test uses [Pub/Sub emulator](https://cloud.google.com/pubsub/docs/emulator)

```sh
gcloud beta emulators pubsub start --project=casbin
PUBSUB_EMULATOR_HOST=localhost:8085 PUBSUB_PROJECT_ID=casbin npm run test
```
