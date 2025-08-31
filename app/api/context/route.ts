export const maxDuration = 30;

const CONTEXT_SOURCES: Record<string, string> = {
  playwright: "https://context7.com/microsoft/playwright/llms.txt?tokens=60000",
  selenium: "https://context7.com/seleniumhq/selenium/llms.txt?tokens=60000",
  cypress:
    "https://context7.com/cypress-io/cypress-documentation/llms.txt?tokens=60000",
};

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const key = url.searchParams.get("key");

    if (!key || !(key in CONTEXT_SOURCES)) {
      return new Response("Invalid or missing key", { status: 400 });
    }

    const target = CONTEXT_SOURCES[key];

    const res = await fetch(target, {
      // Optionally set a UA; some hosts block default fetch UA
      headers: { "user-agent": "testscribe/1.0" },
      // Disable Next's fetch caching for now to ensure freshness
      cache: "no-store",
    });

    if (!res.ok) {
      return new Response(`Upstream error (${res.status})`, { status: 502 });
    }

    const text = await res.text();

    return new Response(text, {
      headers: {
        "content-type": "text/plain; charset=utf-8",
        // Cache at the edge for 1 hour; callers can revalidate per request
        "cache-control": "s-maxage=3600, stale-while-revalidate=86400",
      },
      status: 200,
    });
  } catch (e) {
    return new Response("Failed to fetch context", { status: 500 });
  }
}
