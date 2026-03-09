export const OSI_STEP_DETAILS = [
    {
        title: "1. Application Layer (Layer 7)",
        phase: "Phase 1: Software",
        summary:
            "This is the layer you see and interact with. It's not the application itself (like Chrome), but the protocols the application uses to communicate (like HTTP). It's closest to the end user.",
        technical: [
            "Protocols: HTTP, HTTPS, FTP, SMTP, DNS.",
            "User Interface interaction happens here.",
            "PDU (Protocol Data Unit): Data.",
        ],
        code: `// Browser sending an HTTP request
GET /index.html HTTP/1.1
Host: www.example.com
User-Agent: Mozilla/5.0`,
    },
    {
        title: "2. Presentation Layer (Layer 6)",
        phase: "Phase 1: Software",
        summary:
            "This layer translates data into a format the application can understand. It handles encryption (making data secure) and compression (making data smaller). It's the 'translator' of the network.",
        technical: [
            "Data formatting (ASCII, EBCDIC, JSON).",
            "Encryption/Decryption (SSL/TLS often conceptually lives here).",
            "Compression/Decompression.",
        ],
        code: `// Data before Presentation:
{ "message": "Hello" }

// Data after Encryption (Presentation):
Encrypted: a8f5c2b9...`,
    },
    {
        title: "3. Session Layer (Layer 5)",
        phase: "Phase 1: Software",
        summary:
            "This layer acts like a session manager. It establishes, maintains, and terminates connections between applications. It ensures that different application data streams are kept separate.",
        technical: [
            "Session management (Authentication, Reconnection).",
            "APIs, Sockets, WinSock.",
            "Controls dialog control (simplex, half-duplex, full-duplex).",
        ],
        code: `// Session ID established
Session-ID: 12345abcde

// Keep-Alive signals to maintain session`,
    },
    {
        title: "4. Transport Layer (Layer 4)",
        phase: "Phase 2: Transport",
        summary:
            "The 'Postman' of the model. It ensures data gets to the right place reliably. It breaks large data into smaller chunks called 'Segments' and handles error checking.",
        technical: [
            "Protocols: TCP (Reliable), UDP (Fast).",
            "Segmentation: Breaking data into chunks.",
            "Port Numbers: Addressing specific applications (e.g., Port 80 for Web).",
            "PDU: Segment.",
        ],
        code: `// TCP Segment Header
Source Port: 54321
Destination Port: 80
Sequence Number: 1
Ack Number: 0`,
    },
    {
        title: "5. Network Layer (Layer 3)",
        phase: "Phase 3: Hardware",
        summary:
            "This layer handles logical addressing (IP addresses) and routing. It decides the best physical path for the data to reach its destination across different networks.",
        technical: [
            "Protocols: IP (IPv4, IPv6), ICMP.",
            "Devices: Routers.",
            "Logical Addressing (IP Addresses).",
            "PDU: Packet.",
        ],
        code: `// IP Packet Header
Source IP: 192.168.1.5
Dest IP: 172.217.16.14
TTL: 64`,
    },
    {
        title: "6. Data Link Layer (Layer 2)",
        phase: "Phase 3: Hardware",
        summary:
            "This layer handles physical addressing (MAC addresses). It ensures error-free transfer of data frames between two directly connected nodes (like your computer and your router).",
        technical: [
            "Devices: Switches, Bridges.",
            "Physical Addressing (MAC Addresses).",
            "Error detection (FCS/CRC).",
            "PDU: Frame.",
        ],
        code: `// Ethernet Frame
Dest MAC: 00:1A:2B:3C:4D:5E
Source MAC: 00:5E:4D:3C:2B:1A
EtherType: IPv4`,
    },
    {
        title: "7. Physical Layer (Layer 1)",
        phase: "Phase 3: Hardware",
        summary:
            "The actual physical hardware. Cables, fiber optics, radio waves. It transmits raw bits (1s and 0s) over the physical medium.",
        technical: [
            "Devices: Hubs, Cables (Cat6, Fiber), Network Cards (NIC).",
            "Transmission of raw bits.",
            "PDU: Bit.",
        ],
        code: `// Physical Signal
10101010 11001100 ...
// (Represented as voltage levels or light pulses)`,
    },
];