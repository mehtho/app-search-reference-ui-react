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
      generated_text: { weight: 3 }
    },
    result_fields: {
      generated_text: { snippet: { size: 200, fallback: true } },
      duration: { raw: {} },
      age: { raw: {} },
      gender: { raw: {} },
      accent: { raw: {} }
    },
disjunctiveFacets: ["age", "gender", "accent"],

facets: {
    age: {
      type: "value",
      options: [
        { value: "", name: "Unknown" },
        { value: "teens", name: "Teens" },
        { value: "twenties", name: "Twenties" },
        { value: "thirties", name: "Thirties" },
        { value: "fourties", name: "Forties" },
        { value: "fifties", name: "Fifties" },
        { value: "sixties", name: "Sixties" },
        { value: "seventies", name: "Seventies" },
        { value: "eighties", name: "Eighties" }
      ]
    },
    gender: {
      type: "value",
      options: [
        { value: "", name: "Unknown" },
        { value: "male", name: "Male" },
        { value: "female", name: "Female" }
      ]
    },
    accent: {
      type: "value",
      options: [
        { value: "", name: "Unknown" },
        { value: "us", name: "US" },
        { value: "england", name: "England" },
        { value: "australia", name: "Australia" },
        { value: "indian", name: "Indian" },
        { value: "canada", name: "Canada" },
        { value: "scotland", name: "Scotland" },
        { value: "african", name: "African" },
        { value: "newzealand", name: "New Zealand" },
        { value: "ireland", name: "Ireland" },
        { value: "malaysia", name: "Malaysia" },
        { value: "philippines", name: "Philippines" },
        { value: "bermuda", name: "Bermuda" },
        { value: "southatlandtic", name: "South Atlantic" },
        { value: "hongkong", name: "Hong Kong" },
        { value: "singapore", name: "Singapore" },
        { value: "wales", name: "Wales" }
      ]
    },
    duration: {
      type: "range",
      ranges: [
        { to: 5, name: "Short (<5s)" },
        { from: 5, to: 10, name: "5–10s" },
        { from: 10, to: 20, name: "10–20s" },
        { from: 20, to: 30, name: "20–30s" },
        { from: 30, name: "Long (>30s)" }
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
