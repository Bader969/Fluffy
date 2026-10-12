import { defineConfig } from "vite";
import { createSlots } from "./src/commerce-core.js";
export default defineConfig({
  plugins: [
    {
      name: "fluffy-local-preview",
      configureServer(server) {
        server.middlewares.use("/api/commerce", (req, res) => {
          res.setHeader("Content-Type", "application/json");
          res.setHeader("Cache-Control", "no-store");
          if (req.method === "GET") {
            res.end(
              JSON.stringify({
                enabled: false,
                mode: "preview",
                slots: createSlots(),
                business: {},
              }),
            );
          } else {
            res.statusCode = 503;
            res.end(
              JSON.stringify({
                error: "Lokale Vorschau: Es wurde nichts übermittelt.",
              }),
            );
          }
        });
      },
    },
  ],
});
