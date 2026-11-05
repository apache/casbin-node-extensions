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
import { ClientConfig, Subscription, Message } from '@google-cloud/pubsub';
import { PubsubConnection } from './pubsub';

export class PubsubWatcher implements Watcher {
  private topicName: string;
  private subscriptionName: string;
  private subscription: Subscription;
  private pubsubConnection: PubsubConnection;

  private callback: () => void;

  public static newWatcher(options?: ClientConfig, topicName?: string, subscriptionName?: string): PubsubWatcher {
    return new PubsubWatcher(options, topicName, subscriptionName);
  }

  private constructor(options?: ClientConfig, topicName?: string, subscriptionName?: string) {
    this.topicName = topicName || 'casbin';
    this.subscriptionName = subscriptionName || 'sub_casbin';

    this.pubsubConnection = new PubsubConnection(options);
    this.pubsubConnection.open();

    this.subscription = this.pubsubConnection.client.topic(this.topicName).subscription(this.subscriptionName);
    // Purge all messages, no need to replay as casbin cache will be updated at start up
    this.subscription
      .seek(new Date())
      .then(() => {
        this.subscription.on('message', this.messageHandler.bind(this));
      })
      .catch(() => {});
  }

  private messageHandler(message: Message): void {
    console.log(`Debug: ${this.subscriptionName} got message ID: ${message.id}`);
    message.ack();
    if (this.callback) {
      this.callback();
    }
  }

  public async update(): Promise<boolean> {
    await this.pubsubConnection.client.topic(this.topicName).publishMessage({ data: Buffer.from('casbin updated') });
    return true;
  }

  public setUpdateCallback(callback: () => void): void {
    this.callback = callback;
  }

  public async close(): Promise<void> {
    this.subscription.removeListener('message', this.messageHandler.bind(this));
    await this.subscription.close();
    await this.pubsubConnection.close();
  }
}
