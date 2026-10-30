// jest-environment-node@24 predates AbortController; etcd3's deps need it.
if (typeof globalThis.AbortController === 'undefined') {
  const { AbortController } = require('abort-controller');
  globalThis.AbortController = AbortController;
}
