#!/usr/bin/env bash
# Enable traefik and pass custom arguments to it: don't know how to do it with microk8s-config.yaml - set command is not working there
sudo microk8s enable traefik --set="additionalArguments={--serverstransport.insecureskipverify=true,--providers.kubernetesingress.ingressendpoint.publishedservice=traefik/traefik}"
sudo snap set microk8s config="$(cat microk8s-config.yaml)"
