import { STEPS } from "./JourneyPipeline";

const STEP_DETAILS = (parsed) => [
  {
    title: "Browser — URL Parsing",
    phase: "Phase 1: Client Side",
    summary: `When you press Enter, the browser immediately begins parsing the URL. It identifies the protocol (${parsed.protocol.toUpperCase()}), the host (${parsed.domain}), and the path (${parsed.path || "/"}). The browser also checks if it has the resource cached locally.`,
    technical: [
      "URL is tokenized into: protocol, authority (host + port), path, query, fragment",
      `Port resolved to ${parsed.port} (default for ${parsed.protocol.toUpperCase()})`,
      "Browser checks HTTP cache (disk cache, memory cache) for a valid cached response",
      "Checks browser's own DNS cache (~60 sec TTL) before making a network request",
      "Applies Content Security Policy (CSP) rules before proceeding",
    ],
    code: `// Internally similar to:
const url = new URL("${parsed.protocol}://${parsed.subdomain ? parsed.subdomain + "." : ""}${parsed.domain}${parsed.path || "/"}");
console.log(url.protocol); // "${parsed.protocol}:"
console.log(url.hostname); // "${parsed.domain}"
console.log(url.pathname); // "${parsed.path || "/"}"`,
  },
  {
    title: "Cache Check",
    phase: "Phase 1: Client Side",
    summary:
      "Before any network request is made, the browser checks multiple layers of cache. A cache hit can serve the entire response in under 1ms — totally bypassing DNS, TCP, TLS, and the server.",
    technical: [
      "Memory cache — fastest, stores recently used resources in RAM",
      "Disk cache — persists across browser restarts, based on Cache-Control headers",
      "Service Worker cache — if a Service Worker is registered, it intercepts here",
      "HTTP cache validation: If-None-Match (ETag) or If-Modified-Since headers used for stale-while-revalidate",
      "On a cache miss, request proceeds to OS/DNS layer",
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
    title: "DNS Resolution",
    phase: "Phase 2: DNS",
    summary: `The browser asks the OS to resolve "${parsed.domain}" into an IP address. If not cached, it queries a DNS resolver which walks the DNS tree from root → TLD → authoritative nameserver.`,
    technical: [
      `Query: What is the IP for ${parsed.domain}?`,
      "OS checks /etc/hosts file first, then OS DNS cache",
      "Queries configured DNS resolver (e.g., 8.8.8.8 Google, 1.1.1.1 Cloudflare)",
      "Resolver asks Root DNS (13 root server clusters globally) → .com TLD → authoritative NS",
      `Gets back an A record (IPv4) or AAAA record (IPv6) with a TTL`,
      "Entire round trip is typically 10–50ms on a cold DNS lookup",
    ],
    code: `# Full DNS trace (run in terminal):
dig +trace ${parsed.domain}

# Output walks the tree:
# . (root) → .com (TLD) → ${parsed.domain} (authoritative)
# Returns: A record → e.g., 157.240.22.174 TTL 300`,
  },
  {
    title: "TCP 3-Way Handshake",
    phase: "Phase 3: Connection Setup",
    summary:
      "TCP establishes a reliable, ordered connection before any data is sent. This 3-step handshake takes 1 full round-trip time (RTT) — typically 10–100ms depending on server distance.",
    technical: [
      "SYN — Client sends SYN packet with a random sequence number to server:443",
      "SYN-ACK — Server acknowledges, picks its own sequence number, replies SYN-ACK",
      "ACK — Client sends ACK, connection is established",
      "TCP uses congestion control (slow start) — begins sending small amounts of data, ramps up",
      "Nagle's algorithm may batch small packets to reduce overhead",
      "HTTP/2 multiplexes multiple streams over one TCP connection to avoid repeated handshakes",
    ],
    code: `# Visualize TCP (SYN flags):
Client  ────SYN (seq=1000)────►  Server
Client  ◄───SYN-ACK (seq=2000, ack=1001)────  Server
Client  ────ACK (ack=2001)────►  Server
# Connection ESTABLISHED — costs 1 RTT`,
  },
  {
    title: "TLS Handshake",
    phase: "Phase 3: Connection Setup",
    summary: `Since the URL uses HTTPS, a TLS handshake negotiates encryption. TLS 1.3 completes in 1 RTT (vs 2 for TLS 1.2). The server's certificate proves it really is ${parsed.domain}.`,
    technical: [
      "Client Hello: browser sends supported cipher suites and TLS version",
      "Server Hello: server picks cipher suite (e.g., TLS_AES_256_GCM_SHA384), sends certificate",
      "Certificate validation: browser checks cert against trusted CAs (Certificate Authorities), verifies domain matches, checks expiry and revocation (OCSP)",
      "Key Exchange: using ECDHE (Elliptic Curve Diffie-Hellman), both sides derive a shared secret without sending it over the wire",
      "Session keys derived — all further traffic encrypted symmetrically (fast)",
      "TLS 1.3 supports 0-RTT resumption for repeat connections",
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
    title: "Internet Transit",
    phase: "Phase 4: Network",
    summary:
      "Your request travels as IP packets across the public internet — through ISPs, internet exchange points (IXPs), and undersea cables — before reaching the destination server's data center.",
    technical: [
      "Data broken into MTU-sized packets (~1500 bytes) at the IP layer",
      "Each router uses BGP (Border Gateway Protocol) to forward packets toward the destination",
      "Large CDNs (Cloudflare, Fastly, Akamai) serve edge nodes closer to users to reduce latency",
      "Physical path: your router → ISP → backbone → destination AS (Autonomous System)",
      `${parsed.domain} likely uses a CDN — your packets may never leave your continent`,
      "Traceroute shows the actual path: traceroute " + parsed.domain,
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
    title: "Load Balancer",
    phase: "Phase 5: Server Side",
    summary:
      "The request hits a load balancer before any application server. Its job is to distribute traffic across a fleet of servers, ensuring no single machine is overwhelmed and enabling horizontal scaling.",
    technical: [
      "Common load balancers: Nginx, HAProxy, AWS ALB/NLB, Cloudflare",
      "Algorithms: Round Robin, Least Connections, IP Hash, Weighted",
      "L4 load balancing (TCP level) vs L7 (HTTP level — can route by path, headers)",
      "Health checks — LB polls servers every few seconds; removes unhealthy ones from rotation",
      "SSL termination often happens here — backend servers receive plain HTTP",
      "Sticky sessions: some LBs pin a user to the same server for stateful apps",
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
    title: "Web Server",
    phase: "Phase 5: Server Side",
    summary:
      "The web server (Nginx, Apache, Caddy) receives the HTTP request. For static assets (images, JS, CSS), it responds immediately. For dynamic requests, it forwards to the application server.",
    technical: [
      "Parses incoming HTTP request: method, path, headers, body",
      "Serves static files directly from disk (extremely fast — no app code involved)",
      "For dynamic routes, reverse-proxies to the app server (uWSGI, Gunicorn, Tomcat, etc.)",
      "Handles gzip/brotli compression of responses",
      "Enforces rate limiting, request size limits, access control",
      "Logs every request (access.log) for analytics and debugging",
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
    title: "Application Server",
    phase: "Phase 5: Server Side",
    summary:
      "The app server runs your actual business logic — authentication, data processing, API orchestration. It's written in Node.js, Python, Go, Java, etc. and handles the dynamic part of the request.",
    technical: [
      "Framework receives request: Express (Node), Django (Python), Spring (Java), Rails (Ruby)",
      "Middleware pipeline runs: auth, logging, request parsing, CORS",
      "Route matched → controller/handler function invoked",
      "Business logic executed: auth check, permission check, data transformation",
      "May call internal microservices, external APIs, caches (Redis)",
      "Constructs a response object (JSON, HTML, redirect) and sends it back",
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
    title: "Database",
    phase: "Phase 5: Server Side",
    summary:
      "The app server queries a database to read or write persistent data. This is often the slowest step — optimizing DB queries (indexes, query planning, connection pooling) is critical for performance.",
    technical: [
      "SQL (PostgreSQL, MySQL) or NoSQL (MongoDB, DynamoDB, Cassandra) depending on data model",
      "Query sent over a connection pool (pg-pool, HikariCP) — creating fresh DB connections is expensive",
      "Database query planner analyzes query and decides execution plan (index scan vs full table scan)",
      "Results fetched from disk pages or OS buffer cache (hot data stays in RAM)",
      "Cache layer (Redis/Memcached) often sits in front of the DB for frequently-read data",
      "ORM (Sequelize, Hibernate, Prisma) translates object calls to raw SQL",
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
    title: "HTTP Response",
    phase: "Phase 6: Response Journey",
    summary:
      "The server packages the result into an HTTP response and sends it back through the internet. The response travels the same path in reverse — through the internet, to your ISP, to your device.",
    technical: [
      "Status code communicates outcome: 200 OK, 301 Redirect, 404 Not Found, 500 Server Error",
      "Response headers set: Content-Type, Cache-Control, ETag, Set-Cookie, CORS headers",
      "Body can be HTML, JSON, binary (images), or a stream",
      "Gzip/Brotli compression applied (reduces size 60–80%)",
      "Response split into TCP packets, reassembled in order by receiver's TCP stack",
      "Time-to-first-byte (TTFB) is measured here — a key performance metric",
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
    title: "Browser Rendering",
    phase: "Phase 7: Rendering",
    summary:
      "The browser receives the HTML and starts constructing the page. It parses HTML → builds the DOM, fetches and applies CSS → builds CSSOM, executes JavaScript, and finally paints pixels to the screen.",
    technical: [
      "HTML parsing → DOM (Document Object Model) tree built incrementally",
      "CSS parsing → CSSOM (CSS Object Model) built, combined with DOM → Render Tree",
      "Layout (Reflow) — browser calculates exact position and size of every element",
      "Paint — browser draws pixels for each element into layers",
      "Composite — GPU combines layers into the final visible frame",
      "JavaScript execution on main thread can block rendering — use async/defer",
      "Core Web Vitals: LCP (largest paint), CLS (layout shift), FID/INP (interactivity)",
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

export const StepExplainer = ({ stepIndex, parsed }) => {
  const detail = STEP_DETAILS(parsed)[stepIndex];
  const step = STEPS[stepIndex];
  if (!detail) return null;

  return (
    <section className="step-explainer">
      <div className="explainer-header">
        <span className="explainer-icon">{step.icon}</span>
        <div>
          <span className="explainer-phase">{detail.phase}</span>
          <h2 className="explainer-title">{detail.title}</h2>
        </div>
      </div>
      <p className="explainer-summary">{detail.summary}</p>
      <div className="explainer-body">
        <div className="explainer-technical">
          <h3>Technical Details</h3>
          <ul>
            {detail.technical.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </div>
        <div className="explainer-code">
          <h3>Code / Commands</h3>
          <pre>
            <code>{detail.code}</code>
          </pre>
        </div>
      </div>
    </section>
  );
};
