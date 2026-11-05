// Copyright 2026 The Apache Software Foundation
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { Enforcer } from "casbin"
import BasicAuthorizer from "./BasicAuthorizer"

var Hapiauthz = {
  pkg: require("../package.json"),
  register: async function (server, options) {
    server.ext("onRequest", async function (request, h) {
      try {
        const { newEnforcer, authorizer } = options
        const enforcer = newEnforcer;

        if (!(enforcer instanceof Enforcer)) {
          throw new Error('Invalid enforcer')
        }

        const authzorizer = authorizer ? authorizer(request, enforcer) : new BasicAuthorizer(request, enforcer)
        if (!(authzorizer instanceof BasicAuthorizer)) {
          throw new Error('Please extends BasicAuthorizer class')
        }
        if (!await authzorizer.checkPermission()) {
          h.request.path = "/login";
          return h.continue;
        } else return h.continue;
      } catch (e) {
        throw (e);
      }
    });

    server.route({
      method: ["GET", "POST"],
      path: "/login",
      handler: function (request, h) {
        return "403 Forbidden";
      }
    });
  }
};

export {
  BasicAuthorizer,
  Hapiauthz
}