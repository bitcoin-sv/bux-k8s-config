#!/usr/bin/env bash

# Temporary solution for applying all k8s changes (should be replaced with argo cd)
# For now add your file to the command

sudo sudo microk8s.kubectl apply  -f ./devops/cert-manager/cluster-issuer.yml \
                                  -f ./devops/traefik/https-redirect.yml \
                                  -f ./devops/volumes/pv.yml \
                                  -f ./apps/pulse/deployment.yml \
                                  -f ./apps/pulse/service.yml \
                                  -f ./apps/pulse/ingress.yml \
                                  -f ./apps/bux-console/environment.yml \
                                  -f ./apps/bux-console/deployment.yml \
                                  -f ./apps/bux-console/service.yml \
                                  -f ./apps/bux-console/ingress.yml \
                                  -f ./apps/bux-server/pvc.yml \
                                  -f ./apps/bux-server/postgres/postgres-environment.yml \
                                  -f ./apps/bux-server/postgres/postgres-deployment.yml \
                                  -f ./apps/bux-server/postgres/postgres-service.yml \
                                  -f ./apps/bux-server/redis/redis-deployment.yml \
                                  -f ./apps/bux-server/redis/redis-service.yml \

