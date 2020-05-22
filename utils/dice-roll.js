module.exports = function rollDice(message, isDouble) {
  const diceString = message.content.substr(message.content.indexOf(' ')+1);

  let result = roll(diceString);
  if (result.error) {
    return message.reply(result.error);
  }
  if (isDouble) {
    result = `${result}\n${roll(diceString)}`
  }
  return message.reply(result);
}

function roll(diceString) {
  const splitter = diceString.split(' ');
  let value = 0;
  let sym = '+'
  let badCharacter;
  for (let i = 0; i < splitter.length; i++) {
    if (!isNaN(splitter[i])) {
      if (sym === '+') {
        value += Number(splitter[i]);
      }
      if (sym === '-') {
        value -= Number(splitter[i]);
      }
    }
    if (isNaN(splitter[i])) {
      if (splitter[i] === '+') {
        sym = '+';
      } else if (splitter[i] === '-') {
        sym = '-';
      } else if (splitter[i].split('d').length === 2) {
        let [num, dice] = splitter[i].split(/[dD]/);
        if (isNaN(dice)) {
          return { error: `Bad character found in ${diceString}` };
        }
        if (num === '') {
          num = 1;
        }
        let result = 0;
        while (num > 0) {
          result += Math.ceil(Math.random() * Math.floor(Number(dice)));
          num--;
        }
        if (sym === '+') {
          value += result;
        }
        if (sym === '-') {
          value -= result;
        }
        splitter[i] = `(${result})`
      } else {
        if (splitter[i] !== ' ') {
          return { error: `Bad character found in ${diceString}` };
        }
      }
    }
  }
  return `\n${diceString}\n${splitter.join(' ')} = ${value}`
}
