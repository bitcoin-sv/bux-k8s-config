import {describe, expect, test} from '@jest/globals'
import * as core from '@actions/core'
import {run} from './action'
import * as constants from './__test__/constants'
import {setOutput} from '@actions/core'
import {mockDockerhubApi} from './__test__/mock-dockerhub-api'

describe('action test', () => {
  let setOutputMock: jest.SpyInstance

  const server = mockDockerhubApi()

  beforeAll(() => server.listen())

  // Reset any request handlers that we may add during the tests,
  // so they don't affect other tests.
  afterEach(() => server.resetHandlers())

  // Clean up after the tests are finished.
  afterAll(() => server.close())

  beforeAll(() => {
    setOutputMock = jest.spyOn(core, 'setOutput')
  })

  afterAll(() => {
    jest.restoreAllMocks()
  })

  test('run check versions of private repo', async () => {
    process.env['INPUT_DOCKERHUB_USER'] = constants.username
    process.env['INPUT_DOCKERHUB_PASSWORD'] = constants.password
    process.env['INPUT_DEPLOYMENT_FILE'] = './src/__test__/deployment.yml'

    await run()

    expect(setOutputMock.mock.calls).toMatchInlineSnapshot(`
      [
        [
          "name",
          "bux-wallet-backend-demo",
        ],
        [
          "currentVersion",
          "v0.8.0",
        ],
        [
          "repository",
          "bux-wallet-backend",
        ],
        [
          "owner",
          "4chainstudio",
        ],
        [
          "image",
          "4chainstudio/bux-wallet-backend",
        ],
        [
          "latestVersion",
          "v0.9.0",
        ],
        [
          "hasNewerImage",
          true,
        ],
      ]
    `)
  })

  test('run check versions of public repo', async () => {
    process.env['INPUT_DEPLOYMENT_FILE'] =
      './src/__test__/deployment-public-repo.yml'

    await run()

    expect(setOutputMock.mock.calls).toMatchInlineSnapshot(`
      [
        [
          "name",
          "bux-server",
        ],
        [
          "currentVersion",
          "v0.5.3",
        ],
        [
          "repository",
          "bux-server",
        ],
        [
          "owner",
          "4chainstudio",
        ],
        [
          "image",
          "4chainstudio/bux-server",
        ],
        [
          "latestVersion",
          "v0.9.0",
        ],
        [
          "hasNewerImage",
          true,
        ],
      ]
    `)
  })
})
