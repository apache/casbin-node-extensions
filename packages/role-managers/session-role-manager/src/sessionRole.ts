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

import { Session } from './session';

// SessionRole is a modified version of the default role.
// A SessionRole not only has a name, but also a list of sessions.
export class SessionRole {
  public name: string;
  private sessions: Session[];

  constructor(name: string) {
    this.name = name;
    this.sessions = new Array<Session>(0);
  }

  public addSession(s: Session): void {
    this.sessions.push(s);
  }

  public deleteSessions(sessionName: string): void {
    this.sessions = this.sessions.filter((n) => n.role.name !== sessionName);
  }

  public getSessionRoles(requestTime: Date): string[] {
    const names: string[] = [];
    for (const session of this.sessions) {
      if (session.startTime <= requestTime && requestTime <= session.endTime) {
        if (!names.includes(session.role.name)) {
          names.push(session.role.name);
        }
      }
    }
    return names;
  }

  public hasValidSession(name: string, hierarchyLevel: number, requestTime: Date): boolean {
    if (hierarchyLevel == 1) {
      return this.name == name;
    }
    for (const s of this.sessions) {
      if (s.startTime <= requestTime && requestTime <= s.endTime) {
        if (s.role.name == name) {
          return true;
        }
        if (s.role.hasValidSession(name, hierarchyLevel - 1, requestTime)) {
          return true;
        }
      }
    }
    return false;
  }

  public hasDirectRole(name: string, requestTime: Date): boolean {
    for (const session of this.sessions) {
      if (session.role.name == name) {
        if (session.startTime <= requestTime && requestTime <= session.endTime) {
          return true;
        }
      }
    }
    return false;
  }

  public toString(): string {
    let sessions = '';
    let i = 0;
    for (const session of this.sessions) {
      if (i == 0) {
        sessions += session.role.name;
      } else {
        sessions += ', ' + session.role.name;
      }
      sessions += ' (until: ' + session.endTime + ')';
      i++;
    }
    return this.name + ' < ' + sessions;
  }
}
