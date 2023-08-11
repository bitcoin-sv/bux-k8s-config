# Check if at least one argument is provided
if [ $# -lt 3 ]; then
    echo "Usage: $0 <domain-name> <host-ip> <github-username>"
    exit 1
fi

sh replace_domain.sh $1
echo "domain: $1"
sh replace_host_ip.sh $2
echo "host ip: $2"
sh replace_github_username.sh $3
echo "github username: $3"
sh install_microk8s.sh
echo "Installation complete, please navigate to https://cd.$1 which should become availble within the next 20 minutes."