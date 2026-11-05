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

import {
  UsePermissions,
  PERMISSIONS_METADATA,
  Permission,
  AuthActionVerb,
  AuthPossession
} from '../src';

describe('@UsePermissions()', () => {
  it('should set metadata correctly', () => {
    const permissions: Permission[] = [
      {
        resource: 'test',
        action: AuthActionVerb.READ,
        possession: AuthPossession.ANY
      },
      {
        resource: {type: 'testType', id: 'testId'},
        action: AuthActionVerb.CREATE,
        possession: AuthPossession.OWN,
      }
    ];
    class TestController {
      @UsePermissions(...permissions)
      getData(): boolean {
        return false;
      }
    }
    const res = Reflect.getMetadata(
      PERMISSIONS_METADATA,
      TestController.prototype.getData
    );
    expect(res).toEqual(permissions);
  });
});
