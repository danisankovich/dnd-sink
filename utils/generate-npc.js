const backgrounds = require('../resources/npc-generator/backgrounds.json');
const classes = require('../resources/npc-generator/classes.json');
const levels = require('../resources/npc-generator/levels.json');
const names = require('../resources/npc-generator/names.json');
const races = require('../resources/npc-generator/races.json');
const alignments = require('../resources/npc-generator/alignment.json');
const personalities = require('../resources/npc-generator/personalities.json');

function generateNPC(msg) {
  const raceName = msg.content.substr(msg.content.indexOf(' ')+1).toLowerCase();
  let character = {
    gender: ['m', 'f'][Math.floor(Math.random() * 2)],
    background: backgrounds[Math.floor(Math.random() * backgrounds.length)],
    class: Math.round(Math.random()) === 0 ? 'None' : classes[Math.floor(Math.random() * classes.length)],
    alignment: alignments[Math.floor(Math.random() * alignments.length)],
    personality: personalities[Math.floor(Math.random() * personalities.length)]
  };
  let race = races.find(r => r.race === raceName);
  if (!race) {
    const raceNames = races.map(r => r.race).join(', ');
    if (raceName === '!generate') {
      msg.reply(`Generating random character`);
    } else {
      msg.reply(`Could not find "${raceName}" in the race collection: ${raceNames}. Generating random character`);
    }
    race = races[Math.floor(Math.random() * races.length)];
  }
  character.race = race.race;

  const racialNames = names.firstNames.filter(n => n.racePreference.some(r => race.nameList.includes(r)) && n.gender.includes(character.gender));
  character.name = racialNames[Math.floor(Math.random() * racialNames.length)].name;

  let levelIndex = Math.ceil(Math.random() * 100);
  while (!character.level) {
    character.level = levels[levelIndex];
    levelIndex--;
  }
  character = { ...character, ...calculateWeightAndHeight(race) };
  let characterString = `
    \`\`\`
    Name: ${character.name}
    Race: ${character.race}
    Gender: ${character.gender === 'f' ? 'Female' : 'Male'}
    Alignment: ${character.alignment}
    Height: ${character.height}
    Weight: ${character.weight}
    Class: ${character.class}
    Level: ${character.class === 'None' ? 1 : character.level}
    Background: ${character.background}
    Defining Trait: ${character.personality}
    \`\`\``;

  return characterString;
}

function calculateWeightAndHeight(race) {
  const { baseHeight, baseWeight, heightModifier, weightModifier } = race;
  const splitHeightMod = heightModifier.split('d');
  const splitWeightMod = weightModifier.split('d');
  let height = baseHeight;
  let weight = baseWeight;

  let additionalHeight = 0;
  while(splitHeightMod[0] > 0) {
    additionalHeight += Math.ceil(Math.random() * splitHeightMod[1]);
    splitHeightMod[0]--;
  }
  height += additionalHeight;

  let additionalWeight = 0;
  while(splitWeightMod[0] > 0) {
    additionalWeight += additionalHeight * Math.ceil(Math.random() * splitWeightMod[1]);
    splitWeightMod[0]--;
  }

  weight += additionalWeight
  return { weight, height: `${Math.floor(height/12)}'${height%12}"` }
}

module.exports = generateNPC;
