export const DOCKER_STEP_DETAILS = [
  {
    title: "docker run — The Command",
    phase: "Phase 1: Client",
    summary:
      "When you type `docker run`, you are talking to the Docker CLI — a thin client that does zero actual work. Its only job is to parse your flags (ports, env vars, image name) and send a REST API request to the Docker Daemon over a Unix socket. Nothing runs yet. Think of it as placing an order — the kitchen hasn't started cooking.",
    technical: [
      "Docker CLI parses your flags: -d (detach), -p (port map), --name, --memory, image:tag",
      "Serialises the config into a JSON payload and POSTs it to the Docker Daemon via HTTP",
      "Communication channel: /var/run/docker.sock (a Unix domain socket, not a network socket)",
      "The CLI then streams logs back or returns the container ID — it never touches the container directly",
      "You can talk to Docker without the CLI: curl --unix-socket /var/run/docker.sock http://localhost/v1.41/containers/json",
      "Remote Docker: set DOCKER_HOST=tcp://remote:2376 and the CLI talks over TCP instead",
    ],
    code: `# What you type:
$ docker run -d --name api -p 8080:80 --memory="512m" nginx:latest

# What the CLI actually sends (REST API):
POST /v1.41/containers/create?name=api
{
  "Image": "nginx:latest",
  "ExposedPorts": { "80/tcp": {} },
  "HostConfig": {
    "PortBindings": { "80/tcp": [{ "HostPort": "8080" }] },
    "Memory": 536870912
  }
}

# Then immediately:
POST /v1.41/containers/<container_id>/start

# You can do this yourself:
$ curl --unix-socket /var/run/docker.sock http://localhost/v1.41/info`,
  },
  {
    title: "Docker Daemon (dockerd)",
    phase: "Phase 1: Engine",
    summary:
      "The Docker Daemon (dockerd) is the background service that actually manages everything. It receives your API request, coordinates image pulling, creates the container configuration, and then delegates the low-level Linux work to containerd → runc. dockerd is the manager; runc is the one who actually flips the kernel switches.",
    technical: [
      "dockerd: Long-running background process. Manages images, volumes, networks, build cache",
      "containerd: A separate daemon that manages the container lifecycle — pull, create, start, stop, delete",
      "runc: OCI-compliant runtime. The tool that actually calls clone() and execve() to create the container process",
      "containerd-shim: A thin process that sits between containerd and runc — keeps the container alive if containerd restarts",
      "This layered design means you can swap out runc for gVisor (Google) or Kata Containers (VMs) without changing Docker",
      "Docker socket permissions: only root or docker group members can talk to dockerd by default",
    ],
    code: `// The full execution stack — top to bottom:
[ You ]
  → docker run (CLI)
    → REST API over /var/run/docker.sock
      → [ dockerd ]    (manages everything)
        → gRPC
          → [ containerd ]  (lifecycle management)
            → [ containerd-shim ]  (stays alive between restarts)
              → [ runc ]  (talks to Linux kernel)
                → clone() + execve() syscalls
                  → [ Your container process: PID 1 ]

# Check they're all running on your system:
$ ps aux | grep -E "dockerd|containerd|runc"
root   1234  dockerd
root   1289  containerd
root   2041  containerd-shim -namespace moby ...`,
  },
  {
    title: "Images & Layers (OverlayFS)",
    phase: "Phase 1: Engine",
    summary:
      "Before your container can run, Docker needs its filesystem. A Docker image is NOT a disk image or a VM snapshot — it's a stack of read-only filesystem layers, like a transparent slide stack. When you run a container, Docker adds one thin writable layer on top. This is how 10 containers can share the same 200MB base image without using 2GB of disk.",
    technical: [
      "Each Dockerfile instruction (RUN, COPY, ADD) creates a new read-only layer",
      "Layers are content-addressed by SHA256 hash — identical layers are shared across images",
      "OverlayFS: the Linux filesystem driver that merges layers. lowerdir = image layers (read-only), upperdir = container layer (writable)",
      "Copy-on-Write (CoW): if a container modifies /etc/nginx.conf, the file is copied up to upperdir before editing — the original layer is untouched",
      "docker pull only downloads layers you don't already have — layer deduplication saves huge amounts of bandwidth and disk",
      "docker history nginx shows every layer, its size, and the command that created it",
    ],
    code: `# See the layers of an image:
$ docker history nginx:latest
IMAGE          CREATED       CREATED BY                    SIZE
a12345abcdef   2 days ago    CMD ["nginx" "-g" "daemon…"]  0B
<missing>      2 days ago    COPY docker-entrypoint.sh …   4.62kB
<missing>      2 days ago    RUN apt-get install nginx     58.4MB
<missing>      2 days ago    FROM debian:bullseye-slim     80.4MB

# OverlayFS mount for a running container:
$ cat /proc/mounts | grep overlay
overlay / overlay
  lowerdir=/var/lib/docker/overlay2/abc.../diff:  ← read-only image
           /var/lib/docker/overlay2/def.../diff,
  upperdir=/var/lib/docker/overlay2/xyz.../diff,  ← writable container
  workdir=/var/lib/docker/overlay2/xyz.../work`,
  },
  {
    title: "PID Namespace — Process Isolation",
    phase: "Phase 2: Isolation",
    summary:
      "The first wall Linux builds around your container. A PID namespace gives the container a completely separate process tree. The app inside thinks it IS Process ID 1 — the master of everything. It cannot see, signal, or kill any process outside its namespace. Kill all processes in the container? The host doesn't notice.",
    technical: [
      "runc calls clone(CLONE_NEWPID) — this creates a new PID namespace in one syscall",
      "The first process in the namespace becomes PID 1 inside — even if it's PID 14328 on the host",
      "The kernel maintains a dual mapping: host PID ↔ container PID",
      "A process can only see/signal processes in its own namespace (or child namespaces)",
      "If PID 1 inside the container exits, the kernel sends SIGKILL to all other processes in that namespace — container stops",
      "docker exec spawns a new process inside the existing namespace — that's why exec'd processes see PID 1 as the app",
    ],
    code: `# Inside the container — sees only itself:
$ docker exec -it my-nginx ps aux
USER   PID %CPU COMMAND
root     1  0.0 nginx: master process
nginx    7  0.0 nginx: worker process

# On the HOST — sees the real PID:
$ ps -ef | grep nginx
root   14328  0.0 nginx: master process  ← same process!
nginx  14335  0.0 nginx: worker process

# The kernel's internal mapping:
# Container PID 1 = Host PID 14328
# Container PID 7 = Host PID 14335

# You can verify the namespace:
$ ls -la /proc/14328/ns/pid
lrwxrwxrwx /proc/14328/ns/pid -> pid:[4026532193]
# Different from the host's: pid:[4026531836]`,
  },
  {
    title: "Mount Namespace — Filesystem Isolation",
    phase: "Phase 2: Isolation",
    summary:
      "The container gets its own root filesystem (/) that has nothing to do with the host's /. Using OverlayFS (from the image layers step), the container sees a full Linux filesystem — /bin, /etc, /usr, /var — but it's all either shared read-only from the image or written to a private throw-away layer. The host's /home, /etc/passwd and everything else are invisible.",
    technical: [
      "runc calls clone(CLONE_NEWNS) to create a new mount namespace",
      "runc then calls pivot_root() or chroot() to make the container's root the image's merged OverlayFS mount",
      "The container's /proc, /sys, /dev are fresh virtual filesystems — not the host's",
      "Bind mounts (-v /host/path:/container/path) punch a hole through the namespace — maps host dir into container",
      "Named volumes are managed by Docker — stored at /var/lib/docker/volumes/<name>/_data",
      "tmpfs mounts (--tmpfs /tmp) create in-memory filesystems that vanish when the container stops",
    ],
    code: `# Container sees a full, isolated OS root:
$ docker exec my-nginx ls /
bin  boot  dev  etc  home  lib  media  mnt  opt  proc  root  run ...

# Host's /etc/passwd is NOT visible inside (different mount ns)
# The container has its OWN /etc/passwd from the nginx image

# OverlayFS layers merged into the container's /:
lowerdir = /var/lib/docker/overlay2/<layer1>/diff  ← debian base
         + /var/lib/docker/overlay2/<layer2>/diff  ← nginx install
upperdir = /var/lib/docker/overlay2/<id>/diff      ← your writes
merged   = /var/lib/docker/overlay2/<id>/merged    ← what container sees

# Bind mount: punch through the wall
$ docker run -v /host/data:/app/data nginx
# Now /app/data inside points to /host/data on the host`,
  },
  {
    title: "Network Namespace — Network Isolation",
    phase: "Phase 2: Isolation",
    summary:
      "The container gets its own private network stack — its own IP address, its own loopback (127.0.0.1), its own routing table, completely separate from the host. By default Docker connects it to a virtual bridge (docker0) using a virtual ethernet cable (veth pair). Port mapping (-p 8080:80) is just an iptables NAT rule the Docker Daemon adds on your behalf.",
    technical: [
      "runc calls clone(CLONE_NEWNET) — the container starts with only a loopback interface",
      "Docker daemon creates a veth pair: one end (eth0) inserted into the container namespace, other end attached to docker0 bridge on host",
      "docker0 is a virtual Layer 2 switch — all containers on the default network can talk to each other",
      "The container's IP (e.g. 172.17.0.2) is only routable from the host, not the outside world",
      "Port mapping: Docker adds an iptables DNAT rule — traffic to host:8080 is rewritten to 172.17.0.2:80",
      "docker network create mynet creates isolated bridges — containers on different networks cannot talk by default",
    ],
    code: `# On the host: Docker's bridge and the veth pair
$ ip link show
4: docker0: <BROADCAST,MULTICAST,UP>
    inet 172.17.0.1/16 brd 172.17.255.255  ← host end of bridge
8: veth3f4a1b@if7:                          ← host end of veth pair

# Inside the container:
$ ip addr show
7: eth0@if8:                                ← container end of veth pair
   inet 172.17.0.2/16                       ← container's IP

# The port mapping iptables rule Docker adds:
$ iptables -t nat -L DOCKER
DNAT  tcp -- 0.0.0.0/0  0.0.0.0/0  tcp dpt:8080
      → to:172.17.0.2:80

# DNS between containers (same network):
$ docker exec app1 curl http://app2:80
# Docker's embedded DNS resolves container names`,
  },
  {
    title: "Control Groups (Cgroups) — Resource Limits",
    phase: "Phase 3: Resources",
    summary:
      "Namespaces control what a container can *see*. Cgroups control what a container can *use*. Without cgroups, one container doing a memory leak or a CPU fork bomb would destroy every other container and the host. Cgroups let the kernel enforce hard limits — when a container hits its memory ceiling, the kernel's OOM Killer terminates it, protecting everyone else.",
    technical: [
      "cgroups v2 (default on modern Linux): a unified hierarchy under /sys/fs/cgroup/",
      "Memory limit: Docker writes the byte limit to memory.max in the cgroup directory",
      "CPU limit: --cpus=0.5 means the container can use at most 50% of one core across any period",
      "CPU shares: during contention, cgroups divide CPU time proportionally by weight (--cpu-shares)",
      "OOM Killer: if memory.max is exceeded, kernel kills the process with highest oom_score — usually the container's PID 1",
      "Block I/O throttling: --device-read-bps, --device-write-bps limit disk throughput per container",
    ],
    code: `# Start a container with limits:
$ docker run -d --memory="512m" --cpus="1.5" --name app nginx

# The kernel creates a cgroup directory:
/sys/fs/cgroup/system.slice/docker-<id>.scope/

# Docker wrote these files:
$ cat memory.max
536870912        ← 512 * 1024 * 1024 bytes

$ cat cpu.max
150000 100000    ← 150000/100000 = 1.5 CPUs

# See live resource usage:
$ docker stats app
CONTAINER  CPU %   MEM USAGE / LIMIT    MEM %
app        0.12%   18.5MiB / 512MiB     3.6%

# OOM Kill — what happens at 513MB:
# kernel: oom_kill_process → SIGKILL to container PID 1
# $ docker inspect app | grep OOMKilled → "OOMKilled": true`,
  },
  {
    title: "Seccomp & Capabilities — Security Hardening",
    phase: "Phase 4: Security",
    summary:
      "Even with namespaces and cgroups, the container process is still talking to the Linux kernel. A compromised container could try to call dangerous syscalls — mount a fake filesystem, load a kernel module, or reboot the host. Seccomp blocks 44+ dangerous syscalls by default. Linux Capabilities strip away dangerous root privileges even though the process appears to run as root.",
    technical: [
      "Linux Capabilities: root privileges are split into ~40 distinct capabilities (CAP_NET_BIND_SERVICE, CAP_SYS_ADMIN, etc.)",
      "Docker drops: CAP_SYS_ADMIN, CAP_SYS_MODULE, CAP_SYS_TIME, CAP_SYS_BOOT and more by default",
      "Seccomp (Secure Computing Mode): a BPF filter attached to the process — the kernel checks each syscall against the filter before running it",
      "Docker's default seccomp profile blocks: keyctl, add_key, pivot_root, create_module, and 40+ others",
      "The combination: even if an attacker gets code execution inside a container, they can't call dangerous syscalls AND they have no CAP_SYS_ADMIN",
      "--privileged flag disables ALL of this — never use in production",
    ],
    code: `# Check what capabilities the container's PID 1 has:
$ docker exec my-app capsh --print
Current: = cap_chown,cap_dac_override,cap_fowner,cap_fsetid,
           cap_kill,cap_net_bind_service,cap_net_raw,cap_setgid...

# Notice MISSING (intentionally dropped):
# cap_sys_admin    ← can't mount filesystems, change namespaces
# cap_sys_module   ← can't load kernel modules
# cap_sys_time     ← can't change system clock
# cap_sys_boot     ← can't reboot the host

# Seccomp in action — blocked syscall:
$ docker exec my-app strace -e trace=mount mount /dev/sda /mnt
mount(...)  = -1 EPERM (Operation not permitted)
#  ↑ seccomp BPF filter rejected the syscall before it even ran

# Add a capability if your app needs it:
$ docker run --cap-add NET_ADMIN myapp  # adds back network admin`,
  },
  {
    title: "Container Running — The Full Picture",
    phase: "Phase 5: Execution",
    summary:
      "All the pieces are in place. runc calls execve() to launch your application (nginx, node, python — whatever the image CMD specifies) as PID 1 inside the namespaced, cgroup-limited, seccomp-filtered environment. From the container's perspective, it IS an entire server. From the host's perspective, it's just a process with kernel restrictions. That's the entire magic of containers.",
    technical: [
      "execve() syscall: replaces the runc process with your app — your app IS the container process now",
      "PID 1 responsibility: your app must handle SIGTERM to shut down gracefully, or use an init (--init flag)",
      "Container lifetime = PID 1 lifetime: when your app exits (or crashes), the container stops",
      "Logs: stdout/stderr of PID 1 is captured by containerd-shim and accessible via docker logs",
      "docker exec spawns a NEW process inside the same namespaces — does not become PID 1",
      "Ephemeral by design: all writes to the container layer are lost on docker rm — use volumes for persistence",
    ],
    code: `# The container is running. From INSIDE it:
$ hostname
a3f8c2d1b409           ← random container ID, not the host

$ cat /etc/os-release
PRETTY_NAME="Debian GNU/Linux 11 (bullseye)"  ← image's OS

$ ip addr show eth0
inet 172.17.0.2/16     ← container's own IP

$ ps aux
PID   USER   COMMAND
  1   root   nginx: master process  ← your app IS PID 1

# From OUTSIDE on the host — it's just a process:
$ ps aux | grep nginx
14328 root   nginx: master process  ← real PID on host

# The full isolation stack active right now:
# ✓ PID Namespace   → sees only itself
# ✓ Mount Namespace → own / filesystem
# ✓ Net Namespace   → own IP, eth0
# ✓ Cgroups         → memory + CPU capped
# ✓ Seccomp         → 44 syscalls blocked
# ✓ Capabilities    → dangerous root powers dropped`,
  },
];
