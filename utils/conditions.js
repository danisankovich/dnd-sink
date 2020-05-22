const conditions = require('../resources/conditions.json');

function findConditionByName(message) {
  const condition = message.content.substr(message.content.indexOf(' ')+1).toLowerCase();
  let conditionObject = conditions[condition];
  if (!condition || condition === '!condition') {
    conditionObject = conditions.info;
  }
  if (!conditionObject) {
    return `The "${condition}" condition was not found.`
  }
  return `${conditionObject.name}\n\n\`\`\`${conditionObject.content}\`\`\``;
}

module.exports = { findConditionByName }
