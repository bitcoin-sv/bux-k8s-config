# GitHub Action for updating deployment.yml

The GitHub Actions for updating version of the image defined in provided deployment.yml.

With ease:
- update image version in deployment.yml
- create PR with updated deployment yml
- or commit changed deployment.yml to current branch

**⚠️ Currently it is private action in this repository therefore before calling it you must use actions/checkout**

## Usage

### Example Workflow file

An example workflow to authenticate with GitHub Platform:

```yaml
name: 'your workflow name'
on:
  #start the workflow in a scheduled manner
  schedule:
    # Run the workflow once per hour at a half of an hour
    - cron: '30 * * * *'
  # in addition, allow to start the workflow manually
  workflow_dispatch:

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - name: "checkout repository"
        uses: actions/checkout@v3

      - uses: ./.github/actions/update-version
        with:
          deployment_file: './deployment.yml'
```

The following is an extended example with all available options.

```yaml
  # Currently it is private action to repository so before use you need to use actions/checkout first
  - uses: ./.github/actions/update-version
    with:
      # Specify the path of the deployment file you want this action to update,
      # Remeber that first you need to use actions/checkout
      deployment_file: './deployment.yml'
      
      # [optional] default: true
      # if value is set to "true" (which is default) the PR with updated deployment file will be created
      # if value is set to "false" changed deployment.yml will be committed and pushed to current branch
      pr: false
      
      # [optional]
      # If the repository containing image is a private repository you must specify credentials
      dockerhub_user: ${{ secrets.DOCKERHUB_USERNAME }}
      dockerhub_password: ${{ secrets.DOCKERHUB_TOKEN }}

```

## No affiliation with GitHub Inc.

GitHub are registered trademarks of GitHub, Inc. GitHub name used in this project are for identification purposes only. The project is not associated in any way with GitHub Inc. and is not an official solution of GitHub Inc. It was made available in order to facilitate the use of the site GitHub.
