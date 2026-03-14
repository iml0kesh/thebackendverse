export const OSI_STEP_DETAILS = [
    {
        title: "Layer 7: Application",
        phase: "Host Layers (Software)",
        analogy: "Writing a letter to your friend with a specific intent (like a greeting or a request).",
        summary: "This is the layer closest to the end user. It provides network services directly to the user's applications, establishing the interface where human-computer interaction occurs.",
        technical: [
            "Function: Network applications and API endpoints operate here.",
            "Protocols: HTTP/HTTPS, FTP, SMTP, DNS, SSH.",
            "Data Unit: Message / Data.",
            "Note: The application itself (like Chrome) is not Layer 7; rather, the protocol Chrome uses (HTTP) resides here."
        ],
        code: `// Layer 7 Example: HTTP Request
GET /index.html HTTP/1.1
Host: www.example.com
User-Agent: Mozilla/5.0
Accept: application/json`
    },
    {
        title: "Layer 6: Presentation",
        phase: "Host Layers (Software)",
        analogy: "Translating the letter into a language your friend understands and putting it into a secure envelope.",
        summary: "This layer formats, encrypts, and compresses the data so that it can be understood by the receiving system, regardless of the underlying hardware or operating system.",
        technical: [
            "Function: Data translation, data compression, and encryption/decryption.",
            "Protocols/Formats: SSL/TLS, JPEG, GIF, MPEG, ASCII, JSON serialization.",
            "Data Unit: Message / Data.",
            "Security: This is where TLS encryption is typically conceptually placed."
        ],
        code: `// Layer 6 Example: JSON Serialization & Encryption
const rawData = { user: "l0kesh", status: "active" };

// 1. Format (Serialize)
const formatted = JSON.stringify(rawData);

// 2. Encrypt (TLS concept)
const encrypted = encryptWithSessionKey(formatted);`
    },
    {
        title: "Layer 5: Session",
        phase: "Host Layers (Software)",
        analogy: "Calling your friend, agreeing to talk, and keeping the line open until the conversation is over.",
        summary: "The Session layer establishes, manages, and terminates connections (sessions) between the local and remote applications.",
        technical: [
            "Function: Connection coordination, session checkpoints, and recovery.",
            "Protocols: NetBIOS, PPTP, RPC, Sockets.",
            "Data Unit: Message / Data.",
            "Management: Uses checkpoints so that if a massive download fails halfway, it can resume from the last checkpoint."
        ],
        code: `# Layer 5 Example: OS level socket connection
netstat -an

# Output showing open sessions:
# Proto  Local Address          Foreign Address        State
# TCP    192.168.1.10:54321     104.21.34.12:443       ESTABLISHED`
    },
    {
        title: "Layer 4: Transport",
        phase: "Host Layers (Software)",
        analogy: "Deciding whether to send the letter via Registered Mail (requires a signature, guaranteed delivery) or a Postcard (fast, but might get lost).",
        summary: "This layer is responsible for end-to-end communication and error-free delivery of data. It dictates *how* much data is sent and at what rate.",
        technical: [
            "Function: Segmentation and reassembly, error checking, and multiplexing.",
            "Protocols: TCP (Transmission Control Protocol - reliable), UDP (User Datagram Protocol - fast).",
            "Data Unit: Segment (TCP) or Datagram (UDP).",
            "Addressing: Uses Port Numbers (e.g., Port 80 for HTTP, 443 for HTTPS) to direct traffic to the right application."
        ],
        code: `// Layer 4 Example: TCP Segment Header Info
Source Port: 54321
Destination Port: 443 (HTTPS)
Sequence Number: 1000
Acknowledgment Number: 2001
Flags: [ACK, PSH]`
    },
    {
        title: "Layer 3: Network",
        phase: "Media Layers (Hardware/OS)",
        analogy: "The postal sorting facility reading the ZIP code to determine the best geographical route to the destination city.",
        summary: "The Network layer determines the best physical path for the data to travel across multiple interconnected networks to reach its final destination.",
        technical: [
            "Function: Logical addressing, routing, and path determination.",
            "Protocols: IPv4, IPv6, ICMP, IPSec, OSPF, BGP.",
            "Data Unit: Packet.",
            "Addressing: Uses IP Addresses to route packets across routers over the global internet."
        ],
        code: `# Layer 3 Example: IP Packet Routing
traceroute google.com

# The router looks at the Destination IP (e.g., 142.250.190.46)
# and checks its routing table to find the next hop.`
    },
    {
        title: "Layer 2: Data Link",
        phase: "Media Layers (Hardware/OS)",
        analogy: "The local mail truck driver physically driving from the sorting facility to your specific house on the street.",
        summary: "This layer facilitates node-to-node data transfer across a single physical network. It handles hardware addressing and local error detection.",
        technical: [
            "Function: MAC addressing, local switching, and framing.",
            "Protocols: Ethernet, Wi-Fi (802.11), MAC, ARP, VLANs.",
            "Data Unit: Frame.",
            "Addressing: Uses MAC Addresses (burned into the network interface card) to communicate within a local switch."
        ],
        code: `# Layer 2 Example: Checking local MAC address
arp -a

# Output maps IP to physical hardware MAC address:
# Internet Address      Physical Address      Type
# 192.168.1.1           a1-b2-c3-d4-e5-f6     dynamic`
    },
    {
        title: "Layer 1: Physical",
        phase: "Media Layers (Hardware/OS)",
        analogy: "The actual roads, tires, and gasoline that allow the mail truck to physically move.",
        summary: "The lowest layer is responsible for the actual physical connection between devices. It transmits raw, unstructured data over a physical medium.",
        technical: [
            "Function: Transmission and reception of raw bit streams over a physical medium.",
            "Hardware: Cables (Cat6, Fiber Optic), Hubs, Repeaters, Radio Frequencies.",
            "Data Unit: Bit (1s and 0s).",
            "Modulation: Converts bits into electrical voltages, light pulses, or wireless radio waves."
        ],
        code: `// Layer 1 Example: Raw binary transmission
// The Network Interface Card (NIC) converts digital data:
01001000 01101001

// Into physical signals:
// Voltage: HIGH LOW LOW HIGH LOW LOW LOW HIGH ...`
    }
];