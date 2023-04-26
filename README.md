# k8s-config
## What is it?

It holds a configuration and scripts to setup 4chain Demo environment on the vps.

## Solution

### Microk8s

---------------------------------------------------------------------------------------
We use microk8s as kubernetes platform.

#### Installation

To install it and setup on a new environment you just need to run:
```bash
./install_microk8s.sh
```

The script would try to install microk8s and configure it according to specification in [microk8s-config.yaml](microk8s-config.yaml) 

#### Changing setup of microk8s 

If you want to update some configuration of the microk8s 

Or you want to install some new [Microk8s Addons](https://microk8s.io/docs/addons)

1. Edit the file [microk8s-config.yaml](microk8s-config.yaml) according to the [documentation](https://microk8s.io/docs/ref-launch-config)
2. Commit and push changes
3. SSH to the vps
4. Pull the repository changes
5. Run 
```bash
./update_microk8s.sh
```
#### Remove Microk8s addon

Unfortunately it seems that removing addon from [microk8s-config.yaml](microk8s-config.yaml) doesn't disable addon.
Therefore, to disable addon you must:
1. SSH to the vps
2. Run
```bash
sudo microk8s disable <<ADDON_NAME>>
```

### Docker for bux server

---------------------------------------------------------------------------------------

#### sync to the newest version

Because (yet) there is no official docker image for bux-server, 
we prepared a scheduled build (GH Action) defined in [bux-version-sync.yml](./.github/workflows/bux-version-sync.yml)
This action is triggered by GH scheduler, but also there is a possibility to trigger it manually.

What is it doing:
- check what is the newest tag for bux-server (reusing workflow [check-bux-version.yml](./.github/workflows/check-bux-version.yml))
- verify if there is docker image with coresponding tag in our dockerhub repository (reusing workflow [check-bux-version.yml](./.github/workflows/check-bux-version.yml))
- if there is no coresponding version of docker image then it builds it and push (reusing workflow [build-bux.yml](./.github/workflows/build-bux.yml))
- when the new image was build and pushed then it updates bux-server version in this repository and create a PR for that change (reusing workflow [update-bux-pr.yml](./.github/workflows/update-bux-pr.yml))

#### manual actions

Several manual actions was prepared to make debugging and developing more convenience:
- [Run bux-server docker image build manually](https://github.com/gignative-solutions/k8s-config/actions/workflows/manual-build.yml) - this allows to trigger build of bux server image from given git revision and automatically will prepare a PR with changing the version to that newly built
- [[Schedule] Prepare newest version of bux-server](https://github.com/gignative-solutions/k8s-config/actions/workflows/bux-version-sync.yml) - can be manually triggered and how it's working is described in previous section
- [Check if newest bux-server exists](https://github.com/gignative-solutions/k8s-config/actions/workflows/manual-check-version.yml) - can be used to check the results of checking the newest version number of bux-server and if corresponding image exists

## Useful links

- [Microk8s Addons](https://microk8s.io/docs/addons)
  - [cert-manager](https://microk8s.io/docs/addon-cert-manager)
  - [host-path](https://microk8s.io/docs/addon-hostpath-storage)
  - [Mayastore](https://microk8s.io/docs/addon-mayastor) 

- [Argo CD](https://argo-cd.readthedocs.io/en/stable/)
