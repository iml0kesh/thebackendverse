export const steps = [
    {
        component: "Browser",
        title: "Input Processing",
        explanation: [
            "User entered: google.com",
            "The browser checks whether the input is a URL or search query.",
            "It detects a domain and prepares a network request.",
            "Since no protocol was provided, it defaults to HTTPS.",
            "Final normalized URL: https://www.google.com",
            "The browser now prepares an HTTP request."
        ],
        learnTopic: "browser-basics",
        terminalTitle: "Generated HTTP Request",
        terminal: {
            method: "GET",
            url: "https://www.google.com",
            headers: {
                Host: "www.google.com",
                "User-Agent": "Browser",
                Accept: "text/html"
            }
        }
    },

    {
        component: "DNS Resolver",
        title: "Domain Resolution",
        explanation: [
            "The browser needs the server's IP address.",
            "It first checks local caches.",
            "No cached entry found.",
            "A DNS query is sent to the configured resolver.",
            "The resolver returns the IP address."
        ],
        learnTopic: "dns",
        terminalTitle: "DNS Query Result",
        terminal: {
            query: "www.google.com",
            record: "A",
            resolved_ip: "142.250.190.46"
        }
    },

    {
        component: "TCP Layer",
        title: "Connection Establishment",
        explanation: [
            "The browser now knows the server's IP.",
            "It starts a TCP three-way handshake.",
            "This creates a reliable connection to the server.",
            "Connection is established on port 443."
        ],
        learnTopic: "tcp-handshake",
        terminalTitle: "TCP Connection State",
        terminal: {
            protocol: "TCP",
            port: 443,
            state: "ESTABLISHED"
        }
    },

    {
        component: "TLS Layer",
        title: "Secure Channel Setup",
        explanation: [
            "The browser and server perform TLS handshake.",
            "Encryption keys are exchanged.",
            "A secure encrypted connection is established."
        ],
        learnTopic: "tls-ssl",
        terminalTitle: "TLS Session Details",
        terminal: {
            version: "TLS 1.3",
            cipher: "AES_256_GCM",
            secure: true
        }
    },

    {
        component: "Web Server",
        title: "Request Processing",
        explanation: [
            "The server receives the HTTP request.",
            "The web server processes the request.",
            "Static content is prepared.",
            "A response is generated and sent back."
        ],
        learnTopic: "web-server",
        terminalTitle: "HTTP Response",
        terminal: {
            status: 200,
            content_type: "text/html",
            transfer: "chunked"
        }
    }
];
