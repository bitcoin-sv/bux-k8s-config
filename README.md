# bux-k8s-config
## What is it?

This repo should be forked and modified to control a deployment of the BUX Reference Implementation.

## Installation

1. Set up a VPS on [Contabo](http://contabo.net) or similar.

2. Fork this repo to your own private one on github and note your github username.

3. Set up your DNS records:  

| Hostname                          | Type | Priority | Weight | Port | Target                    |
|-----------------------------------|------|----------|--------|------|---------------------------|
| _bsvalias._tcp.your-domain.tld    | SRV  | 10       | 10     | 443  | bux.your-domain.tld       |

| Hostname                          | Type  | Target (replace with your host ip) |
|-----------------------------------|-------|------------------------------------|
| your-domain.tld                   | A     | 123.45.67.89                       |
| bux.your-domain.tld               | A     | 123.45.67.89                       |
| bux-console.your-domain.tld       | A     | 123.45.67.89                       |
| bux-wallet.your-domain.tld        | A     | 123.45.67.89                       |
| cd.your-domain.tld                | A     | 123.45.67.89                       |
| pulse.your-domain.tld             | A     | 123.45.67.89                       |


4. Run the following command from your VPS - replacing the three arguments required:
 - domain name (no sub domains allowed, this should be in the form: `your-domain.tld`)
 - host IP address (IPv4 should look something like `123.45.67.89`) 
 - your github username (whichever account you just forked the config repo to in step 1.)

```bash
sudo sh setup.sh your-domain.tld your-host-ip your-github-username
```
> This script will replace the domain, ip address, and github user within the configuration files of the repo. Then it will install microk8s and configure it using those modified files.

5. Copy the ssh key which the above script printed after "ACTION YOU MUST TAKE" - add it as the deploy key to your forked config repo from step 1. - the link should be something like: [https://github.com/YOUR_GITHUB_USERNAME/bux-k8s-config/settings/keys](https://github.com/YOUR_GITHUB_USERNAME/bux-k8s-config/settings/keys)

6. Run the deploy script:
```bash
sudo sh deploy.sh
```

7. Wait for about 10 minutes as your deployment brings itself up. Once ready the wallet will accept the registration of new users at your domain: `https://bux-wallet.your-domain.tld`

---------------------------------------------------------------------------------------

## Directory structure:

```tree
  ├── apply.sh -> script to manually apply all k8s yamls
  ├── apps                      -> here we keep deployment config for applications
  │    └── <<application-name>> -> contains all config (k8s yamls) for application of name <<application-name>> that we're serving
  │          └── ...
  ├── bux-server.version
  ├── devops              -> here we keep configuration for tools such as cert-manager or argocd
  │    └── <<tool-name>>  -> contains all config (k8s yamls) for tool of name <<tool-name>> that we're deploying on k8s
  │          └── ...
  ├── docker
  |     └── <<tool-name>>.Dockerfile -> custom dockerfile used to make a custom docker image of the tool (ex. bux-server)
  ├── install_microk8s.sh   -> script that should install and prepare microk8s environment (in case if we want do an installation on clean machine)
  ├── microk8s-config.yaml  -> configuration for microk8s, used for example for enabling addons
  └── update_microk8s.sh    -> script that should update configuration of microk8s based on file microk8s-config.yaml
  ```

---------------------------------------------------------------------------------------

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
- if there is no corresponding version of docker image then it builds it and push (reusing workflow [build-bux.yml](./.github/workflows/build-bux.yml))

#### manual actions

Several manual actions was prepared to make debugging and developing more convenience:
- [Run bux-server docker image build manually](https://github.com/4chain-AG/k8s-config/actions/workflows/manual-build.yml) - this allows to trigger build of bux server image from given git revision and automatically will prepare a PR with changing the version to that newly built
- [[Schedule] Prepare newest version of bux-server](https://github.com/4chain-AG/k8s-config/actions/workflows/bux-version-sync.yml) - can be manually triggered and how it's working is described in previous section


### Automatic update of services

-----------------------------------------------------------------------

To automatically update our services we created a github workflow and a bunch of custom actions.

```tree
  └──.github
     ├── actions
     │   ├── check-version
     │        ├── action.yml -> defines action (javascript gh action) which is checking current version of the image in deployment file and in docker repository
     │   ├── update-version
     │        ├── action.yml -> defines action (composite gh action) which is checking if there is a newer versio and updating deployment file if there is
     ├── actions
         ├── update-versions.yml -> defines the workflow which is updating specified deployment files
```

#### Workflow

In a file [update-versions.yml](.github/workflows/update-versions.yml) you can find a definition of workflow.

What is it doing is:
1. Triggers for the workflow
   1. start the workflow in a scheduled manner (every 5 minutes).
   2. allow to start the workflow manually
2. Job
  - checkout the repository -> it is needed for run "private" custom actions and actually also for updating deployment files
  - run custom actions update-version with option to commit the update in current branch (`pr: false`)
  - run custom actions update-version with option to create a PR with updated deployment file

The output of running of the job is:
If version in docker repository is higher than version specified in deployment files, then deployment file is updated with the higher version and
- `pr: false` is specified, then a commit to current branch is made and pushed
- `pr: true` or no `pr` input at all, then PR is created (or updated if there is already older one) for this update


#### Update version action

In a file [update-version/action.yml](.github/actions/update-version/action.yml) 
the action for updating a single deployment file is defined.

The action is a `composite` type action which means it's set of workflow steps extracted to an action to make it reusable.

What is it doing is:
1. check the versions of the image
   1. defined in deployment file
   2. based on tags in docker repository
2. If version in docker repository is higher than version specified in deployment files, then deployment file is updated with the higher version
3. if
- `pr: false` is specified, then a commit to current branch is made and pushed
- `pr: true` or no `pr` input at all, then PR is created (or updated if there is already older one) for this update

Instruction how to use this action can be found in [README.md](.github/actions/update-version/README.md)

#### Check version action

In a file [check-version/action.yml](.github/actions/check-version/action.yml), 
there is defined an action for checking a version of image defined in deployment file.

It is a javascript action, written in typescript, compiled and aggregated to single file dist/index.js

What is it doing is:
1. parsing provided deployment.yml file
2. extracting information about container
   1. name, which becomes a name in the output
   2. image name (ex. 4chain/bux-wallet-frontend)
   3. version of the image
   4. owner (ex. 4chain)
   5. repository (ex. bux-wallet-frontend)
3. checks the docker repository for highest version number containing {major}.{minor}.{patch} information
4. checks whether highest version in repository is higher than the version in deployment file

Instruction how to use this action can be found in [README.md](.github/actions/check-version/README.md)

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

### Storage

---------------------------------------------------------------------------------------

Currently we are using **openebs** addon as PersistentVolume type.
- [openebs addon](https://microk8s.io/docs/addon-openebs) 

Steps required for using volume with PersistentVolume:
* PersistentVolume 
```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: pv
spec:
  capacity:
    storage: 20Gi
  storageClassName: openebs-hostpath
  accessModes:
    - ReadWriteOnce
  hostPath:
    path: "/var/data"
    type: DirectoryOrCreate
```
Here we speficied few things:
- capacity - 20GB,
and another important thing **openebs-hostpath** -> recommended way to use openebs with single node.

For real production environments with multiple nodes recommended storageClassName is **openebs-jiva-csi-default**.

Also we need to specify PersistentVolumeClaim type.
```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: pvc
  labels:
    app: bux
spec:
  volumeName: pv
  accessModes:
    - ReadWriteOnce
  storageClassName: openebs-hostpath
  resources:
    requests:
      storage: 10Gi

```
The most important option is to set storage to have less or equal storage capacity specified in PersistentVolume.

Then, we use defined claim&volume in deployment file this way:
```yaml

    spec:
      containers:
#...
          volumeMounts:
            - name: pv
              mountPath: /var/lib/postgresql/data
      volumes:
        - name: pv
          persistentVolumeClaim:
            claimName: pvc
```

### Postgres (config&problems)

---------------------------------------------------------------------------------------

Here we created a new thing called ConfigMap to store our environments:

```yaml
spec:
      containers:
        - name: postgres
          image: postgres:15.2-alpine3.17
          imagePullPolicy: IfNotPresent
          ports:
            - containerPort: 5432
              name: pgdb
          envFrom:
            - configMapRef:
                name: postgres-configuration
```

ConfigMap usage is pretty strightforward - we need to define envFrom section as mentioned above.
Then, our responsibility is to create environment file with ConfigMap definition.
Our env file as an example:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: postgres-configuration
  labels:
    app: bux
data:
  POSTGRES_DB: "bux"
  POSTGRES_USER: "bux"
  POSTGRES_PASSWORD: "postgres"

```
In the data section we can easily define all key-value pairs to be exposed as environment variables inside single pod.

**Something really important about postgres configuration**
**The bus problem**
> When configuring postgres we faced an issue with "bus". Pod was restarted multiple times, but without any success.
> Details provided here [hugepages_problem](https://github.com/kubernetes/kubernetes/issues/71233)
> As a result it was needed to remove hugepages declaration from sysctl.
> We needed to switch from Mayastor to OpenEBS as Mayastor needs hugepages for itself to work properly.

### ArgoCD

---------------------------------------------------------------------------------------
We are using ArgoCD as continous delivery GitOps tool.
ArgoCD is a declarative CD tool that uses Kubernetes manifests as its source of truth. 
This means that ArgoCD is able to automatically reconcile the state of the desired configuration with the actual state of the deployed system, ensuring that the system is always in the desired state.

**Installation guide**

**Traefik**
> We needed to pass additional argument to enable traefik addon:
```bash
sudo microk8s enable community
sudo microk8s enable traefik --set="additionalArguments={--serverstransport.insecureskipverify=true}"
sudo snap set microk8s config="$(cat microk8s-config.yaml)"
```
**Addons**
> Then we enable argocd addon using microk8s-config.yaml
```yaml
addons:
  ...
  - name: argocd
  ...
```
**Ingress Definition for ArgoCD**
>> ArgoCD Ingress definition was created in devops/argo-cd/ingress.yml file. 
Something quite important is that we can't change:
```yaml
      #...
      secretName: argocd-secret
      #...
```
is this secretName predefined in argocd configuration.

**Usage**

> Before your work get Admin password using this command (default login is just admin):

```sudo microk8s kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" |base64 -d ```

There are two ways of using ArgoCD - **declarative(recommended) & imperative(CLI and UI)**
Our setup base on declarative approach.

> To use ArgoCD CLI here is installation guide:
> [ArgoCD CLI](https://argo-cd.readthedocs.io/en/stable/cli_installation/)

Each of our application has it's own **argocd-def.yaml** file.

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: bux-console
  namespace: argocd
spec:
  project: default
  source:
    repoURL: git@github.com:4chain-ag/k8s-config.git
    targetRevision: HEAD
    path: apps/bux-console
  destination:
    server: https://kubernetes.default.svc
    namespace: default
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
```

We define here few important things:
* metadata -> name (must be unique),
* source with repoURL (in this example configured with SSH),
* revision which points to current HEAD (main) but we can configure it on tags etc.
* and the **path** which points to specific application folder in our repository.

> We set syncPolicy as automated which means that ArgoCD will look for changes and try to 
> apply them on our applications.
> The other way is to update each application manually.

Additional settings and explanations for declarative approach:
[ArgoCD Declarative Setup](https://argo-cd.readthedocs.io/en/stable/operator-manual/declarative-setup/)

One of the most important things is repository access - as ArgoCD is a "pulling" tool it needs to have direct
acces to our repository.

**We are using repository deploy keys (SSH keys) with r/w access**

> There are a lot of different options like basic https auth with login and password or tokens.

We created yaml file which creates repository connection for ArgoCD. You need to specify valid URL & Private Key.

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: k8s-config-rw
  namespace: argocd
  labels:
    argocd.argoproj.io/secret-type: repository
stringData:
  url: "git@github.com:4chain-ag/k8s-config.git"
  sshPrivateKey: |
    -----BEGIN OPENSSH PRIVATE KEY-----
    ...
    -----END OPENSSH PRIVATE KEY-----
```

Yaml setup for other authentication types:
[ArgoCD Declarative Setup Repositories]("https://argo-cd.readthedocs.io/en/stable/operator-manual/declarative-setup/#repositories")

## Useful links

- [Microk8s Addons](https://microk8s.io/docs/addons)
  - [cert-manager](https://microk8s.io/docs/addon-cert-manager) - Cert manager automatically issuing SSL certificates
  - [Traefik](https://microk8s.io/docs/addon-traefik) - Ingress
  - [MetalLB](https://microk8s.io/docs/addon-metallb) - Loadbalancer
  - [host-path](https://microk8s.io/docs/addon-hostpath-storage)
  - [Mayastore](https://microk8s.io/docs/addon-mayastor) 

- [Argo CD](https://argo-cd.readthedocs.io/en/stable/) - Declarative, GitOps continuous delivery tool for Kubernetes
- [Traefik](https://doc.traefik.io/traefik/providers/kubernetes-ingress/) - how to use traefik with k8s

