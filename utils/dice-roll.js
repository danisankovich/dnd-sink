module.exports = function rollDice(message) {
  const diceString = message.content.substr(message.content.indexOf(' ')+1);

  let value = 0;
  let sym = '+'
  const splitter = diceString.split(' ');
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
          message.reply(`Bad character found in ${diceString}`);
          badCharacter = true;
          break;
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
          message.reply(`Bad character found in ${diceString}`);
          badCharacter = true;
          break;
        }
      }
    }
  }
  if (!badCharacter) {
    message.reply(`\n${diceString}\n${splitter.join(' ')} = ${value}`);
  }
}
