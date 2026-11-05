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

import { Watcher } from 'casbin';
import { RedisClusterConnection, RedisConnection, RedisClient } from './redis';
import { ClusterNode, ClusterOptions, RedisOptions } from 'ioredis';

export interface WatcherOptions extends RedisOptions {
  channel?: string;
}

export interface WatcherClusterOptions extends ClusterOptions {
  channel?: string;
}

export class RedisWatcher implements Watcher {
  private pubConnection: RedisConnection | RedisClusterConnection;
  private subConnection: RedisConnection | RedisClusterConnection;
  private callback: () => void;
  private channel = 'casbin';

  /**
   * newWatcher creates a watcher on the single Redis.
   * @param options - https://github.com/luin/ioredis/blob/master/API.md#new-redisport-host-options
   * @example
   * newWatcher('redis://user:password@redis-service.com:6379')
   * newWatcher('//localhost:6379')
   * newWatcher({
   *   port: 6379, // Redis port
   *   host: "127.0.0.1", // Redis host
   *   family: 4, // 4 (IPv4) or 6 (IPv6)
   *   password: "auth",
   *   db: 0,
   *   channel: "casbin"
   * })
   */
  public static async newWatcher(options?: WatcherOptions | string): Promise<RedisWatcher> {
    let channel = '';
    if (typeof options === 'object' && options.channel) {
      channel = options.channel;
    }

    const pubConnection = new RedisConnection(options);
    const subConnection = new RedisConnection(options);
    return this.init(pubConnection, subConnection, channel);
  }

  /**
   * newWatcherWithCluster creates a watcher on the Redis cluster.
   * @param nodes - An array of nodes in the cluster, [{ port: number, host: string }]
   * @param clusterOptions - https://github.com/luin/ioredis/blob/master/API.md#new-clusterstartupnodes-options
   * @example
   * newWatcherWithCluster([{ port: 6380, host: "127.0.0.1"}, { port: 6381, host: "127.0.0.1"})
   */
  public static async newWatcherWithCluster(nodes: ClusterNode[] = [], clusterOptions: WatcherClusterOptions = {}): Promise<RedisWatcher> {
    const pubConnection = new RedisClusterConnection(nodes, clusterOptions);
    const subConnection = new RedisClusterConnection(nodes, clusterOptions);
    return this.init(pubConnection, subConnection, clusterOptions.channel);
  }

  private static async init(
    pubConnection: RedisConnection | RedisClusterConnection,
    subConnection: RedisConnection | RedisClusterConnection,
    channel?: string
  ): Promise<RedisWatcher> {
    const watcher = new RedisWatcher();

    watcher.pubConnection = pubConnection;
    watcher.subConnection = subConnection;

    if (channel) {
      watcher.channel = channel;
    }

    const client = await watcher.subConnection.getRedisClient();
    // @ts-ignore - subscribe is exists.
    await client.subscribe(watcher.channel);
    client.on('message', (chan: string) => {
      if (chan !== watcher.channel) {
        return;
      }
      if (watcher.callback) {
        watcher.callback();
      }
    });

    return watcher;
  }

  private constructor() {}

  public async update(): Promise<boolean> {
    const client = await this.pubConnection.getRedisClient();
    // @ts-ignore - publish is exists.
    await client.publish(this.channel, 'casbin rules updated');
    return true;
  }

  public setUpdateCallback(callback: () => void) {
    this.callback = callback;
  }

  public async close(): Promise<void> {
    this.pubConnection.close();
    this.subConnection.close();
  }
}
