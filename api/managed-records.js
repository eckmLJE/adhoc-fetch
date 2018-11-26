import fetch from "../util/fetch-fill";
import URI from "urijs";

// /records endpoint
window.path = "http://localhost:3000/records";

// Your retrieve function plus any additional functions go here ...

// Setting a default empty object makes things a little easier for us
const retrieve = (optionsObj = {}) => {
  let url = constructURL(optionsObj);
  return fetchAndTransform(url, optionsObj.page);
};

// URL + FETCH

// Request 11 items to check later for nextPage
const constructURL = optionsObj =>
  URI(window.path).search({
    limit: 11,
    offset: optionsObj.page ? (optionsObj.page - 1) * 10 : 0,
    // url will still construct with undefined optionsObj.colors
    "color[]": optionsObj.colors
  });

const fetchAndTransform = (url, page = 1) =>
  fetch(url).then(res =>
    res.ok
      ? res.json().then(json => transformJson(json, page))
      : console.log(res.statusText)
  );

// TRANSFORM

const transformJson = (json, page) => {
  const transform = templateTransform();
  if (json.length === 11) transform.nextPage = page + 1;
  if (page > 1) transform.previousPage = page - 1;
  if (json.length) {
    const processedItems = processOpenItems(json.slice(0, 10));
    Object.assign(transform, processedItems);
  }
  return transform;
};

const templateTransform = () => ({
  previousPage: null,
  nextPage: null,
  ids: [],
  open: [],
  closedPrimaryCount: 0
});

// .reduce() to return ids array, filter open results, add isPrimary
// key, and count closed primary items. It's a relatively long function,
// but returns what we need without iterating multiple times.
const processOpenItems = results => {
  let closedPrimaryCount = 0;
  let ids = [];
  const open = results.reduce((filtered, item) => {
    ids.push(item.id);
    const isPrimary = checkPrimary(item.color);
    if (item.disposition === "open") {
      item.isPrimary = isPrimary;
      filtered.push(item);
    }
    if (item.disposition === "closed" && isPrimary) closedPrimaryCount++;
    return filtered;
  }, []);
  return { ids, open, closedPrimaryCount };
};

const checkPrimary = color => {
  const primaryColors = ["red", "blue", "yellow"];
  return primaryColors.includes(color);
};

export default retrieve;
