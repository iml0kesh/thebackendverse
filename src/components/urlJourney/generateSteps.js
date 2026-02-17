export const generateSteps = (domain) => {
    const normalized = domain.startsWith("http")
        ? domain
        : `https://www.${domain}`;

    return [
        {
            component: "Browser",
            title: "Input Processing",
            explanation: [
                `User entered: ${domain}`,
                "The browser checks whether the input is a URL or search query.",
                "It detects a domain and prepares a network request.",
                `Normalized URL: ${normalized}`,
                "An HTTP request is created."
            ],
            terminalTitle: "Generated HTTP Request",
            terminal: {
                method: "GET",
                url: normalized,
                headers: {
                    Host: `www.${domain}`,
                    "User-Agent": "Browser",
                    Accept: "text/html"
                }
            },
            highlight: "browser"
        },

        {
            component: "DNS Resolver",
            title: "Domain Resolution",
            explanation: [
                "The browser needs the server's IP address.",
                `A DNS query is made for ${domain}.`,
                "The resolver returns the IP address."
            ],
            terminalTitle: "DNS Query Result",
            terminal: {
                query: domain,
                record: "A",
                resolved_ip: "142.250.190.46"
            },
            highlight: "dns"
        },

        {
            component: "TCP Layer",
            title: "Connection Establishment",
            explanation: [
                "The browser now knows the server's IP.",
                "It performs a TCP three-way handshake.",
                "A reliable connection is established."
            ],
            terminalTitle: "TCP Connection State",
            terminal: {
                protocol: "TCP",
                port: 443,
                state: "ESTABLISHED"
            },
            highlight: "server"
        },

        {
            component: "TLS Layer",
            title: "Secure Channel Setup",
            explanation: [
                "The browser and server perform TLS handshake.",
                "Encryption keys are exchanged.",
                "The connection becomes secure."
            ],
            terminalTitle: "TLS Session Details",
            terminal: {
                version: "TLS 1.3",
                cipher: "AES_256_GCM",
                secure: true
            },
            highlight: "server"
        },

        {
            component: "Web Server",
            title: "Request Processing",
            explanation: [
                "The server receives the HTTP request.",
                "The web server processes it.",
                "A response is generated."
            ],
            terminalTitle: "HTTP Response",
            terminal: {
                status: 200,
                content_type: "text/html"
            },
            highlight: "browser"
        }
    ];
};
