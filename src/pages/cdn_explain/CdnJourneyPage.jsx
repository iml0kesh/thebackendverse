import { useEffect, useState } from "react";

// ─── STEPS ───────────────────────────────────────────────────────────────────
export const CDN_STEPS = [
  { id: "user", icon: "👤", label: "User Request", phase: "Client" },
  { id: "dns", icon: "📡", label: "DNS Resolution", phase: "Client" },
  { id: "edge-select", icon: "🗺️", label: "Edge Selection", phase: "CDN" },
  { id: "edge-node", icon: "⚡", label: "Edge Node", phase: "CDN" },
  { id: "cache-check", icon: "🔍", label: "Cache Check", phase: "CDN" },
  { id: "cache-hit", icon: "✅", label: "Cache Hit", phase: "CDN" },
  { id: "origin", icon: "🖥️", label: "Origin Server", phase: "Origin" },
  { id: "cache-store", icon: "💾", label: "Cache & Store", phase: "Origin" },
  { id: "deliver", icon: "📦", label: "Deliver to User", phase: "Response" },
  {
    id: "invalidate",
    icon: "🔄",
    label: "Cache Invalidation",
    phase: "Management",
  },
];

const PHASE_COLORS = {
  Client: "#ffd166",
  CDN: "#06d6a0",
  Origin: "#ff6b35",
  Response: "#118ab2",
  Management: "#a29bfe",
};

