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

import Redis, { RedisOptions, Cluster, ClusterNode, ClusterOptions } from 'ioredis';

export type RedisClient = Redis.Cluster | Redis.Redis;

export interface Connection {
  close(): void;

  getRedisClient(): Promise<RedisClient>;
}

export class RedisConnection implements Connection {
  private readonly options?: Redis.RedisOptions | string;
  private redisClient: Redis.Redis;

  constructor(options?: RedisOptions | string) {
    this.options = options;
    // @ts-ignore - it works fine.
    this.redisClient = new Redis(this.options);
  }

  public close() {
    this.redisClient.disconnect();
  }

  public async getRedisClient(): Promise<Redis.Redis> {
    return this.redisClient;
  }
}

export class RedisClusterConnection implements Connection {
  private readonly options?: Redis.ClusterOptions;
  public redisClient: Redis.Cluster;
  public nodes: ClusterNode[];

  constructor(nodes: ClusterNode[] = [], options: ClusterOptions = {}) {
    this.nodes = nodes;
    this.options = options;
    this.redisClient = new Redis.Cluster(this.nodes, this.options);
  }

  public close() {
    this.redisClient.disconnect();
  }

  public async getRedisClient(): Promise<Redis.Cluster> {
    return this.redisClient;
  }
}
