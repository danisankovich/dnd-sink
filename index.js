require('dotenv').config();
const Discord = require('discord.js');
const client = new Discord.Client();
const TOKEN = process.env.TOKEN;
const ytdl = require('ytdl-core');

const { findSpellByName } = require('./utils/spell-search');
const rollDice = require('./utils/dice-roll');
const { next, play, getMusic, stop } = require('./utils/music-utils');

client.login(TOKEN);

client.on('ready', () => {
  console.info(`Logged in as ${client.user.tag}!`);
});

const queue = new Map();
const state = {}

client.on('message', msg => {
  const serverQueue = queue.get(msg.guild.id);
  if (msg.content.startsWith('!play')) {
      getMusic(msg, serverQueue, queue, state, client);
  }
  if (msg.content.startsWith('!next')) {
    if (!serverQueue) {
      msg.channel.send(`Music must be in the queue to use this command`);
      return;
    }
    next(serverQueue, msg.guild, queue, state);
  }
  if (msg.content.startsWith('!stop')) {
    if (!serverQueue) {
      msg.channel.send(`Music must be in the queue to use this command`);
      return;
    }
    stop(serverQueue);
  }
  if (msg.content.startsWith('!loopsong')) {
    if (!serverQueue) {
      msg.channel.send(`Music must be in the queue to use this command`);
      return;
    }
    state[msg.guild.id] = state[msg.guild.id] || {};
    state[msg.guild.id].loopSong = !state[msg.guild.id].loopSong;
    serverQueue.textChannel.send(`Looping is now turned ${state[msg.guild.id].loopSong ? 'On' : 'Off'} for the current song`);
    return;
  }
  if (msg.content.startsWith('!loop')) {
    if (!serverQueue) {
      msg.channel.send(`Music must be in the queue to use this command`);
      return;
    }
    state[msg.guild.id] = state[msg.guild.id] || {};
    state[msg.guild.id].loop = !state[msg.guild.id].loop;
    serverQueue.textChannel.send(`Looping is now turned ${state[msg.guild.id].loop ? 'On' : 'Off'}`);
  }
  if (msg.content.startsWith('!queue')) {
    if (!serverQueue) {
      msg.channel.send(`Music must be in the queue to use this command`);
      return;
    }
    const songString = serverQueue.songs.map((song, i) => `${i + 1}) ${song.title}`).join('\n')

    serverQueue.textChannel.send(`\`\`\`| Queue:\n${songString}\`\`\``);
  }
  if (msg.content.startsWith('!remove')) {
    if (!serverQueue) {
      msg.channel.send(`Music must be in the queue to use this command`);
      return;
    }
    const removeTitle = msg.content.substr(msg.content.indexOf(' ')+1).toLowerCase();

    const removeIndex = serverQueue.songs.findIndex(song => song.title.toLowerCase().indexOf(removeTitle) > -1);
    if (removeIndex > -1) {
      serverQueue.textChannel.send(`Removed ${serverQueue.songs[removeIndex].title} from queue`);
        serverQueue.songs.splice(removeIndex, 1);
        if (removeIndex === 0) {
          play(msg.guild, serverQueue.songs[0], queue, state);
        }
    } else {
      serverQueue.textChannel.send(`Title matching ${removeTitle} not found in queue`);
    }
  }
  if (msg.content.startsWith('!clear')) {
    if (!serverQueue) {
      msg.channel.send(`Music must be in the queue to use this command`);
      return;
    }
    serverQueue.songs = [];
  }
  if (msg.content.startsWith('!roll')) {
    rollDice(msg);
  }
  if (msg.content.startsWith('!spell')) {
    const spellName = msg.content.substr(msg.content.indexOf(' ')+1)
    msg.channel.send(`${findSpellByName(spellName)}`);
  }
});
