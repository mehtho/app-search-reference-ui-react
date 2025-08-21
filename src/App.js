import React from "react";

import { ApiProxyConnector } from "@elastic/search-ui-elasticsearch-connector/api-proxy";

import {
  ErrorBoundary,
  Facet,
  SearchProvider,
  SearchBox,
  Results,
  PagingInfo,
  ResultsPerPage,
  Paging,
  Sorting,
  WithSearch
} from "@elastic/react-search-ui";
import { Layout } from "@elastic/react-search-ui-views";
import "@elastic/react-search-ui-views/lib/styles/styles.css";

import {
  buildAutocompleteQueryConfig,
  buildFacetConfigFromConfig,
  buildSearchOptionsFromConfig,
  buildSortOptionsFromConfig,
  getConfig,
  getFacetFields
} from "./config/config-helper";

const { hostIdentifier, searchKey, endpointBase, engineName } = getConfig();
const connector = new ApiProxyConnector({
  endpointBase: "/api"
});

const config = {
  searchQuery: {
    track_total_hits: true,

    search_fields: {
      generated_text: { weight: 3 },
      duration: {},
      age: {},
      gender: {},
      accent: {}
    },
    result_fields: {
      generated_text: { snippet: { size: 200, fallback: true } },
      duration: { raw: {} },
      age: { raw: {} },
      gender: { raw: {} },
      accent: { raw: {} }
    },
    disjunctiveFacets: ["age.keyword", "gender.keyword", "accent.keyword"],
    facets: {
      "age.keyword": { type: "value" },
      "gender.keyword": { type: "value" },
      "accent.keyword": { type: "value" },
      duration: {
        type: "range",
        ranges: [
          { to: 5, name: "Short (<5s)" },
          { from: 5, to: 15, name: "Medium (5-15s)" },
          { from: 15, name: "Long (>15s)" }
        ]
      }
    }
  },
  autocompleteQuery: {
    results: {
      resultsPerPage: 30,
      search_fields: {
        generated_text: { weight: 2 }
      },
      result_fields: {
        generated_text: {
          snippet: { size: 100, fallback: true }
        },
        duration: { raw: {} },
        age: { raw: {} },
        gender: { raw: {} },
        accent: { raw: {} }
      }
    }
  },
  apiConnector: connector,
  alwaysSearchOnInitialLoad: true
};


export default function App() {
  return (
    <SearchProvider config={config}>
      <WithSearch mapContextToProps={({ wasSearched }) => ({ wasSearched })}>
        {({ wasSearched }) => {
          return (
            <div className="App">
              <ErrorBoundary>
                <Layout
                  header={<SearchBox autocompleteSuggestions={true} />}
                  sideContent={
                    <div>
                      {wasSearched && (
                        <Sorting
                          label={"Sort by"}
                          sortOptions={buildSortOptionsFromConfig()}
                        />
                      )}
                      {getFacetFields().map(field => (
                        <Facet key={field} field={field} label={field} />
                      ))}
                    </div>
                  }
                  bodyContent={
                    <Results
                      titleField={getConfig().titleField}
                      urlField={getConfig().urlField}
                      thumbnailField={getConfig().thumbnailField}
                      shouldTrackClickThrough={true}
                    />
                  }
                  bodyHeader={
                    <React.Fragment>
                      {wasSearched && <PagingInfo />}
                      {wasSearched && <ResultsPerPage />}
                    </React.Fragment>
                  }
                  bodyFooter={<Paging />}
                />
              </ErrorBoundary>
            </div>
          );
        }}
      </WithSearch>
    </SearchProvider>
  );
}
