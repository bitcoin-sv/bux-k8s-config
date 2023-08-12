sudo sh apply.sh
sudo sh update_microk8s.sh
echo "Installation complete, please navigate to https://cd.your-domain.tld which should become availble within the next 20 minutes."
argocdpswd=$(sudo microk8s kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d) 
printf "\nArgo CD username: admin\npassword: %s\n\n" $argocdpswd
