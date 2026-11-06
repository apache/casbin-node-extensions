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

Egg-Authz 
====
[![Build Status](https://travis-ci.org/node-casbin/egg-authz.svg?branch=master)](https://travis-ci.org/node-casbin/egg-authz)
[![Coverage Status](https://coveralls.io/repos/github/node-casbin/egg-authz/badge.svg?branch=master)](https://coveralls.io/github/node-casbin/egg-authz?branch=master)
[![NPM version][npm-image]][npm-url]
[![NPM download][download-image]][download-url]
[![Discord](https://img.shields.io/discord/1022748306096537660?logo=discord&label=discord&color=5865F2)](https://discord.gg/S5UjpzGZjN)

[npm-image]: https://img.shields.io/npm/v/egg-authz.svg?style=flat-square
[npm-url]: https://npmjs.org/package/egg-authz
[download-image]: https://img.shields.io/npm/dm/egg-authz.svg?style=flat-square
[download-url]: https://npmjs.org/package/egg-authz

Egg-Authz is an authorization middleware for [Egg](https://eggjs.org/), it's based on ``Node-Casbin``: [https://github.com/casbin/node-casbin](https://github.com/casbin/node-casbin).

## 1. Installation
### use casbin v2.x
```shell
npm install casbin@2 egg-authz@2 --save
```

### use casbin v3.x
```shell
npm install casbin@3 egg-authz@3 --save
```

## 2. Create a file in middleware directory to import the module.

```js
// app/middleware/authz.js
module.exports = require('egg-authz')
```

```js
// config/config.default.js
const casbin = require('casbin')
module.exports = {
  middleware: [ 'authz' ],
  authz: {
    enable: true,
    newEnforcer: async() => {
      // load the casbin model and policy from files, database is also supported.
      const enforcer = await casbin.newEnforcer('authz_model.conf', 'authz_policy.csv')
      return enforcer
    }
  }
}
```

## 3. Enable the middleware in your config files.

## How to control the access

The authorization determines a request based on ``{subject, object, action}``, which means what ``subject`` can perform what ``action`` on what ``object``. In this plugin, the meanings are:

1. ``subject``: the logged-on user name
2. ``object``: the URL path for the web resource like "dataset1/item1"
3. ``action``: HTTP method like GET, POST, PUT, DELETE, or the high-level actions you defined like "read-file", "write-blog"


For how to write authorization policy and other details, please refer to [the Casbin's documentation](https://casbin.org).

## Getting Help

- [Node-Casbin](https://github.com/casbin/node-casbin)

## License

This project is licensed under the [Apache 2.0 license](LICENSE).
