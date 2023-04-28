# k8s-config
## What is it?

It holds a configuration and scripts to setup 4chain Demo environment on the vps.

## Directory structure:

```tree
  ├── apply.sh -> script to manually apply all k8s yamls
  ├── apps                      -> here we keep deployment config for applications
  │    └── <<application-name>> -> contains all config (k8s yamls) for application of name <<application-name>> that we're serving
  │        ├── ...
  ├── bux-server.version
  ├── devops              -> here we keep configuration for tools such as cert-manager or argocd
  │    ├── <<tool-name>>  -> contains all config (k8s yamls) for tool of name <<tool-name>> that we're deploying on k8s
  │    │     └── ...
  ├── install_microk8s.sh   -> script that should install and prepare microk8s environment (in case if we want do an installation on clean machine)
  ├── microk8s-config.yaml  -> configuration for microk8s, used for example for enabling addons
  └── update_microk8s.sh    -> script that should update configuration of microk8s based on file microk8s-config.yaml
```

## Solution

### Microk8s

---------------------------------------------------------------------------------------
We use microk8s as kubernetes platform.

#### Installation

To install it and setup on a new environment you just need to run:
```bash
./install_microk8s.sh
```

The script would try to install microk8s and configure it according to specification in [microk8s-config.yaml](microk8s-config.yaml) 

#### Changing setup of microk8s 

If you want to update some configuration of the microk8s 

