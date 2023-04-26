#!/usr/bin/env bash

# Temporary solution for applying all k8s changes (should be replaced with argo cd)
# For now add your file to the command

sudo sudo microk8s.kubectl apply  -f ./devops/dashboard/ingress.yml \
                                  -f ./apps/pulse/deployment.yml \
                                  -f ./apps/pulse/service.yml \
                                  -f ./apps/pulse/ingress.yml \
