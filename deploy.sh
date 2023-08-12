sudo sh apply.sh
sudo sh update_microk8s.sh
echo "Installation complete, please navigate to https://cd.your-domain.tld which should become availble within the next 20 minutes."
echo "Argo CD password:\n"

kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d

echo "\n"