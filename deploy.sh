# Check if at least one argument is provided
if [ $# -lt 3 ]; then
    echo "Usage: $0 <domain-name> <host-ip> <github-username>"
    exit 1
fi

./replace_domain.sh $1
./replace_host_ip.sh $2
./replace_github_username.sh $3
./install_microk8s.sh