// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// lab-transform-typescript declares the TypeScript helper set as
// globals when compiling tests with typescript 5; whitelist them so
// lab's leak detection passes.
module.exports = {
  globals: [
    '__extends', '__assign', '__rest', '__decorate', '__param',
    '__esDecorate', '__runInitializers', '__propKey', '__setFunctionName',
    '__metadata', '__awaiter', '__generator', '__exportStar',
    '__createBinding', '__values', '__read', '__spread', '__spreadArrays',
    '__spreadArray', '__await', '__asyncGenerator', '__asyncDelegator',
    '__asyncValues', '__makeTemplateObject', '__importStar',
    '__importDefault', '__classPrivateFieldGet', '__classPrivateFieldSet',
    '__classPrivateFieldIn', '__addDisposableResource', '__disposeResources',
    '__rewriteRelativeImportExtension',
  ].join(','),
};
