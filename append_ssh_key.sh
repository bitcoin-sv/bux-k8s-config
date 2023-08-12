#!/bin/bash
# this script will add a new private key to the repository-connector-secret.yml file for argocd to use for syncing with your configuration repository.
ssh-keygen -t ed25519 -f ~/.ssh/bux_github_ssh_key -N ""
sed 's/^/    /' ~/.ssh/bux_github_ssh_key >> ./devops/argo-cd/repository-connector-secret.yml
echo "\n\n\nACTION YOU MUST TAKE: Add the following public key to your fork of the bux-k8s-config repo:\n"
cat ~/.ssh/bux_github_ssh_key.pub
echo "\n"