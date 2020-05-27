const classes = {
  barbarian: require('../resources/classes/barbarian.json'),
  bard: require('../resources/classes/bard.json'),
  'blood-hunter': require('../resources/classes/blood-hunter.json'),
}

function classLookup(className, msg) {
  let searchTerm = msg.content.substr(msg.content.indexOf(' ')+1);
  if (className.includes('-')) {
    searchTerm = msg.content.split(' ');
    searchTerm.shift();
    searchTerm.shift();
    searchTerm = searchTerm.join(' ');
  }

  if (!searchTerm) {
    msg.channel.send('Please provide a search term');
  }

  const chosen = classes[className.toLowerCase()];
  let feature = chosen[searchTerm.toLowerCase()];
  if (!feature) {
    const keys = Object.keys(chosen);
    const key = keys.find(k => k.toLowerCase().includes(searchTerm.toLowerCase()));
    feature = chosen[key];
  }
  let returnStrings = [];
  if (feature) {
    msg.channel.send(`**${feature.name}** ${feature.description}`);
    if (feature.features) {
      feature.features.forEach(e => {
        msg.channel.send(`**${e.name}** ${e.description}`);
      })
    }
  } else {
    console.log(className, searchTerm)
  }
}

module.exports = classLookup;
