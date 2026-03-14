export const CDN_STEP_DETAILS = [
    {
        title: "1. Client Request & Anycast DNS",
        phase: "Phase 1: Routing",
        analogy: "Calling a national 1-800 number and getting automatically routed to the customer service agent closest to your city.",
        summary: "When a user requests a file, the DNS uses Anycast routing. Instead of pointing to a single origin server, the IP address directs the user to the closest available CDN Edge Server geographically.",
        technical: [
            "Anycast Routing: Multiple edge servers share the same IP address; BGP routing sends the user to the topologically closest node.",
            "Latency Reduction: By connecting to a server in their own city rather than across the globe, the TCP/TLS handshake time is drastically reduced.",
            "DDoS Mitigation: Traffic is absorbed locally across hundreds of data centers, preventing massive spikes from hitting the origin."
        ],
        code: `# DNS resolution hits the Edge
nslookup cdn.yoursite.com

# User in London gets: 104.16.x.x (London Edge)
# User in Tokyo gets: 104.16.x.x (Tokyo Edge)
# Same IP, different physical machine!`
    },
    {
        title: "2. Edge Server Interception",
        phase: "Phase 2: Edge Processing",
        analogy: "The local branch office picking up the phone to take your order.",
        summary: "The request arrives at the local CDN Edge Server (Point of Presence or PoP). The server terminates the secure connection and prepares to fulfill the HTTP request.",
        technical: [
            "PoP (Point of Presence): Data centers located strategically around the world.",
            "SSL Termination: The CDN handles the intensive TLS decryption locally, saving the origin server from CPU-heavy cryptographic work.",
            "Edge Logic: Cloudflare Workers, AWS Lambda@Edge, or VCL run here to manipulate headers, block bad bots, or execute lightweight code."
        ],
        code: `// Example Edge Function (Cloudflare Worker)
addEventListener("fetch", event => {
  // Block suspicious traffic before it hits origin
  if (event.request.headers.get("User-Agent").includes("BadBot")) {
    return event.respondWith(new Response("Blocked", { status: 403 }));
  }
});`
    },
    {
        title: "3. Cache Lookup",
        phase: "Phase 2: Edge Processing",
        analogy: "The local branch worker checking their local stockroom to see if they already have the item you want.",
        summary: "The Edge Server checks its local memory and solid-state drives to see if a valid, unexpired copy of the requested asset already exists.",
        technical: [
            "Cache Key Generation: The CDN uses the URL, and sometimes specific headers or query strings, to create a unique hash (Cache Key).",
            "Eviction Policies: Algorithms like LRU (Least Recently Used) determine which old files to delete to make room for new ones.",
            "TTL (Time To Live): Determines how long an asset is considered 'fresh' before it must be re-verified."
        ],
        code: `// Internal CDN logic
const cacheKey = generateHash(request.url + request.headers["Accept-Encoding"]);
const cachedAsset = await edgeCache.get(cacheKey);

if (cachedAsset && !isExpired(cachedAsset.ttl)) {
    return "CACHE HIT";
} else {
    return "CACHE MISS";
}`
    },
    {
        title: "4. Origin Fetch (Cache Miss)",
        phase: "Phase 3: Fallback",
        analogy: "The local branch doesn't have the item, so they order it from the main warehouse on your behalf.",
        summary: "If the asset is missing or expired (a 'Cache Miss'), the Edge Server acts as a proxy and requests the asset from your actual backend Origin Server.",
        technical: [
            "Reverse Proxying: The Edge server opens a connection to the Origin Server.",
            "Connection Pooling: CDNs keep persistent connections to the origin open to avoid repeated TCP handshakes.",
            "Tiered Caching: Some CDNs have 'Regional Edge Caches'. If the local edge misses, it checks a larger regional cache before bothering the origin."
        ],
        code: `# Edge server fetching from Origin
GET /images/hero.jpg HTTP/2
Host: origin.yoursite.com
X-Forwarded-For: 203.0.113.5  # Passing original client IP
CDN-Loop: cloudflare`
    },
    {
        title: "5. Caching & Delivery",
        phase: "Phase 4: Response",
        analogy: "The local branch hands you your item, and places a second copy on their shelf so the next person in your city gets it instantly.",
        summary: "The Origin responds to the Edge Server. The Edge Server saves a copy to its local cache based on the provided HTTP headers, and simultaneously streams it to the user.",
        technical: [
            "Cache-Control Headers: The Origin dictates the caching rules (e.g., 'public, max-age=86400').",
            "Streaming Response: The edge doesn't wait for the whole file to download from the origin; it streams the bytes to the client as they arrive.",
            "Response Headers: The CDN injects diagnostic headers like 'X-Cache: HIT' or 'Cf-Cache-Status: MISS' for debugging."
        ],
        code: `HTTP/2 200 OK
Content-Type: image/jpeg
Cache-Control: public, max-age=31536000, immutable
CF-Cache-Status: HIT       # Next time it will say HIT
Age: 14023                 # Seconds it has been in edge cache
Server: cloudflare

[... Binary Image Data ...]`
    }
];