// ─── STEP DETAILS ─────────────────────────────────────────────────────────────
const STEP_DETAILS = [
  {
    title: "User Makes a Request",
    phase: "Phase 1: Client",
    summary:
      "You type a URL or click a link. Your browser needs to fetch a resource — an image, a JS file, a video, an API response. Without a CDN, every single request would travel all the way to one central server, no matter where in the world you are.",
    technical: [
      "Browser issues an HTTP GET request for the resource URL",
      "The URL typically points to a CDN domain like cdn.example.com or a custom subdomain",
      "Geographic distance to origin server = latency. User in India hitting a US server = 200ms+ just for the round trip",
      "CDNs solve this by serving content from servers physically close to the user",
      "First request always hits CDN — CDN then decides: cache hit or origin fetch?",
    ],
    code: `# Without CDN: every user hits the same origin
GET https://api.instagram.com/static/bundle.js
# Round trip: India → US = ~200ms latency

# With CDN: user hits nearest edge node
GET https://static.cdnprovider.net/bundle.js
# Round trip: India → Singapore edge = ~8ms latency

# The CDN domain resolves to different IPs per region
dig cdn.example.com
# From India:    → 103.21.244.0  (Singapore edge)
# From Germany:  → 104.16.132.0  (Frankfurt edge)
# From Brazil:   → 172.64.153.0  (São Paulo edge)`,
  },
  {
    title: "DNS Resolution — Anycast Magic",
    phase: "Phase 1: Client",
    summary:
      "This is where CDN magic begins. The CDN uses Anycast routing — multiple servers around the world share the SAME IP address. When your DNS query resolves, the network automatically routes you to the closest one. It's routing intelligence built into the internet itself.",
    technical: [
      "CDN providers (Cloudflare, Fastly, Akamai) announce the same IP from hundreds of locations via BGP",
      "Anycast: same IP, many physical servers — network routes to the nearest one automatically",
      "Alternatively: GeoDNS returns different IPs based on where your DNS query originates from",
      "Cloudflare uses 1.1.1.1 as an example — that IP exists on servers in 200+ cities simultaneously",
      "Your ISP's routers pick the shortest path using BGP hop count and latency metrics",
    ],
    code: `# Anycast in action — same domain, different IPs by location:
# User in Mumbai:
nslookup cdn.cloudflare.com
# → 104.21.12.5  (routed to Mumbai/Singapore PoP)

# User in Berlin:
nslookup cdn.cloudflare.com
# → 104.21.12.5  (SAME IP — but routed to Frankfurt PoP)
# BGP routing handles the geography, not DNS

# GeoDNS alternative — different IPs per region:
nslookup assets.example.com  # from Asia
# → 203.0.113.10  (Tokyo server)
nslookup assets.example.com  # from Europe
# → 198.51.100.20 (Amsterdam server)`,
  },
  {
    title: "Edge Node Selection",
    phase: "Phase 2: CDN",
    summary:
      "CDNs have Points of Presence (PoPs) — data centers distributed worldwide. The network selects the best PoP for your request based on physical distance, network latency, current server load, and health. Cloudflare has 300+ PoPs, Akamai has 4,000+.",
    technical: [
      "PoP (Point of Presence) = a CDN data center in a specific city/region",
      "Selection criteria: network latency (RTT), geographic proximity, server load, health",
      "Load balancing across multiple edge servers within the same PoP",
      "If a PoP is down or overloaded, traffic fails over to the next nearest PoP automatically",
      "Tier 1 (edge) → Tier 2 (regional) → Origin: hierarchical caching reduces origin load",
      "Cloudflare: 300+ cities. Akamai: 4,000+ PoPs. Fastly: 60+ PoPs but highly optimized",
    ],
    code: `# CDN PoP locations — traceroute shows the path:
traceroute static.example.com

# Result from Bangalore, India:
# 1  192.168.1.1       (your router)
# 2  49.204.x.x        (ISP gateway)
# 3  ...
# 8  103.21.244.15     ← CDN edge node, Singapore
#    0.8ms total!

# Compare without CDN:
# 8  151.101.x.x       ← US origin server
#    198ms total — 247x slower

# Check which Cloudflare PoP you hit:
curl -I https://example.com | grep cf-ray
# cf-ray: 7a8b9c0d1e2f3-BOM  ← BOM = Mumbai PoP`,
  },
  {
    title: "Edge Node Receives Request",
    phase: "Phase 2: CDN",
    summary:
      "Your request lands at the edge server — a physical machine in a nearby data center. This server has its own high-speed SSD cache containing frequently requested content. It processes your request headers, checks its cache, applies rules (security, redirects, transformations), and decides what to do next.",
    technical: [
      "Edge server runs CDN software (Nginx, custom Varnish, or proprietary like Cloudflare Workers)",
      "Inspects request: URL, headers, cookies, query params — constructs a cache key",
      "Cache key = what uniquely identifies a cacheable resource (usually URL + some headers)",
      "Applies WAF (Web Application Firewall) rules — blocks malicious requests at the edge",
      "Can run serverless code at the edge (Cloudflare Workers, Fastly Compute@Edge)",
      "Checks local in-memory cache first, then SSD cache, then tier-2 cache before going to origin",
    ],
    code: `# Cache key construction — determines cache uniqueness:
# Simple: URL only
cache_key = "https://cdn.example.com/image.jpg"

# With Vary header (vary by Accept-Encoding):
cache_key = "https://cdn.example.com/image.jpg:gzip"

# Cloudflare Cache Rules example:
# cache everything under /static/ for 30 days
if (req.url ~ "^/static/") {
  set beresp.ttl = 30d;
}

# Edge function at the CDN (Cloudflare Worker):
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})
async function handleRequest(request) {
  // custom logic runs in 200+ cities, 0ms cold start
  return fetch(request)
}`,
  },
  {
    title: "Cache Check — HIT or MISS?",
    phase: "Phase 2: CDN",
    summary:
      "The CDN checks if it already has a fresh copy of the requested resource. A cache HIT means it responds instantly from local storage. A cache MISS means it must fetch from the origin server. CDNs aim for 90%+ cache hit ratios — meaning 9 out of 10 requests never reach your origin.",
    technical: [
      "Cache HIT: resource found in edge cache AND not expired → instant response, no origin contact",
      "Cache MISS: not in cache or expired → must fetch from origin (stale-while-revalidate can still serve stale)",
      "Cache EXPIRED: TTL passed → revalidate with origin using ETag or If-Modified-Since",
      "Cache key collision risk: query params, cookies, Accept headers must be handled carefully",
      "Hit ratio = (cache hits / total requests) × 100 — a 95% hit ratio means 20x less origin traffic",
      "Stale-while-revalidate: serve stale content immediately while asynchronously refreshing it",
    ],
    code: `# Response headers tell you the cache status:
curl -I https://cdn.example.com/bundle.js

# Cache HIT response:
HTTP/2 200
CF-Cache-Status: HIT          ← served from edge cache
Age: 3482                      ← cached 58 minutes ago
Cache-Control: max-age=86400  ← valid for 24h total
X-Cache: Hit from cloudfront  ← AWS CloudFront syntax

# Cache MISS response:
HTTP/2 200
CF-Cache-Status: MISS         ← fetched from origin
Age: 0
Cache-Control: max-age=86400

# Cache EXPIRED (revalidated):
HTTP/2 304 Not Modified        ← origin says "still fresh"
CF-Cache-Status: REVALIDATED`,
  },
  {
    title: "Cache HIT — Instant Response",
    phase: "Phase 2: CDN",
    summary:
      "Cache hit! The edge server has a fresh copy. It responds directly to the user in milliseconds — the origin server is never contacted. This is the CDN doing its job. Response time drops from 200ms+ to under 10ms. This is why CDNs can make sites feel instantaneous.",
    technical: [
      "Response served entirely from edge server SSD or in-memory cache",
      "Zero network round trips to origin — pure speed",
      "Edge to user latency: typically 1–15ms depending on physical distance",
      "Compression already applied (gzip/brotli stored in cache) — no re-compression needed",
      "HTTP/2 or HTTP/3 (QUIC) used for multiplexed delivery to the browser",
      "Cache headers updated: Age increments, showing how long it's been cached",
    ],
    code: `# Measuring CDN performance with curl:
curl -w "\\nDNS: %{time_namelookup}s\\nConnect: %{time_connect}s\\nTTFB: %{time_starttransfer}s\\nTotal: %{time_total}s\\n" \\
     -o /dev/null -s https://cdn.example.com/image.jpg

# Without CDN (origin in US, user in India):
DNS:     0.023s
Connect: 0.198s   ← 198ms round trip to US
TTFB:    0.412s
Total:   0.891s   ← nearly 1 second!

# With CDN (edge node in Singapore):
DNS:     0.004s
Connect: 0.008s   ← 8ms to nearest edge
TTFB:    0.011s
Total:   0.089s   ← 10x faster`,
  },
  {
    title: "Cache MISS — Fetch from Origin",
    phase: "Phase 3: Origin",
    summary:
      "Cache miss. The edge server doesn't have this resource (or it's expired). It now makes a request to your origin server on your behalf. This is called an origin pull. The CDN acts as a proxy — the origin server responds to the CDN, not directly to the user.",
    technical: [
      "Edge server opens a connection to the origin server (your web server / API)",
      "Request forwarded with original headers + X-Forwarded-For (user's real IP)",
      "Origin server processes the request normally and returns a response",
      "If multiple users request the same uncached resource simultaneously → request coalescing: CDN makes ONE origin request, serves all waiting users from that one response",
      "Origin Shield: optional middle tier — one 'shield' server talks to origin, all edges talk to shield. Protects origin from traffic spikes",
      "If origin is down, CDN can serve stale content (stale-if-error) instead of showing errors",
    ],
    code: `# Origin receives request from CDN edge, not user:
# Origin logs show CDN IP, not user IP
# Real user IP preserved in headers:

GET /image.jpg HTTP/1.1
Host: origin.example.com
X-Forwarded-For: 103.21.244.15    ← CDN edge IP
X-Real-IP: 49.204.x.x            ← original user IP
Via: 1.1 cloudflare               ← CDN identifier
CF-Connecting-IP: 49.204.x.x     ← Cloudflare-specific

# Origin Shield config (Cloudflare):
# Bangalore edge → Frankfurt shield → Origin (US)
# Only the shield talks to origin, all edges talk to shield
# Reduces origin requests by up to 90%`,
  },
  {
    title: "Edge Caches & Stores Response",
    phase: "Phase 3: Origin",
    summary:
      "The origin response comes back to the edge server. The CDN reads the Cache-Control headers to decide if and how long to cache this resource. It stores the response locally and then forwards it to the waiting user. Future requests for this resource will be cache hits.",
    technical: [
      "CDN reads Cache-Control, Expires, ETag, Last-Modified headers from origin response",
      "Cache-Control: max-age=86400 → cache for 24 hours",
      "Cache-Control: no-store → never cache (for sensitive/dynamic content)",
      "s-maxage overrides max-age for CDN caches specifically (browser ignores s-maxage)",
      "Surrogate-Control header: CDN-specific, not sent to browser — allows different TTLs",
      "Content stored compressed, with metadata (TTL, ETag) for future revalidation",
    ],
    code: `# Cache-Control directives CDNs respect:
Cache-Control: public, max-age=31536000  
# → cache for 1 year (immutable assets with hash in URL)

Cache-Control: public, s-maxage=3600, max-age=0
# → CDN caches for 1h, browsers don't cache

Cache-Control: no-cache
# → always revalidate (but can still be cached)

Cache-Control: no-store
# → never cache (private data, payments, etc)

# Surrogate-Control (CDN-specific, stripped before browser):
Surrogate-Control: max-age=86400

# Perfect setup: assets with content hash in filename
# bundle.a8f3d1.js → Cache-Control: max-age=31536000, immutable
# When content changes → new filename → new cache entry`,
  },
  {
    title: "Deliver to User",
    phase: "Phase 4: Response",
    summary:
      "Whether it was a cache hit or a freshly fetched origin response, the edge server now delivers the final response to the user. The content travels the short distance from the nearby edge node to the user's device — fast, compressed, and over HTTP/2 or HTTP/3.",
    technical: [
      "Response compressed (brotli preferred over gzip — 15–20% smaller) if not already",
      "HTTP/2 multiplexing: multiple resources delivered over one TCP connection simultaneously",
      "HTTP/3 (QUIC): eliminates TCP head-of-line blocking, faster on lossy mobile networks",
      "Push: CDN can proactively push resources the browser will need (Link: rel=preload headers)",
      "Streaming: large files / video delivered in chunks, user sees content before full download",
      "CDN adds response headers: CF-Cache-Status, X-Cache, Age, Via for observability",
    ],
    code: `# Final response headers user receives:
HTTP/2 200 OK
Content-Type: image/webp
Content-Encoding: br                  ← brotli compressed
Cache-Control: public, max-age=86400
ETag: "d41d8cd98f00b204"
Age: 7234                             ← cached 2h ago
CF-Cache-Status: HIT
CF-Ray: 7a8b9c0d-BOM                 ← edge PoP: Mumbai
Server: cloudflare
X-Content-Type-Options: nosniff
Strict-Transport-Security: max-age=31536000

# HTTP/3 / QUIC delivery:
# CDN advertises HTTP/3 support:
Alt-Svc: h3=":443"; ma=86400

# Next request uses QUIC — faster on mobile
# No TCP handshake, 0-RTT resumption for repeat visits`,
  },
  {
    title: "Cache Invalidation — The Hard Problem",
    phase: "Phase 5: Management",
    summary:
      "Phil Karlton famously said: 'There are only two hard things in Computer Science: cache invalidation and naming things.' When you deploy new code or update content, cached copies at edge nodes are stale. You need to tell hundreds of edge servers simultaneously to dump their cache.",
    technical: [
      "Purge by URL: tell CDN to delete specific cached URLs immediately",
      "Purge by tag/key: tag assets at cache time, purge all with one tag in one API call",
      "Cache-busting: embed content hash in filename (bundle.a8f3d1.js) — URL changes = new cache",
      "TTL-based expiry: wait for max-age to expire naturally (simple but slow — up to 24h stale)",
      "Instant purge: Cloudflare/Fastly can propagate purge to all edges in < 150ms globally",
      "Stale-while-revalidate: serve stale immediately, purge/revalidate async — best of both worlds",
    ],
    code: `# Cloudflare Cache Purge API:
curl -X POST "https://api.cloudflare.com/client/v4/zones/{zone_id}/purge_cache" \\
  -H "Authorization: Bearer {token}" \\
  -H "Content-Type: application/json" \\
  --data '{"files":["https://example.com/old-image.jpg"]}'

# Purge by cache tag (tag assets at origin):
# Origin response header:
Cache-Tag: product-123, category-electronics

# Purge all assets tagged "product-123":
curl -X POST ".../purge_cache" \\
  --data '{"tags":["product-123"]}'
# → invalidates across 300+ PoPs in <150ms

# Best practice: cache-busting with content hash
# Old:  /static/main.js       ← hard to invalidate
# New:  /static/main.3f9a1b.js ← change content = new URL
#       Cache-Control: max-age=31536000, immutable`,
  },
];

