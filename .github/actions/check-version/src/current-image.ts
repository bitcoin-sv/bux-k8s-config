import YAML from 'yaml'
import fs from 'fs'

export const currentImage = (path: string) => {
  const data = fs.readFileSync(path)
  const deployment = YAML.parse(data.toString())

  const container = deployment?.spec?.template?.spec?.containers['0']

  if (container == null) {
    throw new Error(
      `Cannot find container specification in a yaml file under path ${path}`
    )
  }

  const {name, image: imageWithVersion} = container

  const [image, version] = imageWithVersion.split(':')
  const [owner, repository] = image.split('/')

  return {
    name,
    image,
    version,
    owner,
    repository
  }
}
