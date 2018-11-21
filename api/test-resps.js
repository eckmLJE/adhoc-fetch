const testObj = {
  previousPage: null,
  nextPage: 2,
  ids: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  open: [
    Object({ id: 2, color: "yellow", disposition: "open", isPrimary: true }),
    Object({ id: 4, color: "brown", disposition: "open", isPrimary: false }),
    Object({ id: 6, color: "blue", disposition: "open", isPrimary: true }),
    Object({ id: 8, color: "green", disposition: "open", isPrimary: false }),
    Object({ id: 10, color: "red", disposition: "open", isPrimary: true })
  ],
  closedPrimaryCount: 1
};

const respArray = [
  Object({ id: 1, color: "brown", disposition: "closed" }),
  Object({ id: 2, color: "yellow", disposition: "open" }),
  Object({ id: 3, color: "brown", disposition: "closed" }),
  Object({ id: 4, color: "brown", disposition: "open" }),
  Object({ id: 5, color: "red", disposition: "closed" }),
  Object({ id: 6, color: "blue", disposition: "open" }),
  Object({ id: 7, color: "green", disposition: "closed" }),
  Object({ id: 8, color: "green", disposition: "open" }),
  Object({ id: 9, color: "brown", disposition: "closed" }),
  Object({ id: 10, color: "red", disposition: "open" })
];
