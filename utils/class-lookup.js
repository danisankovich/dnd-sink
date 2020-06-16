const Discord = require('discord.js');

const classes = {
  barbarian: require('../resources/classes/barbarian.json'),
  bard: require('../resources/classes/bard.json'),
  'blood-hunter': require('../resources/classes/blood-hunter.json'),
  'cleric': require('../resources/classes/cleric.json'),
}

function classLookup(className, msg) {
  const embed = new Discord.MessageEmbed();
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
    embed.setDescription(`**${feature.name}**\n\n${feature.description}`)
    msg.channel.send(embed);
    if (feature.features) {
      feature.features.forEach(e => {
        const innerEmbed = new Discord.MessageEmbed();
        innerEmbed.setDescription(`**${e.name}**\n\n${e.description}`)

        msg.channel.send(innerEmbed);
      })
    }
  } else {
    msg.channel.send(`Feature: "${searchTerm}" not found for "${className}." If you are searching for a subclass feature, search for the subclass`);
  }
}

module.exports = classLookup;
