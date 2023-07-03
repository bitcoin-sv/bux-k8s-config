import {expect, test} from '@jest/globals'
import {currentImage} from './current-image'
import * as semver from 'semver'

test('get current image from deployment file', () => {
  const path = './src/__test__/deployment.yml'
  const image = currentImage(path)

  expect(image).toMatchInlineSnapshot(`
    {
      "image": "4chainstudio/bux-wallet-backend",
      "name": "bux-wallet-backend-demo",
      "owner": "4chainstudio",
      "repository": "bux-wallet-backend",
      "version": "v0.8.0",
    }
  `)
})
