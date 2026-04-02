import { getStore } from "@netlify/blobs";

const STORE_NAME = "knbt1-data";
const DATA_KEY = "assessment-state";

export default async (req, context) => {
  const store = getStore(STORE_NAME);

  if (req.method === "GET") {
    try {
      const data = await store.get(DATA_KEY);
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
      await store.set(DATA_KEY, body);
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
