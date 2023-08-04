#!/usr/bin/env bash

# Temporary solution for applying all k8s changes (should be replaced with argo cd)
# For now add your file to the command

sudo microk8s kubectl apply \
  -f ./devops/cert-manager/cluster-issuer.yml \
  -f ./devops/traefik/https-redirect.yml \
  -f ./devops/argo-cd/ingress.yml;

sudo microk8s kubectl apply \
  -f ./apps/pulse/deployment.yml \
  -f ./apps/pulse/service.yml \
  -f ./apps/pulse/ingress.yml;

sudo microk8s kubectl apply \
  -f ./apps/bux-console/environment.yml \
  -f ./apps/bux-console/deployment.yml \
  -f ./apps/bux-console/service.yml \
  -f ./apps/bux-console/ingress.yml;

sudo microk8s kubectl apply \
  -f ./apps/bux-server/postgres/environment.yml \
  -f ./apps/bux-server/postgres/pvc.yml \
  -f ./apps/bux-server/postgres/deployment.yml \
  -f ./apps/bux-server/postgres/service.yml \
  -f ./apps/bux-server/redis/pvc.yml \
  -f ./apps/bux-server/redis/deployment.yml \
  -f ./apps/bux-server/redis/service.yml;
  
sudo microk8s kubectl apply -k apps/bux-server/bux/development;

sudo microk8s kubectl apply \
  -f ./apps/bux-wallet/postgres/environment.yml \
  -f ./apps/bux-wallet/postgres/pvc.yml \
  -f ./apps/bux-wallet/postgres/deployment.yml \
  -f ./apps/bux-wallet/postgres/service.yml \
  -f ./apps/bux-wallet/backend/environment.yml \
  -f ./apps/bux-wallet/backend/deployment.yml \
  -f ./apps/bux-wallet/backend/service.yml \
  -f ./apps/bux-wallet/backend/ingress.yml \
  -f ./apps/bux-wallet/frontend/ingress.yml \
  -f ./apps/bux-wallet/frontend/environment.yml \
  -f ./apps/bux-wallet/frontend/service.yml \
  -f ./apps/bux-wallet/frontend/deployment.yml;

sudo microk8s kubectl -n argocd apply \
      -f ./devops/argo-cd/repository-connector-secret.yml \
      -f ./apps/bux-console/argocd-def.yml \
      -f ./apps/pulse/argocd-def.yml \
      -f ./apps/bux-server/postgres/argocd-def.yml \
      -f ./apps/bux-server/redis/argocd-def.yml \
      -f ./apps/bux-server/bux/development/argocd-def.yml \
      -f ./apps/bux-wallet/postgres/argocd-def.yml \
      -f ./apps/bux-wallet/frontend/argocd-def.yml \
      -f ./apps/bux-wallet/backend/argocd-def.yml;


