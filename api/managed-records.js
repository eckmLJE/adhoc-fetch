import fetch from "../util/fetch-fill";
import URI from "urijs";

// /records endpoint
window.path = "http://localhost:3000/records";

// Your retrieve function plus any additional functions go here ...

const retrieve = (optionsObj = {}) => {
  console.log(optionsObj);
  let url = constructURL(optionsObj);
  console.log(url);
  const transformed = fetchRecords(url).then(json =>
    transformJson(json, optionsObj)
  );
  return transformed;
};

// Fetch + URL

const fetchRecords = url => {
  return fetch(url)
    .then(res => res.json())
    .catch(console.log);
};

const constructURL = optionsObj => {
  let url = URI("http://localhost:3000/records");
  const searchOptions = getSearchOptions(url, optionsObj);
  return url.search(searchOptions);
};

const getSearchOptions = (url, optionsObj) => {
  const searchOptions = { limit: 10, offset: 0 };
  if (!!optionsObj.page && !!(optionsObj.page > 1)) {
    searchOptions.offset = (optionsObj.page - 1) * 10;
  }
  if (optionsObj.colors) {
    searchOptions.color = optionsObj.colors;
  }
  return searchOptions;
};

// Transform Response

const transformJson = (json, optionsObj) => {
  const ids = json.map(el => el.id);
  const reduced = reduceOpenItems(json);
  const pageData = getPageData(optionsObj);
  return {
    previousPage: pageData.previousPage,
    nextPage: pageData.nextPage,
    ids,
    open: reduced.open,
    closedPrimaryCount: reduced.closedPrimaryCount
  };
};

const reduceOpenItems = json => {
  let closedPrimaryCount = 0;
  const open = json.reduce((filtered, item) => {
    const isPrimary = checkPrimary(item.color);
    if (item.disposition === "open") {
      item.isPrimary = isPrimary;
      filtered.push(item);
    }
    if (item.disposition === "closed" && isPrimary) closedPrimaryCount++;
    return filtered;
  }, []);
  return { open, closedPrimaryCount };
};

const checkPrimary = color => {
  const primaryColors = ["red", "blue", "yellow"];
  return primaryColors.includes(color);
};

const getPageData = optionsObj => {
  const pageData = {
    previousPage: null,
    nextPage: 2
  };
  if (optionsObj.page > 1) {
    pageData.previousPage = optionsObj.page - 1;
    pageData.nextPage = optionsObj.page + 1;
  }
  return pageData;
};

export default retrieve;
