import {mockDockerhubApi} from './__test__/mock-dockerhub-api'
import {latestDockerVersionTag} from './latest-docker-version-tag'
import * as constants from './__test__/constants'
import {expect, test, describe} from '@jest/globals'

describe('get latest full version tag', () => {
  const server = mockDockerhubApi()

  beforeAll(() => server.listen())

  // Reset any request handlers that we may add during the tests,
  // so they don't affect other tests.
  afterEach(() => server.resetHandlers())

  // Clean up after the tests are finished.
  afterAll(() => server.close())

  test('from private repository', async () => {
    const tag = await latestDockerVersionTag({
      owner: constants.owner,
      repository: constants.privateRepository,
      username: constants.username,
      password: constants.password
    })

    expect(tag).toMatchInlineSnapshot(`"v0.9.0"`)
  })

  test('from public repository', async () => {
    const tag = await latestDockerVersionTag({
      owner: constants.owner,
      repository: constants.publicRepository
    })

    expect(tag).toMatchInlineSnapshot(`"v0.9.0"`)
  })

  test('throws exception when username is specified and not password', async () => {
    await expect(async () =>
      latestDockerVersionTag({
        owner: constants.owner,
        repository: constants.privateRepository,
        username: constants.username
      })
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Both username and password must be specified, or none of them"`
    )
  })

  test('throws exception when password is specified and not username', async () => {
    await expect(async () =>
      latestDockerVersionTag({
        owner: constants.owner,
        repository: constants.privateRepository,
        password: constants.password
      })
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Both username and password must be specified, or none of them"`
    )
  })
})
