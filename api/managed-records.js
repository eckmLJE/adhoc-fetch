import fetch from "../util/fetch-fill";
import URI from "urijs";

// /records endpoint
window.path = "http://localhost:3000/records";

// Your retrieve function plus any additional functions go here ...
const retrieve = optionsObj => {
  let url = constructURL(optionsObj);
  return fetchRecords(url).then(json => transformJson(json));
};

const constructURL = optionsObj => {
  let url = URI("http://localhost:3000/records").search({
    limit: 10,
    offset: 0
  });
  return optionsObj ? applyOptions(url, optionsObj) : url;
};

const applyOptions = (url, optionsObj) => {
  console.log(optionsObj);
  if (optionsObj.page) {
    url.page = optionsObj.page;
    url.offset = (optionsObj.page - 1) * 10;
  }
  return url;
};

const fetchRecords = url => {
  return fetch(url)
    .then(res => res.json())
    .catch(console.log);
};

const transformJson = json => {
  let closedPrimaryCount = 0;
  const ids = json.map(el => el.id);
  const reduced = reduceOpenItems(json);
  return {
    previousPage: null,
    nextPage: 2,
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
      filtered.push({
        id: item.id,
        color: item.color,
        disposition: item.disposition,
        isPrimary: isPrimary
      });
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
