import fetch from "../util/fetch-fill";
import URI from "urijs";

// /records endpoint
window.path = "http://localhost:3000/records";

// Your retrieve function plus any additional functions go here ...

// RETRIEVE

// Setting a default empty object makes things a little easier for us
const retrieve = (optionsObj = {}) => {
  let url = constructURL(optionsObj);
  return fetchAndTransform(url, optionsObj.page);
};

// URL + FETCH

// Request 11 items to check later for nextPage
const constructURL = optionsObj => {
  let url = URI(window.path);
  const searchOptions = {
    limit: 11,
    offset: optionsObj.page ? (optionsObj.page - 1) * 10 : 0,
    // url will still construct properly with undefined optionsObj.colors
    "color[]": optionsObj.colors
  };
  return url.search(searchOptions);
};

const fetchAndTransform = (url, page = 1) =>
  fetch(url).then(res =>
    res.ok
      ? res.json().then(json => transformJson(json, page))
      : console.log(res.statusText)
  );

// TRANSFORM

const transformJson = (json, page) => {
  const transformed = templateTransform();
  if (json.length === 11) transformed.nextPage = page + 1;
  if (page > 1) transformed.previousPage = page - 1;
  if (json.length) {
    const results = json.slice(0, 10);
    const reduced = reduceOpenItems(results);
    transformed.ids = results.map(el => el.id);
    transformed.open = reduced.open;
    transformed.closedPrimaryCount = reduced.closedPrimaryCount;
  }
  return transformed;
};

const templateTransform = () => ({
  previousPage: null,
  nextPage: null,
  ids: [],
  open: [],
  closedPrimaryCount: 0
});

const reduceOpenItems = results => {
  let closedPrimaryCount = 0;
  const open = results.reduce((filtered, item) => {
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