// ─── PIPELINE COMPONENT ───────────────────────────────────────────────────────
const CdnPipeline = ({ started, activeStep, setActiveStep }) => {
  const [revealedUpTo, setRevealedUpTo] = useState(-1);

  useEffect(() => {
    if (!started) {
      setRevealedUpTo(-1);
      return;
    }
    let i = 0;
    const interval = setInterval(() => {
      setRevealedUpTo((prev) => {
        if (prev >= CDN_STEPS.length - 1) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
      i++;
      if (i >= CDN_STEPS.length) clearInterval(interval);
    }, 220);
    return () => clearInterval(interval);
  }, [started]);

  const groupedPhases = [];
  let currentPhase = null;
  CDN_STEPS.forEach((step, i) => {
    if (step.phase !== currentPhase) {
      currentPhase = step.phase;
      groupedPhases.push({ phase: step.phase, steps: [] });
    }
    groupedPhases[groupedPhases.length - 1].steps.push({ ...step, index: i });
  });

  return (
    <section className="journey-pipeline">
      <h2 className="section-title">
        CDN Journey
        {started && <span className="journey-live">● Live</span>}
      </h2>

      <div className="phase-groups">
        {groupedPhases.map(({ phase, steps }) => (
          <div key={phase} className="phase-group">
            <div className="phase-label" style={{ color: PHASE_COLORS[phase] }}>
              {phase}
            </div>
            <div className="phase-steps">
              {steps.map(({ id, icon, label, index }) => (
                <button
                  key={id}
                  className={`step-node ${index <= revealedUpTo ? "revealed" : "hidden"} ${activeStep === index ? "active" : ""}`}
                  style={{ "--step-color": PHASE_COLORS[phase] }}
                  onClick={() =>
                    setActiveStep(activeStep === index ? null : index)
                  }
                  disabled={index > revealedUpTo}
                >
                  <span className="step-icon">{icon}</span>
                  <span className="step-label">{label}</span>
                  {index < CDN_STEPS.length - 1 &&
                    index === Math.max(...steps.map((s) => s.index)) && (
                      <span className="phase-arrow">→</span>
                    )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="pipeline-linear">
        {CDN_STEPS.map((step, i) => (
          <span key={step.id}>
            <button
              className={`pipeline-dot ${i <= revealedUpTo ? "dot-revealed" : ""} ${activeStep === i ? "dot-active" : ""}`}
              style={{ "--step-color": PHASE_COLORS[step.phase] }}
              onClick={() => setActiveStep(activeStep === i ? null : i)}
              disabled={i > revealedUpTo}
              title={step.label}
            />
            {i < CDN_STEPS.length - 1 && (
              <span
                className={`pipeline-line ${i < revealedUpTo ? "line-active" : ""}`}
              />
            )}
          </span>
        ))}
      </div>
      <p className="pipeline-hint">
        {started
          ? "Click any node above for a deep dive"
          : "Press Start Journey to begin"}
      </p>
    </section>
  );
};

// ─── STEP EXPLAINER ───────────────────────────────────────────────────────────
const CdnStepExplainer = ({ stepIndex }) => {
  const detail = STEP_DETAILS[stepIndex];
  const step = CDN_STEPS[stepIndex];
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

// ─── INTRO SECTION ────────────────────────────────────────────────────────────
const CdnInput = ({ onStart }) => (
  <section className="url-input-section">
    <h1 className="main-title">
      How a CDN
      <br />
      <span className="title-accent">Actually Works</span>
    </h1>
    <p className="subtitle">
      A Content Delivery Network serves files from servers physically near you —
      turning 200ms round trips into 8ms. Here's exactly how.
    </p>
    <div
      style={{
        display: "flex",
        gap: "12px",
        justifyContent: "center",
        flexWrap: "wrap",
      }}
    >
      <button className="start-btn" onClick={onStart}>
        Start CDN Journey →
      </button>
    </div>
    <div className="example-links" style={{ marginTop: "20px" }}>
      <span>Real CDN providers:</span>
      {["Cloudflare", "AWS CloudFront", "Fastly", "Akamai"].map((p) => (
        <span key={p} className="example-chip">
          {p}
        </span>
      ))}
    </div>
  </section>
);

// ─── MAIN PAGE COMPONENT ──────────────────────────────────────────────────────
export const CdnJourneyPage = ({ onBack }) => {
  const [started, setStarted] = useState(false);
  const [activeStep, setActiveStep] = useState(null);
  const [animating, setAnimating] = useState(false);
  const [shown, setShown] = useState(false);

  const handleStart = () => {
    setShown(true);
    setStarted(false);
    setActiveStep(null);
    setAnimating(true);
    setTimeout(() => {
      setStarted(true);
      setAnimating(false);
    }, 400);
  };

  return (
    <>
      <main>
        <div className="page-back-row">
          <button className="page-back-btn" onClick={onBack}>
            ← Back to topics
          </button>
        </div>

        <CdnInput onStart={handleStart} />

        {shown && (
          <div className={`results ${animating ? "fade-in" : "visible"}`}>
            {/* CDN STATS BANNER */}
            <div className="cdn-stats-banner">
              {[
                { label: "Cloudflare PoPs", value: "300+", color: "#ff6b35" },
                { label: "Akamai PoPs", value: "4,000+", color: "#06d6a0" },
                {
                  label: "Typical cache hit ratio",
                  value: "90–95%",
                  color: "#118ab2",
                },
                {
                  label: "Latency reduction",
                  value: "10–50×",
                  color: "#a29bfe",
                },
              ].map(({ label, value, color }) => (
                <div key={label} className="cdn-stat">
                  <span className="cdn-stat-val" style={{ color }}>
                    {value}
                  </span>
                  <span className="cdn-stat-label">{label}</span>
                </div>
              ))}
            </div>

            <CdnPipeline
              started={started}
              activeStep={activeStep}
              setActiveStep={setActiveStep}
            />

            {activeStep !== null && <CdnStepExplainer stepIndex={activeStep} />}
          </div>
        )}

        {!shown && (
          <div className="hero-hint">
            <div className="hint-grid">
              <div className="hint-card">
                <span className="hint-num">01</span>
                <p>Learn why CDNs reduce latency from 200ms to under 10ms</p>
              </div>
              <div className="hint-card">
                <span className="hint-num">02</span>
                <p>Understand cache hits, misses, and invalidation in depth</p>
              </div>
              <div className="hint-card">
                <span className="hint-num">03</span>
                <p>See real HTTP headers, curl commands & CDN config code</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
};
