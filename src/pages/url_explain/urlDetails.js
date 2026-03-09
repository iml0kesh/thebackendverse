export const URL_STEP_DETAILS = (parsed) => [
    {
        title: "1. Browser Parses URL",
        phase: "Phase 1: Client Side",
        summary: `When you press Enter, the browser first needs to understand the URL. It breaks it down into its core parts: the protocol (${parsed.protocol.toUpperCase()}), the domain name (${parsed.domain}), and the specific path (${parsed.path || "/"}).`,
        technical: [
            "The browser breaks the URL into parts: protocol, host, and path.",
            `It determines the port to connect to: ${parsed.port} (the default for ${parsed.protocol.toUpperCase()}).`,
            "Before making a network request, it checks its own cache for a ready-made copy.",
        ],
        code: `// Internally similar to:
const url = new URL("${parsed.protocol}://${parsed.subdomain ? parsed.subdomain + "." : ""}${parsed.domain}${parsed.path || "/"}");
console.log(url.protocol); // "${parsed.protocol}:"
console.log(url.hostname); // "${parsed.domain}"
console.log(url.pathname); // "${parsed.path || "/"}"`,
    },
    {
        title: "2. Cache Check",
        phase: "Phase 1: Client Side",
        summary: "Before making a single network request, the browser checks several layers of cache. A 'cache hit' is incredibly fast and can serve the entire page in milliseconds, skipping all the network steps.",
        technical: [
            "1. Memory Cache: The fastest cache, for items you just accessed.",
            "2. Disk Cache: Persists even after you close the browser.",
            "3. Service Worker: An advanced cache that can make the site work offline.",
            "If a cached item is 'stale', the browser asks the server if it's still valid using an ETag.",
            "If it's a 'Cache Miss', the journey continues to the network.",
        ],
        code: `// Cache-Control header examples:
Cache-Control: max-age=3600          // cache 1 hour
Cache-Control: no-cache              // always revalidate
Cache-Control: stale-while-revalidate=60  // serve stale, update async

// ETag flow:
// Browser sends: If-None-Match: "abc123"
// Server replies: 304 Not Modified (no body!) or 200 with new ETag`,
    },
    {
        title: "3. DNS Resolution",
        phase: "Phase 2: DNS",
        summary: `The browser needs to translate the human-readable domain name (${parsed.domain}) into a machine-readable IP address. Think of it like looking up a contact's name to find their phone number.`,
        technical: [
            `Query: What is the IP for ${parsed.domain}?`,
            "The browser asks the Operating System (OS), which checks its own cache and hosts file first.",
            "If not found, it asks a DNS Resolver (like your ISP's, or Google's 8.8.8.8).",
            `The resolver finds the IP by asking a chain of servers: Root → .com → the authoritative server for ${parsed.domain}.`,
            `It gets back an IP address (an 'A' record) and caches it for a short time (TTL).`,
        ],
        code: `# Full DNS trace (run in terminal):
dig +trace ${parsed.domain}

# Output walks the tree:
# . (root) → .com (TLD) → ${parsed.domain} (authoritative)
# Returns: A record → e.g., 157.240.22.174 TTL 300`,
    },
    {
        title: "4. TCP 3-Way Handshake",
        phase: "Phase 3: Connection Setup",
        summary: "Before sending any data, your computer establishes a reliable connection with the server. This is like a polite phone call: you say 'hello', they say 'hello' back, and you confirm you heard them. This takes one full network round-trip.",
        technical: [
            "1. SYN: Your computer sends a SYN (synchronize) packet to the server.",
            "2. SYN-ACK: The server sends back a SYN-ACK (synchronize-acknowledge) packet.",
            "3. ACK: Your computer sends a final ACK (acknowledge) packet. The connection is now open.",
        ],
        code: `# Visualize TCP (SYN flags):
Client  ────SYN (seq=1000)────►  Server
Client  ◄───SYN-ACK (seq=2000, ack=1001)────  Server
Client  ────ACK (ack=2001)────►  Server
# Connection ESTABLISHED — costs 1 RTT`,
    },
    {
        title: "5. TLS Handshake",
        phase: "Phase 3: Connection Setup",
        summary: `This is the secret handshake. Because the URL uses HTTPS, the connection must be secured. This process verifies that you're talking to the real ${parsed.domain} and encrypts all communication so nobody can eavesdrop.`,
        technical: [
            "1. Client Hello: Your browser sends its capabilities (TLS version, cipher suites).",
            "2. Server Hello & Certificate: The server chooses the encryption method and presents its SSL certificate as proof of identity.",
            "3. Verification: Your browser checks if the certificate is valid and issued by a trusted Certificate Authority (CA).",
            "4. Key Exchange: Both sides use a clever math trick to agree on a secret session key for encryption.",
        ],
        code: `# Check TLS details:
openssl s_client -connect ${parsed.domain}:443 -tls1_3

# TLS 1.3 Handshake (1 RTT):
Client ──ClientHello + KeyShare──► Server
Client ◄──ServerHello + Cert + Finished── Server
Client ──Finished──► Server
# Both now share symmetric keys. Traffic is encrypted.`,
    },
    {
        title: "6. Across the Internet",
        phase: "Phase 4: Network",
        summary: "Your HTTP request, now encrypted and broken into small data packets, travels across the global network of routers, switches, and undersea cables to find the server's IP address.",
        technical: [
            "The request is broken into small IP packets, each with the source and destination IP address.",
            "Routers along the way use a 'map' of the internet (BGP) to find the fastest path.",
            "If the site uses a CDN, this journey might be very short, ending at a server in a nearby city.",
            "The physical path goes from your router, to your ISP, across the internet backbone, to the server's network.",
        ],
        code: `# Trace the physical route:
traceroute ${parsed.domain}

# Each hop is a router:
# 1  192.168.1.1 (your router)
# 2  10.x.x.x (ISP gateway)
# ...
# 12  edge-node.cdn.net (CDN edge)
# 13  157.240.x.x (destination)`,
    },
    {
        title: "7. Load Balancer",
        phase: "Phase 5: Server Side",
        summary: "High-traffic websites don't run on a single server. The request first hits a load balancer, which acts like a traffic cop, distributing incoming requests across a fleet of servers to prevent any single one from being overloaded.",
        technical: [
            "It uses an algorithm (like 'Round Robin' or 'Least Connections') to pick the best server.",
            "It constantly runs health checks and removes unhealthy servers from the pool.",
            "Often, this is where encryption (TLS) is handled, so backend servers don't have to.",
            "It ensures the site stays available and can handle many users at once.",
        ],
        code: `# Nginx load balancer config example:
upstream backend_pool {
    least_conn;  # route to server with fewest active connections
    server app1.internal:8080 weight=3;
    server app2.internal:8080 weight=3;
    server app3.internal:8080 weight=1;  # canary
}

server {
    listen 443 ssl;
    location / {
        proxy_pass http://backend_pool;
    }
}`,
    },
    {
        title: "8. Web Server",
        phase: "Phase 5: Server Side",
        summary: "The request arrives at a web server (like Nginx or Apache). Its main job is to handle the HTTP request and either serve a static file directly or pass the request to the application for dynamic content.",
        technical: [
            "It parses the incoming HTTP request (method, path, headers).",
            "If you requested a static file (image, CSS), it serves it directly from the disk (very fast).",
            "If it's a dynamic request, it acts as a reverse proxy, forwarding it to the application server.",
            "It can also handle tasks like compression and rate limiting.",
        ],
        code: `# Incoming HTTP request the server sees:
GET ${parsed.path || "/"} HTTP/2
Host: ${parsed.domain}
Accept: text/html,application/xhtml+xml
Accept-Encoding: gzip, deflate, br
User-Agent: Mozilla/5.0 ...
Cookie: sessionid=abc123; csrftoken=xyz

# Web server decides: static file or proxy to app?`,
    },
    {
        title: "9. Application Server",
        phase: "Phase 5: Server Side",
        summary: "This is where the site's custom code runs. The application server (running Node.js, Python, Java, etc.) executes the business logic needed to handle the request.",
        technical: [
            "The application framework (like Express, Django, Rails) takes over.",
            "It runs a series of middleware (for logging, authentication, etc.).",
            "It matches the path to a specific route handler in your code.",
            "This is where your code runs: authenticating users, processing forms, and preparing data for the response.",
        ],
        code: `// Example Express.js route handler:
app.get("${parsed.path || "/"}", async (req, res) => {
  // 1. Auth check
  const user = await verifyToken(req.headers.authorization);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  // 2. Business logic
  const data = await UserService.getProfile(user.id);

  // 3. Return response
  res.json({ success: true, data });
});`,
    },
    {
        title: "10. Database",
        phase: "Phase 5: Server Side",
        summary: "Most applications need to store data permanently. The application server queries a database to read or write information. This is often the slowest part of the request, so database performance is critical.",
        technical: [
            "The app connects to a database (like PostgreSQL, MongoDB) to get or save information.",
            "It uses a connection pool to avoid the slow process of creating new connections for every query.",
            "The database's query planner figures out the most efficient way to find the data.",
            "Using an index is like using the index in a book—much faster than a full table scan.",
        ],
        code: `-- SQL query example:
EXPLAIN ANALYZE
SELECT u.id, u.username, p.bio
FROM users u
JOIN profiles p ON p.user_id = u.id
WHERE u.username = '${parsed.path?.replace("/", "") || "iaml0kesh"}'
LIMIT 1;

-- Query planner output:
-- Index Scan on users (cost=0.43..8.45 rows=1)
-- → Nested Loop Join with profiles
-- Execution Time: 0.8ms  ✓`,
    },
    {
        title: "11. Server Responds",
        phase: "Phase 6: Response Journey",
        summary: "The application server packages the result into an HTTP response and sends it back. The response travels the same path in reverse—through the internet, to your ISP, and finally to your browser.",
        technical: [
            "A Status Code indicates the result (e.g., 200 OK, 404 Not Found).",
            "Headers provide metadata (like Content-Type and Cache-Control).",
            "The Body contains the actual content (HTML, JSON, etc.).",
            "The body is usually compressed (gzip/brotli) to save bandwidth and speed up the transfer.",
        ],
        code: `HTTP/2 200 OK
Content-Type: text/html; charset=UTF-8
Cache-Control: max-age=0, must-revalidate
ETag: "a8f5f167"
Content-Encoding: gzip
Content-Length: 14523
Set-Cookie: ig_did=ABCD; Domain=.instagram.com; Secure; HttpOnly

<!DOCTYPE html>
<html lang="en">...`,
    },
    {
        title: "12. Browser Renders Page",
        phase: "Phase 7: Rendering",
        summary: "The browser receives the HTML and begins the process of turning code into a visible webpage. It builds the page structure, applies styles, executes scripts, and paints the final pixels to your screen.",
        technical: [
            "1. Parse HTML: Creates a structure of the page called the DOM tree.",
            "2. Parse CSS: Creates a CSSOM tree of all styles.",
            "3. Layout: Calculates the exact size and position of every element.",
            "4. Paint: Draws the visual parts of each element.",
            "5. Composite: Puts all the painted layers together to form the final image you see.",
        ],
        code: `// Browser rendering pipeline:
HTML bytes
  → Tokenization
  → DOM tree
  + CSS bytes
  → CSSOM tree
  = Render Tree
  → Layout (x, y, width, height per element)
  → Paint (draw on GPU layers)
  → Composite (GPU blends layers)
  → 🎨 Pixels on screen!

// Performance tip:
<script defer src="app.js"></script>  // don't block HTML parsing`,
    },
];