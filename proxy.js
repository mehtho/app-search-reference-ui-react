import express from "express";
import ElasticsearchAPIConnector from "@elastic/search-ui-elasticsearch-connector";
import fs from "fs";

const app = express();
app.use(express.json());

const apiKey = fs.readFileSync("keys/api-key.txt", "utf-8").trim();

const connector = new ElasticsearchAPIConnector({
  host: "https://172.191.12.215:9200",
  index: "cv-transcriptions",
  apiKey
});

app.post("/api/search", async (req, res) => {
  const { state, queryConfig } = req.body;
  const response = await connector.onSearch(state, queryConfig);
  res.json(response);
});

app.post("/api/autocomplete", async (req, res) => {
  const { state, queryConfig } = req.body;
  const response = await connector.onAutocomplete(state, queryConfig);
  res.json(response);
});

app.listen(3001, () => {
  console.log("Proxy server listening on port 3001");
});
