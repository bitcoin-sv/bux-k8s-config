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

## Useful links

- [Microk8s Addons](https://microk8s.io/docs/addons)
  - [cert-manager](https://microk8s.io/docs/addon-cert-manager)
  - [host-path](https://microk8s.io/docs/addon-hostpath-storage)
  - [Mayastore](https://microk8s.io/docs/addon-mayastor) 

- [Argo CD](https://argo-cd.readthedocs.io/en/stable/)
