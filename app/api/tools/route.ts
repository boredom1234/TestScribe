// Using Node.js runtime for Composio SDK compatibility
// export const runtime = "edge";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search") || undefined;
    const toolkit_slug = searchParams.get("toolkit_slug") || undefined;
    const tags = searchParams.get("tags") || undefined;
    const important = searchParams.get("important") || undefined;
    const tool_slugs = searchParams.get("tool_slugs") || undefined;
    const limit = searchParams.get("limit") || "50";
    const cursor = searchParams.get("cursor") || undefined;

    const clientKey = req.headers.get("x-client-composio-key") || undefined;
    const apiKey = clientKey || process.env.COMPOSIO_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "COMPOSIO_API_KEY not configured" }),
        {
          status: 500,
          headers: { "content-type": "application/json" },
        },
      );
    }

    const url = new URL("https://backend.composio.dev/api/v3/tools");
    // Forward supported filters to Composio
    if (search) url.searchParams.append("search", search);
    if (toolkit_slug) url.searchParams.append("toolkit_slug", toolkit_slug);
    if (tags) url.searchParams.append("tags", tags);
    if (important) url.searchParams.append("important", important);
    if (tool_slugs) url.searchParams.append("tool_slugs", tool_slugs);
    if (cursor) url.searchParams.append("cursor", cursor);
    if (limit) url.searchParams.append("limit", limit);

    const response = await fetch(url.toString(), {
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      await response.text().catch(() => "Unknown error");
      return new Response(
        JSON.stringify({ error: "Failed to fetch tools" }),
        {
          status: response.status,
          headers: { "content-type": "application/json" },
        },
      );
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: { "content-type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
