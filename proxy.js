const express = require("express");
const path = require("path");
const fs = require("fs");
const { default: ElasticsearchAPIConnector } = require("@elastic/search-ui-elasticsearch-connector");

const app = express();
app.use(express.json());

// Serve React build
app.use(express.static(path.join(__dirname, "build")));

// API proxy
const apiKey = fs.readFileSync("keys/api-key.txt", "utf-8").trim();
const connector = new ElasticsearchAPIConnector({
  host: "https://172.191.12.215:9200",
  index: "cv-transcriptions",
  apiKey
});

app.post("/api/search", async (req, res) => {
  const { state, queryConfig } = req.body;
  res.json(await connector.onSearch(state, queryConfig));
});
app.post("/api/autocomplete", async (req, res) => {
  const { state, queryConfig } = req.body;
  res.json(await connector.onAutocomplete(state, queryConfig));
});

app.use((req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.listen(3000, () => console.log("Frontend + API on http://localhost:3000"));
