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

import { Watcher } from 'casbin';
import { IOptions } from 'etcd3';
import { EtcdConnection } from './etcd';

export default class EtcdWatcher implements Watcher {
  private keyName: string;
  private etcdConnection: EtcdConnection;
  private callback: () => void;

  public static async newWatcher(options?: IOptions, keyName?: string): Promise<EtcdWatcher> {
    return new EtcdWatcher(options, keyName);
  }

  private constructor(options?: IOptions, keyName?: string) {
    this.keyName = keyName || '/casbin';
    this.etcdConnection = new EtcdConnection(options);
    this.etcdConnection.open();

    this.etcdConnection.client.watch().key(this.keyName).create().then(watcher => {
      watcher.on('put', () => {
        if (this.callback) {
          this.callback();
        }
      });
    }).catch(err => {
      throw err;
    });
  }

  public async update(): Promise<boolean> {
    await this.etcdConnection.client.put(this.keyName).value(Date.now()).exec();
    return true;
  }

  public setUpdateCallback(callback: () => void) {
    this.callback = callback;
  }

  public async close(): Promise<void> {
    this.etcdConnection.close();
  }
}
