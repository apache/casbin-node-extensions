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

const { app, assert } = require('egg-mock/bootstrap')

describe('pass through tests', () => {
  it('test: p, alice, /dataset1/*, GET', async () => {
    app.mockCsrf()
    app.mockCsrf()
    const response = await app.httpRequest()
      .get('/dataset1/resource1')
      .set('Authorization', 'alice')
    assert(response.status === 200)
  })

  it('test: p, alice, /dataset1/resource1, POST', async () => {
    app.mockCsrf()
    const response = await app.httpRequest()
      .post('/dataset1/resource1')
      .set('Authorization', 'alice')
    assert(response.status === 200)
  })

  it('test: bob, /dataset2/folder1/*, POST', async () => {
    app.mockCsrf()
    const response = await app.httpRequest()
      .post('/dataset2/folder1/file')
      .set('Authorization', 'bob')
    assert(response.status === 200)
  })

  it('test: p, bob, /dataset2/resource1, * - GET', async () => {
    app.mockCsrf()
    const response = await app.httpRequest()
      .get('/dataset2/resource1')
      .set('Authorization', 'bob')
    assert(response.status === 200)
  })

  it('test: p, bob, /dataset2/resource1, * - POST', async () => {
    app.mockCsrf()
    const response = await app.httpRequest()
      .post('/dataset2/resource1')
      .set('Authorization', 'bob')
    assert(response.status === 200)
  })

  it('test: p, bob, /dataset2/resource1, * - PUT', async () => {
    app.mockCsrf()
    const response = await app.httpRequest()
      .put('/dataset2/resource1')
      .set('Authorization', 'bob')
    assert(response.status === 200)
  })

  it('test: p, bob, /dataset2/resource1, * - DELETE', async () => {
    app.mockCsrf()
    const response = await app.httpRequest()
      .delete('/dataset2/resource1')
      .set('Authorization', 'bob')
    assert(response.status === 200)
  })

  it('test: p, bob, /dataset2/resource2, GET', async () => {
    app.mockCsrf()
    const response = await app.httpRequest()
      .get('/dataset2/resource2')
      .set('Authorization', 'bob')
    assert(response.status === 200)
  })

  it('test: p & g, dataset1_admin, /dataset1/*, * - GET', async () => {
    app.mockCsrf()
    const response = await app.httpRequest()
      .get('/dataset1/resource')
      .set('Authorization', 'cathy')
    assert(response.status === 200)
  })

  it('test: p & g, dataset1_admin, /dataset1/*, * - POST', async () => {
    app.mockCsrf()
    const response = await app.httpRequest()
      .post('/dataset1/resource')
      .set('Authorization', 'cathy')
    assert(response.status === 200)
  })

  it('test: p & g, dataset1_admin, /dataset1/*, * - PUT', async () => {
    app.mockCsrf()
    const response = await app.httpRequest()
      .put('/dataset1/resource')
      .set('Authorization', 'cathy')
    assert(response.status === 200)
  })

  it('test: p & g, dataset1_admin, /dataset1/*, * - DELETE', async () => {
    app.mockCsrf()
    const response = await app.httpRequest()
      .delete('/dataset1/resource')
      .set('Authorization', 'cathy')
    assert(response.status === 200)
  })
})

describe('success through tests', () => {
  it('test: p, alice, /dataset1/*, GET - 403', async () => {
    app.mockCsrf()
    const response = await app.httpRequest()
      .post('/dataset1/users')
      .set('Authorization', 'alice')
    assert(response.status === 403)
  })

  it('test: p, alice, /dataset1/resource1, POST - 403', async () => {
    app.mockCsrf()
    const response = await app.httpRequest()
      .post('/dataset1/resource')
      .set('Authorization', 'alice')
    assert(response.status === 403)
  })

  it('test: bob, /dataset2/folder1/*, POST', async () => {
    app.mockCsrf()
    const response = await app.httpRequest()
      .put('/dataset2/folder1/file')
      .set('Authorization', 'bob')
    assert(response.status === 403)
  })

  it('test: p, bob, /dataset2/resource1, * - GET', async () => {
    app.mockCsrf()
    const response = await app.httpRequest()
      .get('/dataset2/resource')
      .set('Authorization', 'bob')
    assert(response.status === 403)
  })

  it('test: p, bob, /dataset2/resource1, * - POST', async () => {
    app.mockCsrf()
    const response = await app.httpRequest()
      .post('/dataset2/resource')
      .set('Authorization', 'bob')
    assert(response.status === 403)
  })

  it('test: p, bob, /dataset2/resource1, * - PUT', async () => {
    app.mockCsrf()
    const response = await app.httpRequest()
      .put('/dataset2/resource')
      .set('Authorization', 'bob')
    assert(response.status === 403)
  })

  it('test: p, bob, /dataset2/resource1, * - DELETE', async () => {
    app.mockCsrf()
    const response = await app.httpRequest()
      .delete('/dataset2/resource')
      .set('Authorization', 'bob')
    assert(response.status === 403)
  })

  it('test: p, bob, /dataset2/resource2, GET', async () => {
    app.mockCsrf()
    const response = await app.httpRequest()
      .post('/dataset2/resource2')
      .set('Authorization', 'bob')
    assert(response.status === 403)
  })

  it('test: p & g, dataset1_admin, /dataset1/*, * - GET', async () => {
    app.mockCsrf()
    const response = await app.httpRequest()
      .get('/dataset1/resource')
      .set('Authorization', 'chalin')
    assert(response.status === 403)
  })

  it('test: p & g, dataset1_admin, /dataset1/*, * - POST', async () => {
    app.mockCsrf()
    const response = await app.httpRequest()
      .post('/dataset1/resource')
      .set('Authorization', 'chalin')
    assert(response.status === 403)
  })

  it('test: p & g, dataset1_admin, /dataset1/*, * - PUT', async () => {
    app.mockCsrf()
    const response = await app.httpRequest()
      .put('/dataset1/resource')
      .set('Authorization', 'chalin')
    assert(response.status === 403)
  })

  it('test: p & g, dataset1_admin, /dataset1/*, * - DELETE', async () => {
    app.mockCsrf()
    const response = await app.httpRequest()
      .delete('/dataset1/resource')
      .set('Authorization', 'chalin')
    assert(response.status === 403)
  })
})
