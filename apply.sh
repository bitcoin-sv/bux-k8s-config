#!/usr/bin/env bash

# Temporary solution for applying all k8s changes (should be replaced with argo cd)
# For now add your file to the command

sudo sudo microk8s.kubectl apply  -f ./devops/cert-manager/cluster-issuer.yml \
                                  -f ./devops/traefik/https-redirect.yml \
                                  -f ./apps/pulse/deployment.yml \
                                  -f ./apps/pulse/service.yml \
                                  -f ./apps/pulse/ingress.yml \
                                  -f ./apps/bux-console/deployment.yml \
                                  -f ./apps/bux-console/service.yml \
                                  -f ./apps/bux-console/ingress.yml \
                                  -f ./apps/postgres-environment.yml \
                                  -f ./apps/postgres-pv.yml \
                                  -f ./apps/postgres-pvc.yml \
                                  -f ./apps/postgres-deployment.yml \
                                  -f ./apps/postgres-service.yml