Or you want to install some new [Microk8s Addons](https://microk8s.io/docs/addons)

1. Edit the file [microk8s-config.yaml](microk8s-config.yaml) according to the [documentation](https://microk8s.io/docs/ref-launch-config)
2. Commit and push changes
3. SSH to the vps
4. Pull the repository changes
5. Run 
```bash
./update_microk8s.sh
```
#### Remove Microk8s addon

In [microk8s-config.yaml](microk8s-config.yaml) you can disable an addon by explicitly marking it as disabled
Example
```yaml
addons:
  - name: registry
    disable: true
```

```bash
sudo microk8s disable <<ADDON_NAME>>
```

### Docker for bux server

---------------------------------------------------------------------------------------

#### sync to the newest version

Because (yet) there is no official docker image for bux-server, 
we prepared a scheduled build (GH Action) defined in [bux-version-sync.yml](./.github/workflows/bux-version-sync.yml)
This action is triggered by GH scheduler, but also there is a possibility to trigger it manually.

What is it doing:
- check what is the newest tag for bux-server (reusing workflow [check-bux-version.yml](./.github/workflows/check-bux-version.yml))
- verify if there is docker image with coresponding tag in our dockerhub repository (reusing workflow [check-bux-version.yml](./.github/workflows/check-bux-version.yml))
- if there is no coresponding version of docker image then it builds it and push (reusing workflow [build-bux.yml](./.github/workflows/build-bux.yml))
- when the new image was build and pushed then it updates bux-server version in this repository and create a PR for that change (reusing workflow [update-bux-pr.yml](./.github/workflows/update-bux-pr.yml))

#### manual actions

Several manual actions was prepared to make debugging and developing more convenience:
- [Run bux-server docker image build manually](https://github.com/gignative-solutions/k8s-config/actions/workflows/manual-build.yml) - this allows to trigger build of bux server image from given git revision and automatically will prepare a PR with changing the version to that newly built
- [[Schedule] Prepare newest version of bux-server](https://github.com/gignative-solutions/k8s-config/actions/workflows/bux-version-sync.yml) - can be manually triggered and how it's working is described in previous section
- [Check if newest bux-server exists](https://github.com/gignative-solutions/k8s-config/actions/workflows/manual-check-version.yml) - can be used to check the results of checking the newest version number of bux-server and if corresponding image exists


### Deployment of applications and exposing them on domain address

---------------------------------------------------------------------------------------

As an example I will use configuration for libsv/pulse service

```tree
  ├── apps
  │    └── pulse
  │        ├── deployment.yml
  │        ├── ingress.yml
  │        └── service.yml
```
#### `deployment.yml` [example](./apps/pulse/deployment.yml)

Contains k8s declaration how pulse service should be deployed.

```yaml
  replicas: 1
  #...
  strategy:
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
    type: RollingUpdate
```

Currently we're deploying only one replica of the pulse.

It's worth mentioning that we're using RollingUpdate policy 
so during the deployment of a new version of the image, service should be available and smoothly switched from old version to the new one.

```yaml
    #....
    spec:
      containers:
        - name: pulse
          image: libsv/pulse:v0.1.0
          args:
            - --preloaded
```

We're providing argument `--preloaded` to the image so the script in the docker image can consume this argument 
and actually in case of pulse `--preloaded` argument is used to download preloaded database of headers.

```yaml
    #....
    spec:
      containers:
          # ...
          ports:
            - containerPort: 8080
              name: web
              protocol: TCP
```

We're exposing port 8080 under the name web, so it can be exposed further by service definition just by referencing it by name

#### `service.yml` [example](./apps/pulse/service.yml)

```yaml
spec:
  #...
  type: ClusterIP
```

We're exposing service only with ClusterIP here. And actually this is the default way to go for all our services.
To expose service on a public IP (or on a domain) we use Ingress.

```yaml
spec:
  #...
  ports:
    - name: web # this is the name with which we're exposing a port on a ClusterIp
      port: 80  # this is the port with which we're exposing a port on a ClusterIp
      targetPort: web # this is the name of the port from deployment.yaml
```

We're exposing application port named `web` (which is defined in `deployment.yaml` and actually has number `8080`)
on a port 80 on a ClusterIp and give it a name `web` which can be referenced in other configs (ex. in Ingress).


#### `ingress.yml` [example](./apps/pulse/ingress.yml)

Here we have defined ingress rule that is exposing application on the domain.

```yaml
spec:
  #...
  rules:
    - host: pulse.4chain.space # here is a domain name we need to match
      http:
        paths:
          - path: /            # match against the path. `/` means root path
            pathType: Prefix   # type of matching against the path -> match the path prefixed with `/` 
            backend:
              service:
                name: pulse    # name of k8s service that should handle the request
                port:
                  name: web  # refer to port named web in service.yml
```

We're defining a rule, that when someone will call
- a domain `pulse.4chain.space`
- at the path prefixed with `/` (what in case of Ingress means any path)
then it ingress controller should pass the request to
- service named `pulse` - by service we mean k8s service
- to the port referenced by name = `web`

```yaml
metadata:
  #...
  annotations:
    #...
    traefik.ingress.kubernetes.io/router.entrypoints: websecure
```

Disables handling of https request. We have a traefik Router configuration that will redirect all http calls to https, 
so we can disable handing http by service here.

```yaml
metadata:
  #...
  annotations:
    cert-manager.io/cluster-issuer: lets-encrypt      # bind to cert manager configuration for issuing certs
    traefik.ingress.kubernetes.io/router.entrypoints: websecure
spec:
  tls:
    - hosts:
        - pulse.4chain.space # setup domain name for which we want to have secured communication
      secretName: pulse-tls  # provide a name for a secret in which certificate will be stored for that domain
```

To automatically generate SSL/TLS certificate for our domain we need above configuration for ingress.


### Automatic issuing SSL/TLS certificate

---------------------------------------------------------------------------------------

To automatically issue SSL/TLS certificates we use [cert-manager addon](https://microk8s.io/docs/addon-cert-manager).

After installing it, we need to prepare configuration of a ClusterIssuer which is plased in a file [cluster-issuer.yml](./devops/cert-manager/cluster-issuer.yml) .

```yaml
metadata:
  name: lets-encrypt
```

It's worth pointing that we named the cluster issuer as a `lets-encrypt`.

We're using that later in all Ingress configurations that use an SSL as a value of an annotation `cert-manager.io/cluster-issuer`.

To use cert manager in a Ingress configuration we need the following entries:

```yaml
metadata:
  #...
  annotations:
    cert-manager.io/cluster-issuer: lets-encrypt      # bind to cert manager configuration for issuing certs
    traefik.ingress.kubernetes.io/router.entrypoints: websecure


spec:
  tls:
    - hosts:
        - example.4chain.space # setup domain name for which we want to have secured communication
      secretName: example-tls  # provide a name for a secret in which certificate will be stored for that domain
```

ℹ️ You can find example of Ingress with SSL and domain in [pulse/ingress.yml](./apps/pulse/ingress.yml)

## Useful links

- [Microk8s Addons](https://microk8s.io/docs/addons)
  - [cert-manager](https://microk8s.io/docs/addon-cert-manager) - Cert manager automatically issuing SSL certificates
  - [Traefik](https://microk8s.io/docs/addon-traefik) - Ingress
  - [MetalLB](https://microk8s.io/docs/addon-metallb) - Loadbalancer
  - [host-path](https://microk8s.io/docs/addon-hostpath-storage)
  - [Mayastore](https://microk8s.io/docs/addon-mayastor) 

- [Argo CD](https://argo-cd.readthedocs.io/en/stable/) - Declarative, GitOps continuous delivery tool for Kubernetes
- [Traefik](https://doc.traefik.io/traefik/providers/kubernetes-ingress/) - how to use traefik with k8s

