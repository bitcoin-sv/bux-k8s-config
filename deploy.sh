export BUX_DOMAIN_NAME_TLD="$1"
export BUX_HOST_IP="$2"

./replace_domain.sh
./replace_host_ip.sh
./install_microk8s.sh