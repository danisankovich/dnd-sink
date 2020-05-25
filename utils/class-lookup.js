const classes = {
  barbarian: require('../resources/classes/barbarian.json'),
}

function classLookup(className, searchTerm) {
  if (!searchTerm) {
    return 'Please provide a search term';
  }
  const chosen = classes[className.toLowerCase()];
  let feature = chosen[searchTerm.toLowerCase()];
  if (!feature) {
    const keys = Object.keys(chosen);
    const key = keys.find(k => k.toLowerCase().includes(searchTerm.toLowerCase()));
    feature = chosen[key];
  }

  return feature || `${className} feature "${searchTerm}" not found.`;
}
