import fetch from "../util/fetch-fill";
import URI from "urijs";

// /records endpoint
window.path = "http://localhost:3000/records";

// Your retrieve function plus any additional functions go here ...

const retrieve = (optionsObj = {}) => {
  console.log("optionsObj: ", optionsObj);
  const pageData = pagination(optionsObj.page);
  const colorData = optionsObj.colors;
  let url = constructURL(pageData, colorData);
  const transformed = fetchRecords(url).then(json =>
    transformJson(json, optionsObj)
  );
  return transformed;
};

// Pagination

const between = (x, min, max) => x > min && x < max;

const pagination = page => {
  return page > 1
    ? {
        previousPage: between(page, 1, 51) ? page - 1 : 50,
        nextPage: between(page, 1, 50) ? page + 1 : null,
        offset: (page - 1) * 10
      }
    : defaultPageData();
};

const defaultPageData = () => ({
  previousPage: null,
  nextPage: 2,
  offset: 0
});

// Fetch + URL

const fetchRecords = url => {
  return fetch(url)
    .then(res => {
      console.log("Response: ", res);
      return res.json();
    })
    .catch(console.log);
};

const constructURL = (pageData, colorData) => {
  let url = URI("http://localhost:3000/records");
  const searchOptions = {
    limit: 10,
    offset: pageData.offset,
    color: colorData
  };
  return url.search(searchOptions);
};

// Transform Response

const emptyResp = () => ({
  previousPage: null,
  nextPage: null,
  ids: [],
  open: [],
  closedPrimaryCount: 0
});

const transformJson = (json, optionsObj) => {
  console.log("parsed JSON: ", json);
  if (json.length === 0) {
    return emptyResp();
  }
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
  if (optionsObj.page > 1 && optionsObj.page < 50) {
    pageData.previousPage = optionsObj.page - 1;
    pageData.nextPage = optionsObj.page + 1;
  } else if (optionsObj.page === 50) {
    pageData.previousPage = 49;
    pageData.nextPage = null;
  } else if (optionsObj.page > 50) {
    pageData.previousPage = 50;
    pageData.nextPage = null;
  }
  return pageData;
};

export default retrieve;
