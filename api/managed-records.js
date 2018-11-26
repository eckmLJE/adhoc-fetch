import fetch from "../util/fetch-fill";
import URI from "urijs";

// /records endpoint
window.path = "http://localhost:3000/records";

// Your retrieve function plus any additional functions go here ...

// RETRIEVE

// First we process the options object argument for page # and colors.
// Setting a default empty object makes things a little easier for us.

const retrieve = (optionsObj = {}) => {
  const pageData = pagination(optionsObj.page);
  const colorData = optionsObj.colors;
  let url = constructURL(pageData, colorData);
  return fetchAndTransform(url, pageData);
};

// PAGINATION

// We assume the API contains a fixed number of records (500).
// A request without a page specified returns the first page by default.
// Later, if the response is empty then will set nextPage to null.

const pagination = page => {
  return page > 1
    ? {
        previousPage: between(page, 1, 51) ? page - 1 : 50,
        nextPage: between(page, 1, 50) ? page + 1 : null,
        offset: (page - 1) * 10
      }
    : defaultPageData();
};

const between = (x, min, max) => x > min && x < max;

const defaultPageData = () => ({
  previousPage: null,
  nextPage: 2,
  offset: 0
});

// URL + FETCH

const constructURL = (pageData, colorData) => {
  let url = URI(window.path);
  const searchOptions = {
    limit: 10,
    offset: pageData.offset,
    "color[]": colorData
  };
  return url.search(searchOptions);
};

const fetchAndTransform = (url, pageData) => {
  return fetch(url)
    .then(res => {
      // console.log(res.headers.map);
      if (res.ok) {
        return res.json().then(json => transformJson(json, pageData));
      }
      console.log(res.statusText);
    })
    .catch(console.log);
};

// TRANSFORM

const transformJson = (json, pageData) => {
  const transformed = templateResp(pageData);
  if (json.length) {
    const reduced = reduceOpenItems(json);
    transformed.ids = json.map(el => el.id);
    transformed.open = reduced.open;
    transformed.closedPrimaryCount = reduced.closedPrimaryCount;
  } else {
    transformed.nextPage = null;
  }
  return transformed;
};

const templateResp = pageData => ({
  previousPage: pageData.previousPage,
  nextPage: pageData.nextPage,
  ids: [],
  open: [],
  closedPrimaryCount: 0
});

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

export default retrieve;
