#!/usr/bin/env bash

# install snap if needed (https://snapcraft.io/docs)
sudo which snap || (sudo apt update && sudo apt install -y snapd)

# install microk8s 1.27
sudo snap install microk8s --classic --channel=1.27/stable

# apply configuration
sudo snap set microk8s config="$(cat microk8s-config.yaml)"
