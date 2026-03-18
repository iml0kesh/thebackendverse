export const DOCKER_STEP_DETAILS = [
    {
        title: "1. The 'docker run' Request",
        phase: "Phase 1: Client",
        analogy: "Ordering a fully-furnished, self-contained tiny house from a catalog.",
        summary: "When you type `docker run` into your terminal, you are interacting with the Docker Client. The Client doesn't actually run containers; it acts as an interface that packages your command into a REST API request and sends it to the Docker Daemon.",
        technical: [
            "Docker CLI: The command-line tool parses your arguments (like port mappings or environment variables).",
            "Docker API: The CLI sends a standard HTTP POST request to the Docker Daemon.",
            "Unix Socket / TCP: The communication typically happens over a local Unix socket (/var/run/docker.sock) or remotely over TCP."
        ],
        code: `# You type this in your terminal:
$ docker run -d --name my-nginx -p 8080:80 nginx:latest

# Under the hood, the CLI makes an API call like:
# POST /v1.41/containers/create?name=my-nginx
# POST /v1.41/containers/<ID>/start`
    },
    {
        title: "2. The Docker Daemon & containerd",
        phase: "Phase 2: Engine",
        analogy: "The factory foreman receiving the order, getting the blueprints, and passing it to the builders.",
        summary: "The Docker Daemon (dockerd) receives the API request. It checks if it has the requested image locally. If not, it pulls it. Then, it delegates the actual creation of the container to `containerd` and `runc`.",
        technical: [
            "dockerd: Manages the high-level API, images, volumes, and networks.",
            "containerd: Manages the complete container lifecycle of its host system, from image transfer to execution.",
            "runc: The lowest-level OCI (Open Container Initiative) runtime. It is the actual tool that talks to the Linux kernel to create namespaces and cgroups."
        ],
        code: `// The execution stack hierarchy
[ Docker CLI ] -> REST API
  -> [ dockerd ] -> gRPC
    -> [ containerd ]
      -> [ containerd-shim ]
        -> [ runc ] (creates the container process)`
    },
    {
        title: "3. PID Namespace (Process Isolation)",
        phase: "Phase 3: Linux Isolation",
        analogy: "Giving someone a VR headset. They look around and think they are the only person in the world, entirely unaware of the room they are actually in.",
        summary: "Linux PID (Process ID) Namespaces isolate the process tree. Because of this, the application running inside the container thinks it is Process ID 1 (the master process). It cannot see or affect any processes running outside its container.",
        technical: [
            "clone() syscall: runc uses the clone() system call with the CLONE_NEWPID flag to create a new process tree.",
            "Process Mapping: The host kernel keeps a mapping. What is PID 1 inside the container might be PID 14328 on the host.",
            "Isolation: If a container gets compromised, the attacker cannot kill or inspect host processes."
        ],
        code: `# Inside the container:
$ ps aux
USER   PID %CPU %MEM COMMAND
root     1  0.0  0.0 nginx: master process

# On the Host machine (outside the container):
$ ps -ef | grep nginx
root   14328  0.0  0.1 nginx: master process
# Notice how the host sees the real PID!`
    },
    {
        title: "4. Mount Namespace & UnionFS (Filesystem)",
        phase: "Phase 3: Linux Isolation",
        analogy: "A library where you can read any book. If you try to draw in a book, a transparent sticky note is placed over the page so you only draw on the note, leaving the original book pristine.",
        summary: "The Mount Namespace isolates the list of mount points seen by the processes. Union Filesystems (like OverlayFS) allow Docker to share the base image files (read-only) among multiple containers while giving each container its own thin, writable top layer.",
        technical: [
            "Mount Namespace (CLONE_NEWNS): Gives the container its own distinct root directory (/).",
            "OverlayFS: Uses a 'lowerdir' (the read-only image layers) and an 'upperdir' (the writable container layer).",
            "Copy-on-Write (CoW): If a container modifies a file from the image, Docker copies the file up to the writable layer before editing it."
        ],
        code: `# OverlayFS mounting mechanics (simplified)
lowerdir=/var/lib/docker/overlay2/<layer1>:<layer2> # The base image
upperdir=/var/lib/docker/overlay2/<id>/diff         # Writable layer
merged=/var/lib/docker/overlay2/<id>/merged         # What the container sees

# Inside the container, it just looks like a normal OS:
$ ls /
bin  boot  dev  etc  home  lib  media  mnt  opt  proc  root  run ...`
    },
    {
        title: "5. Network Namespace",
        phase: "Phase 3: Linux Isolation",
        analogy: "A private intercom system in an office building that connects straight to the main switchboard, skipping all other offices.",
        summary: "The Network Namespace gives the container its own isolated network stack. It gets its own loopback interface (localhost), routing table, and IP address, completely separate from the host's main network interfaces.",
        technical: [
            "CLONE_NEWNET: The system call flag that isolates the network.",
            "Virtual Ethernet (veth): Docker creates a 'veth pair'—a virtual wire. One end is put inside the container (as eth0), and the other end is attached to the host's virtual bridge (docker0).",
            "NAT & iptables: The host uses iptables to route traffic from the host's real IP address into the container's private IP."
        ],
        code: `# Checking interfaces on the Host
$ ip link show
4: docker0: <BROADCAST,MULTICAST,UP> ... # The Docker Bridge
6: veth1a2b3c@if5: <BROADCAST,MULTICAST,UP> ... # Half of the virtual wire

# Inside the container:
$ ip addr
5: eth0@if6: <BROADCAST,MULTICAST,UP> ... # The other half!
   inet 172.17.0.2/16 scope global eth0`
    },
    {
        title: "6. Control Groups (Cgroups) & Resources",
        phase: "Phase 4: Resource Management",
        analogy: "Putting a strict restrictor plate on a race car engine so it physically cannot use more than its allocated share of gasoline.",
        summary: "While Namespaces isolate what a container can *see*, Cgroups limit what a container can *use*. Control Groups prevent a single container from consuming 100% of the host's CPU or Memory, ensuring the host and other containers stay healthy.",
        technical: [
            "cgroups: A Linux kernel feature that limits, accounts for, and isolates the resource usage (CPU, memory, disk I/O, network) of a collection of processes.",
            "OOM Killer: If a container exceeds its memory limit, the Linux Out-Of-Memory killer will forcefully terminate the container process.",
            "CPU Shares: Determines how much CPU time a container gets relative to others during high load."
        ],
        code: `# Limiting a container to 512MB of RAM
$ docker run -d --memory="512m" nginx

# Linux enforces this via the cgroup filesystem:
$ cat /sys/fs/cgroup/memory/docker/<id>/memory.limit_in_bytes
536870912  # (512 * 1024 * 1024)

# If the app leaks memory and hits 513MB, the kernel kills it.`
    },
    {
        title: "7. Security: Seccomp & Capabilities",
        phase: "Phase 5: Security Restrictions",
        analogy: "Giving an employee a master keycard (Root), but modifying the building locks so that keycard specifically won't open the armory or the breaker room.",
        summary: "By default, the process inside a Docker container runs as 'root'. However, it's not a true, omnipotent root. Docker drops dangerous Linux Capabilities and uses Seccomp to block dangerous system calls.",
        technical: [
            "Capabilities: Linux breaks down root privileges into discrete units. Docker drops privileges like CAP_SYS_TIME (changing the clock) and CAP_SYS_BOOT (rebooting the host).",
            "Seccomp (Secure Computing): A kernel feature that filters system calls. Docker's default profile blocks about 44 out of 300+ system calls.",
            "AppArmor/SELinux: Additional Mandatory Access Control (MAC) layers often applied to further restrict the container."
        ],
        code: `# Checking Capabilities of PID 1 inside the container
$ capsh --print
Current: = cap_chown,cap_dac_override,cap_fowner...

# Notice what is missing:
# - CAP_SYS_ADMIN (The 'god mode' capability is dropped)
# - CAP_SYS_MODULE (Cannot load kernel modules)

# Because of Seccomp, if a hacker tries to mount a fake disk,
# the kernel simply denies the syscall entirely.`
    },
    {
        title: "8. The Container is Running",
        phase: "Phase 6: Execution",
        analogy: "The tiny house is dropped onto the lot, completely self-sufficient. It pays its own bills (resources) and locks its own doors (security).",
        summary: "With namespaces isolating the view, UnionFS providing the files, cgroups limiting the resources, and seccomp securing the boundaries, the setup is complete. `runc` executes the entrypoint process, and the container is alive.",
        technical: [
            "execve: The system call used by the runtime to finally execute the user's application (e.g., node server.js or nginx).",
            "Process Lifecycle: The container's lifespan is tied directly to this PID 1 process. When this process exits, the container stops.",
            "Ephemeral Nature: Because the writable layer is temporary, deleting the container destroys all state unless mounted via external volumes."
        ],
        code: `# Tailing the logs of the running container
$ docker logs my-nginx
10.0.0.5 - - [10/Nov/2023:14:32:01 +0000] "GET / HTTP/1.1" 200 ...

# The container is completely oblivious to the rest of the host.
# From its perspective, it is an entire, freshly booted OS
# running its sole purpose in life: serving web traffic.`
    }
];