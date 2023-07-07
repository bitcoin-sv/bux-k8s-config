# GitHub Action for checking version of image from deployment.yml

The GitHub Actions for checking version of the image defined in provided deployment.yml.

With ease the following data about first container image deployment.yml
- image
- version
- newest version in docker repository
- is there a newer version of image in docker repository, when comparing to deployment.yml

**⚠️ Currently it is only working for dockerhub (so not for ghcr.io) for repositories with owner (so not for official libs like postgres or redis)
**⚠️ Currently it is private action in this repository therefore before calling it you must use actions/checkout**

## Usage

### Example Workflow file

An example workflow to authenticate with GitHub Platform:

```yaml
name: 'your workflow name'
on:
  # make the workflow run manually
  workflow_dispatch:

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - name: "checkout repository"
        uses: actions/checkout@v3

      - id: check-version
        uses: ./.github/actions/check-version
        with:
          deployment_file: './deployment.yml'

      - run: | 
          echo "Name: ${{steps.check-version.outputs.name}}
                CurrentVersion: ${{steps.check-version.outputs.currentVersion}}
                Repository: ${{steps.check-version.outputs.repository}}
                Owner: ${{steps.check-version.outputs.owner}}
                Image: ${{steps.check-version.outputs.image}}
                LatestVersion: ${{steps.check-version.outputs.latestVersion}}
                HasNewerImage: ${{steps.check-version.outputs.hasNewerImage}}"

```

### Inputs

The following is an extended example with all available options.

```yaml
  # Currently it is private action to repository so before use you need to use actions/checkout first
  - id: check-version
    uses: ./.github/actions/check-version
    with:
      # Specify the path of the deployment file you want this action to update,
      # Remeber that first you need to use actions/checkout
      deployment_file: './deployment.yml'
      
      # [optional]
      # If the repository containing image is a private repository you must specify credentials
      dockerhub_user: ${{ secrets.DOCKERHUB_USERNAME }}
      dockerhub_password: ${{ secrets.DOCKERHUB_TOKEN }}

```

### Outputs

- `name`: Name of the component loaded from deployment file
- `currentVersion`: Version of component specified in deployment file
- `repository`: Dockerhub repository containing image
- `owner`: Dockerhub owner of repository containing image
- `image`: Image name
- `latestVersion`: Latest version tag in dockerhub repository
- `hasNewerImage`: True if there is a newer image in repository

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md)

## No affiliation with GitHub Inc.

GitHub are registered trademarks of GitHub, Inc. GitHub name used in this project are for identification purposes only. The project is not associated in any way with GitHub Inc. and is not an official solution of GitHub Inc. It was made available in order to facilitate the use of the site GitHub.
