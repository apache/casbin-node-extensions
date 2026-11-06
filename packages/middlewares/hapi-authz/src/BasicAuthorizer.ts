// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at

//   http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

import { Enforcer } from "casbin"
import { Request } from "hapi"

export default class BasicAuthorizer {
  enforcer: Enforcer;
  request: Request;
  constructor(request: Request, enforcer: Enforcer) {
    this.enforcer = enforcer;
    this.request = request;
  }

  // getUserName gets the user name from the request.
  // Currently, only HTTP basic authentication is supported
  getUserName(): string {
    var username: string;
    username = this.request.headers.authorization || "anonymous";

    return username;
  }

  // checkPermission checks the user/method/path combination from the request.
  // Returns true (permission granted) or false (permission forbidden)
  async checkPermission(): Promise<boolean> {
    const user: string = this.getUserName()
    return await this.enforcer.enforce(user, this.request.path, this.request.method);
  }
}