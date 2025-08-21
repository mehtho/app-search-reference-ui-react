const express = require("express");
const path = require("path");
const fs = require("fs");
const { default: ElasticsearchAPIConnector } = require("@elastic/search-ui-elasticsearch-connector");

// Utility to wait for API key file to exist
function waitForApiKey(filePath, interval = 2000) {
  return new Promise((resolve) => {
    const check = () => {
      if (fs.existsSync(filePath)) {
        const key = fs.readFileSync(filePath, "utf-8").trim();
        if (key && key.length > 0) {
          console.log("API key loaded.");
          return resolve(key);
        }
      }
      console.log("Waiting for API key...");
      setTimeout(check, interval);
    };
    check();
  });
}

async function start() {
  const apiKeyFile = "keys/api-key.txt";
  const apiKey = await waitForApiKey(apiKeyFile);

  // Pick values from env vars
  const ES_HOST = process.env.SYS_PUBLIC_IP || "127.0.0.1";
  const ES_PORT = process.env.ES_PORT || "9200";
  const SEARCH_UI_PORT = process.env.SEARCH_UI_PORT || "3000";

  const connector = new ElasticsearchAPIConnector({
    host: `https://${ES_HOST}:${ES_PORT}`,
    index: "cv-transcriptions",
    apiKey
  });

  const app = express();
  app.use(express.json());

  // Proxy API routes
  app.post("/api/search", async (req, res) => {
    try {
      const { state, queryConfig } = req.body;
      const result = await connector.onSearch(state, {
        ...queryConfig,
        additionalOptions: { rest_total_hits_as_int: true }
      });

      if (result && typeof result.totalResults === "number") {
        result.rawResponse = result.rawResponse || { hits: {} };
        result.rawResponse.hits.total = result.totalResults;
      }

      res.json(result);
    } catch (err) {
      console.error("Search error:", err);
      res.status(500).json({ error: "Search failed" });
    }
  });

  app.post("/api/autocomplete", async (req, res) => {
    try {
      const { state, queryConfig } = req.body;
      const result = await connector.onAutocomplete(state, queryConfig);

      res.json(result);
    } catch (err) {
      console.error("Autocomplete error:", err);
      res.status(500).json({ error: "Autocomplete failed" });
    }
  });

  // Serve frontend build
  app.use(express.static(path.join(__dirname, "build")));
  app.use((req, res) => {
    res.sendFile(path.join(__dirname, "build", "index.html"));
  });

  app.listen(SEARCH_UI_PORT, () => {
    console.log(`API listening on port ${SEARCH_UI_PORT}`);
  });
}

start();
