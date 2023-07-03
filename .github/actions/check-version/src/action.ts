import * as core from '@actions/core'
import {currentImage} from './current-image'
import {latestDockerVersionTag} from './latest-docker-version-tag'
import greaterThen from 'semver/functions/gt'

export async function run(): Promise<void> {
  const username: string = core.getInput('dockerhub_user')
  const password: string = core.getInput('dockerhub_password')
  const deploymentFile: string = core.getInput('deployment_file')

  const current = currentImage(deploymentFile)
  const latestTag = await latestDockerVersionTag({
    username: username ? username : undefined,
    password: password ? password : undefined,
    owner: current.owner,
    repository: current.repository
  })

  output('name', current.name)
  output('currentVersion', current.version)
  output('repository', current.repository)
  output('owner', current.owner)
  output('image', current.image)
  output('latestVersion', latestTag)
  output('hasNewerImage', greaterThen(latestTag, current.version))
}

function output(name: string, value: any): void {
  core.info(`outputs.${name} = ${value}`)
  core.setOutput(name, value)
}
