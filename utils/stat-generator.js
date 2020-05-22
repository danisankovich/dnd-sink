function rollStatsd20() {
  let counter = 6;
  const strings = [];
  while (counter > 0) {
    strings.push(Math.ceil(Math.random() * 20));
    counter--;
  }
  return strings.join(', ');
}

function rollStats3d6() {
  let counter = 6;
  const strings = [];
  while (counter > 0) {
    const value1 = Math.ceil(Math.random() * 6);
    const value2 = Math.ceil(Math.random() * 6);
    const value3 = Math.ceil(Math.random() * 6);

    strings.push(value1 + value2 + value3);
    counter--;
  }
  return strings.join(', ');
}

function rollStats4d6DropLowest() {
  let counter = 6;
  const strings = [];
  while (counter > 0) {
    const values = [ Math.ceil(Math.random() * 6), Math.ceil(Math.random() * 6), Math.ceil(Math.random() * 6), Math.ceil(Math.random() * 6) ];
    const min = Math.min(...values);
    for (let i = 0; i < 4; i++) {
      if (values[i] === min) {
        values.splice(i, 1);
        break;
      }
    }
    strings.push(values.reduce((a, b) => a + b));
    counter--;
  }
  return strings.join(', ');
}

function rollStats4d6DropLowestForgiving() {
  let counter = 6;
  const strings = [];
  while (counter > 0) {
    const values = [ Math.ceil(Math.random() * 6), Math.ceil(Math.random() * 6), Math.ceil(Math.random() * 6), Math.ceil(Math.random() * 6) ];
    const ones = values.filter(v => v === 1);

    if (ones.length < 2) {
      const min = Math.min(...values);
      for (let i = 0; i < 4; i++) {
        if (values[i] === min) {
          values.splice(i, 1);
          break;
        }
      }
    } else {
      let toRemove = 2;
      while (toRemove > 0) {
        values.splice(values.indexOf(1), 1);
        toRemove--;
      }
      values.push(Math.ceil(Math.random() * 6))
    }
    counter--;
    strings.push(values.reduce((a, b) => a + b));
  }
  return strings.join(', ');
}

module.exports = { rollStatsd20, rollStats3d6, rollStats4d6DropLowest, rollStats4d6DropLowestForgiving }
