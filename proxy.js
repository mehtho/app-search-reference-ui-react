const express = require("express");
const path = require("path");
const fs = require("fs");
const { default: ElasticsearchAPIConnector } = require("@elastic/search-ui-elasticsearch-connector");

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

  const connector = new ElasticsearchAPIConnector({
    host: "https://172.191.12.215:9200",
    index: "cv-transcriptions",
    apiKey
  });

  const app = express();
  app.use(express.json());

  // API routes only (React dev server handles frontend in dev mode)
  app.post("/api/search", async (req, res) => {
    try {
      const { state, queryConfig } = req.body;
      res.json(await connector.onSearch(state, queryConfig));
    } catch (err) {
      console.error("Search error:", err);
      res.status(500).json({ error: "Search failed" });
    }
  });

  app.post("/api/autocomplete", async (req, res) => {
    try {
      const { state, queryConfig } = req.body;
      res.json(await connector.onAutocomplete(state, queryConfig));
    } catch (err) {
      console.error("Autocomplete error:", err);
      res.status(500).json({ error: "Autocomplete failed" });
    }
  });

  app.use(express.static(path.join(__dirname, "build")));

  app.use((req, res) => {
    res.sendFile(path.join(__dirname, "build", "index.html"));
  });

  const PORT = 3000;
  app.listen(3000, () => {
    console.log("API listening on port 3000");
  });
}

start();
