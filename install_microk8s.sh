#!/usr/bin/env bash

# install snap if needed (https://snapcraft.io/docs)
sudo which snap || (sudo apt update && sudo apt install -y snapd)

# install microk8s 1.27
sudo snap install microk8s --classic --channel=1.27/stable

# enable community addons so configuration update should go smoothly
sudo microk8s enable community
sudo microk8s enable dns
sudo microk8s enable dashboard
sudo microk8s enable helm
sudo microk8s enable helm3
sudo microk8s enable argocd
sudo microk8s enable cert-manager
sudo microk8s enable openebs
sudo microk8s enable metallb BUX_HOST_IP/32
sudo microk8s enable traefik --set="additionalArguments={--serverstransport.insecureskipverify=true,--providers.kubernetesingress.ingressendpoint.publishedservice=traefik/traefik}"
