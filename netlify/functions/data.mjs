import { getStore } from "@netlify/blobs";

const STORE_NAME = "knbt1-data";

export default async (req, context) => {
  const store = getStore(STORE_NAME);
  const url = new URL(req.url);
  const user = url.searchParams.get("user");
  const listAll = url.searchParams.get("list") === "all";

  // Admin: list all teacher keys
  if (req.method === "GET" && listAll) {
    try {
      const { blobs } = await store.list();
      const results = {};
      for (const blob of blobs) {
        const data = await store.get(blob.key);
        if (data) {
          try {
            results[blob.key] = JSON.parse(data);
          } catch {
            // skip invalid entries
          }
        }
      }
      return new Response(JSON.stringify(results), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error listing data:", error);
      return new Response(JSON.stringify({ error: "Failed to list data" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  if (!user) {
    return new Response(JSON.stringify({ error: "Missing user parameter" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const dataKey = `teacher-${user}`;

  if (req.method === "GET") {
    try {
      const data = await store.get(dataKey);
      if (!data) {
        return new Response(JSON.stringify(null), {
          headers: { "Content-Type": "application/json" },
        });
      }
      return new Response(data, {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error reading data:", error);
      return new Response(JSON.stringify({ error: "Failed to read data" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  if (req.method === "PUT" || req.method === "POST") {
    try {
      const body = await req.text();
      JSON.parse(body); // validate it's valid JSON
      await store.set(dataKey, body);
      return new Response(JSON.stringify({ ok: true }), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error saving data:", error);
      return new Response(JSON.stringify({ error: "Failed to save data" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config = {
  path: "/api/data",
};
