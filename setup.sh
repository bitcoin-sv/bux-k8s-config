# Check if at least one argument is provided
if [ $# -lt 3 ]; then
    echo "Usage: $0 <domain-name> <host-ip> <github-username>"
    exit 1
fi

sudo sh replace_domain.sh "$1"
echo "domain: $1"
sudo sh replace_host_ip.sh "$2"
echo "host ip: $2"
sudo sh replace_github_username.sh "$3"
echo "github username: $3"

sudo apt install -y open-iscsi
sudo systemctl enable iscsid
sudo sh install_microk8s.sh
echo "microk8s installed"

sudo sh append_ssh_key.sh
echo "ssh key appended"