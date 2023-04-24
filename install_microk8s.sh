#!/usr/bin/env bash

# install snap if needed (https://snapcraft.io/docs)
sudo which snap || (sudo apt update && sudo apt install -y snapd)

# install microk8s 1.27
sudo snap install microk8s --classic --channel=1.27/stable

# enable community addons so configuration update should go smoothly
sudo microk8s enable community

# apply configuration
# ATTENTION - in case if some addons doen't load run update_microk8s.sh script again
./update_microk8s.sh
