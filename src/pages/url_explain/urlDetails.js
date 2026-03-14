export const URL_STEP_DETAILS = (parsed) => [
    {
        title: "1. Browser Parses URL",
        phase: "Phase 1: Client Side",
        analogy: "Like reading the destination address on an envelope before mailing a letter.",
        summary: `When you press Enter, the browser's first task is to deconstruct the URL into its fundamental components. It extracts the protocol (${parsed.protocol.toUpperCase()}), the target domain (${parsed.domain}), and the requested resource path (${parsed.path || "/"}).`,
        technical: [
            "URL Parsing: The browser isolates the protocol, hostname, port, path, query parameters, and fragments.",
            `Port Determination: It infers the network port if omitted (e.g., port ${parsed.port} for ${parsed.protocol.toUpperCase()}).`,
            "HSTS Check: The browser checks its HTTP Strict Transport Security (HSTS) list to enforce HTTPS connections before proceeding.",
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
        analogy: "Checking your pockets for your keys before walking all the way to the store to get new ones.",
        summary: "To minimize latency and reduce unnecessary network traffic, the browser checks its local caches before making an external request. A successful 'cache hit' bypasses the network entirely, delivering instant results.",
        technical: [
            "Memory Cache: Stores recently accessed resources in RAM for ultra-fast, short-term retrieval.",
            "Disk Cache: A persistent storage layer on your hard drive for assets like images and stylesheets.",
            "Service Workers: Client-side proxies that can intercept requests to serve offline or custom-cached content.",
            "Revalidation: If a cached asset is stale, the browser sends a conditional request using an ETag to check for updates.",
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
        analogy: "Looking up a friend's name in your phone's contacts to find their actual phone number.",
        summary: `Since computers communicate across the internet using IP addresses rather than human-readable names, the browser must translate '${parsed.domain}' into a machine-routable IP address using the Domain Name System (DNS).`,
        technical: [
            "Local Lookup: The OS first inspects its local DNS cache and the 'hosts' file.",
            "Recursive Resolution: If no local record exists, the query is forwarded to a DNS resolver (usually provided by the ISP).",
            `Hierarchy Traversal: The resolver queries the Root server, the Top-Level Domain (TLD) server, and finally the Authoritative Name Server for ${parsed.domain}.`,
            "Record Retrieval: An 'A' record (IPv4) or 'AAAA' record (IPv6) is returned and cached locally based on its Time-To-Live (TTL).",
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
        analogy: "Calling someone and saying 'Hello? Can you hear me?', and waiting for them to say 'Yes, I hear you!' before starting the conversation.",
        summary: "With the target IP address identified, the browser establishes a reliable, ordered communication channel with the server using the Transmission Control Protocol (TCP) via a sequence known as the 3-Way Handshake.",
        technical: [
            "SYN (Synchronize): The client initiates the connection by sending a packet with a random sequence number.",
            "SYN-ACK (Synchronize-Acknowledge): The server acknowledges the client's packet and sends its own synchronized sequence number.",
            "ACK (Acknowledge): The client confirms receipt of the server's packet. The TCP socket connection is now formally established.",
            "This process requires a full network round-trip (RTT) before any actual application data can be transmitted.",
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
        analogy: "Checking the person's ID badge, and then agreeing on a secret code language so nobody else can eavesdrop on your conversation.",
        summary: `For secure HTTPS connections, a Transport Layer Security (TLS) handshake is performed over the established TCP connection. This critical step ensures encryption, data integrity, and server authenticity.`,
        technical: [
            "Client Hello: The browser proposes its supported TLS versions and cryptographic cipher suites.",
            "Server Hello & Certificate: The server selects a cipher, provides its digital SSL/TLS certificate, and shares its public key.",
            "Certificate Validation: The browser verifies the certificate against its list of trusted Certificate Authorities (CAs) to prevent Man-in-the-Middle attacks.",
            "Key Exchange: Both parties securely generate a shared symmetric 'session key' to efficiently encrypt all subsequent data.",
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
        analogy: "A mail delivery truck navigating through various highways, sorting facilities, and cities to reach the final destination.",
        summary: "The encrypted HTTP request is broken down into small data packets and routed across the global internet. It traverses multiple network hops, including local routers, ISPs, and the internet backbone, to reach the destination IP.",
        technical: [
            "Packet Switching: Data is divided into smaller IP packets, each containing source and destination headers.",
            "Dynamic Routing: Routers utilize protocols like BGP (Border Gateway Protocol) to continuously calculate the most efficient path to the destination.",
            "Network Hops: Packets physically travel through localized switches, fiber-optic cables, and regional data centers.",
            "Content Delivery Networks (CDNs): If utilized, the request may be intercepted by a geographically closer edge server, drastically reducing travel time.",
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
        analogy: "A host at a very busy restaurant who greets you and directs you to the waiter who has the fewest tables right now.",
        summary: "At the destination, the request typically arrives at a Load Balancer first. This system acts as a reverse proxy, intelligently distributing incoming network traffic across a cluster of backend servers to ensure high availability.",
        technical: [
            "Traffic Distribution: Algorithms like Round Robin, Least Connections, or IP Hash determine which backend server receives the request.",
            "Health Checks: The load balancer continuously monitors backend servers, routing traffic away from failed or degraded instances.",
            "SSL Termination: Often, the load balancer decrypts the TLS traffic, relieving backend servers of heavy computational overhead.",
            "Horizontal Scaling: Enables the infrastructure to handle massive concurrent traffic spikes by simply adding more servers to the pool.",
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
        analogy: "The waiter taking your order. If you just ask for a glass of water (static file), they grab it immediately. If you order a cooked meal (dynamic), they pass the ticket to the kitchen.",
        summary: "The routed request is processed by a Web Server (such as Nginx or Apache). Its primary role is to interpret the HTTP protocol and decide how to fulfill the request—either by serving static files or proxying dynamic requests.",
        technical: [
            `HTTP Parsing: The server reads the HTTP method (e.g., GET, POST), target path (${parsed.path || "/"}), and incoming headers.`,
            "Static Asset Serving: If the request is for an image, CSS, or static HTML, the web server reads it directly from the disk for maximum speed.",
            "Reverse Proxying: For dynamic requests, it forwards the traffic to an upstream Application Server for further processing.",
            "Optimization: Handles peripheral tasks like gzip/brotli compression, rate limiting, and appending HTTP caching headers.",
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
        analogy: "The head chef in the kitchen reading your order, gathering ingredients, and cooking your specific custom meal.",
        summary: "Dynamic requests are handed off to an Application Server (e.g., Node.js, Python/Django, Java/Spring). This is where the core business logic resides, processing inputs, enforcing security rules, and generating dynamic content.",
        technical: [
            "Routing & Middleware: The application framework matches the URL path to a specific controller and runs request-processing middleware.",
            "Authentication & Authorization: Validates user sessions, cookies, or JWTs to ensure the user has permission to access the resource.",
            "Business Logic Execution: Executes custom code to process forms, compute data, or interact with external third-party APIs.",
            "Template Rendering: Constructs the final JSON payload or server-side rendered HTML response to send back to the user.",
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
        analogy: "The giant, highly-organized pantry and walk-in freezer where the chef goes to find the specific ingredients needed for your meal.",
        summary: "To retrieve or persist structured data, the application server queries a Database. This layer manages persistent state—such as user profiles, posts, or transactional records—while ensuring data integrity.",
        technical: [
            "Query Execution: The application translates business logic into a database query language (like SQL or NoSQL operations).",
            "Connection Pooling: Reuses established database connections to avoid the heavy latency of opening new ones per request.",
            "Query Planning & Indexing: The database engine calculates the most efficient retrieval plan. Indexes function like a book's glossary, drastically speeding up reads.",
            "ACID Properties: Relational databases ensure Atomicity, Consistency, Isolation, and Durability for safe, reliable transactions.",
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
        analogy: "The waiter packaging up your finished meal securely and walking it all the way back to your table.",
        summary: "Once the data is ready, the application server packages it into an HTTP Response. This response travels back through the web server, load balancer, and internet routers until it arrives at the user's browser.",
        technical: [
            "Status Line: Contains the HTTP protocol version and a status code (e.g., 200 OK for success, 404 for Not Found, 500 for Server Error).",
            "Response Headers: Provides crucial metadata, such as 'Content-Type' (telling the browser how to parse the data) and 'Set-Cookie' for session management.",
            "Payload Compression: The body payload (HTML, JSON) is often compressed via Gzip or Brotli to minimize bandwidth consumption.",
            "Connection Keep-Alive: The TCP connection is typically kept open for subsequent requests, saving the overhead of repeating the handshake.",
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
        analogy: "Unboxing your meal, plating it nicely, putting on the dressing, and finally getting to eat it.",
        summary: "Finally, the browser receives the raw HTML bytes and executes the Critical Rendering Path. It systematically converts the code into the interactive, visual webpage displayed on your screen.",
        technical: [
            "DOM & CSSOM Trees: Parses HTML into the Document Object Model (DOM) and stylesheets into the CSS Object Model (CSSOM).",
            "Render Tree: Combines the DOM and CSSOM to determine which specific elements will actually be visible on the screen.",
            "Layout: Computes the exact geometry (width, height, X/Y coordinates) of every element based on viewport size.",
            "Paint & Composite: Converts the layout into pixels (Painting) and correctly layers elements with varying z-indexes and opacities (Compositing).",
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