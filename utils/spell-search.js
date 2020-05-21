const spells = require('../resources/spells.json');
const spellSchools = require('../resources/spell_schools.json');
const sources = require('../resources/sources.json');

function findSpellByName(name) {
  const found = spells.find(spell => spell.name.toLowerCase().replace(/-/g, ' ') === name.toLowerCase().replace(/-/g, ' '));
  if (!found) {
    return `No spell by the name of **${name}** was found. Make sure your spelling is correct. At this time we look for exact match (case insensitive)`
  }
  const castingTimeString = generateCastingTimeString(found.casting_time, found.casting_time_unit);
  const durationString = generateDurationString(found.duration, found.duration_unit);
  const componentString = generateComponentString(found.does_have_verbal_component, found.does_have_somatic_component, found.material_component, found.material_component_cost, found.is_material_component_consumed);
  const rangeString = generateRangeString(found.range, found.range_unit);
  const isConcentration = found.does_need_concentration ? 'Concentration' : '';
  const isRitual = found.is_ritual ? 'Ritual' : '';
  const level = found.level === 0 ? 'Cantrip' : found.level;
  const spellSchool = spellSchools.find(school => school.id === found.spell_school_id).name;
  const sourceString = generateSourceString(found.sources_rels);

  return `
  **Name:** ${found.name} ${isRitual ? '(Ritual)' : ''}
**Level:** ${level}
**School:** ${spellSchool}
**Casting Time:** ${castingTimeString}
**Duration:** ${durationString} ${isConcentration ? '(Concentration)' : ''}
**Components:** ${componentString}
**Range:** ${rangeString}
**Description:** ${found.description
  .replace(/<\/?p>/gm, '\n')
  .replace(/<\/?strong>/gm, '**')
  .replace(/<\/?ul>/gm, '').replace(/<li>/gm, '\n - ').replace(/<\/li>/gm, '')
}
**Source:** ${sourceString}
`;
}

function generateSourceString(sourceRels) {
  return sourceRels.map(sourceData => {
    const sourceId = sourceData.source_id;
    return `${sources.find(source => source.id === sourceId).name} pg. ${sourceData.page}`;
  }).join(', ');
}

function generateRangeString(range, rangeUnit) {
  if (range === 0) {
    return rangeUnit;
  }
  return `${range} ${rangeUnit}`;
}

function generateComponentString(verbal, somatic, material, worth, consumed) {
  let componentString = verbal ? 'V ' : '';
  componentString = somatic ? `${componentString}S ` : componentString;
  let materialString = material ? `M (${material}` : '';
  if (material) {
    if (worth) {
      materialString = `${materialString} worth at least ${worth}`;
    }
    if (consumed) {
      materialString = `${materialString}, which the spell consumes`;
    }
    materialString = `${materialString})`;
  }
  componentString = `${componentString}${materialString}`
  return componentString;
}

function generateDurationString(duration, durationUnit) {
  let durationString;
  if (duration === 0) {
    return durationUnit;
  }
  if (duration === 1) {
    return `${duration} ${durationUnit.substring(0, durationUnit.length - 1)}`;
  }
  return `${duration} ${durationUnit}`;
}

function generateCastingTimeString(castingTime, castingTimeUnit) {
  let castingTimeString;
  if (castingTime === 1) {
    castingTimeString = `${castingTimeUnit.substring(0, castingTimeUnit.length - 1)}`;
    if (['actions', 'bonus actions', 'reactions'].indexOf(castingTimeUnit) === -1) {
      castingTimeString = `${castingTime} ${castingTimeString}`
    }
  } else {
    castingTimeString = `${castingTime} ${castingTimeUnit}`;
  }

  return castingTimeString;
}

module.exports = { findSpellByName }
