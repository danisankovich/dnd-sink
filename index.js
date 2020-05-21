require('dotenv').config();
const Discord = require('discord.js');
const client = new Discord.Client();
const TOKEN = process.env.TOKEN;
const ytdl = require('ytdl-core');

const { findSpellByName } = require('./utils/spell-search');

client.login(TOKEN);

client.on('ready', () => {
  console.info(`Logged in as ${client.user.tag}!`);
});

const queue = new Map();
const state = {}

client.on('message', msg => {
  const serverQueue = queue.get(msg.guild.id);
  if (msg.content.startsWith('!p')) {
      getMusic(msg, serverQueue);
  }
  if (msg.content.startsWith('!n') || msg.content.startsWith('!next')) {
    if (!serverQueue) {
      msg.channel.send(`Music must be in the queue to use this command`);
      return;
    }
    next(serverQueue, msg.guild);
  }
  if (msg.content.startsWith('!stop')) {
    if (!serverQueue) {
      msg.channel.send(`Music must be in the queue to use this command`);
      return;
    }
    stop(serverQueue);
  }
  if (msg.content.startsWith('!ls') || msg.content.startsWith('!loopsong')) {
    if (!serverQueue) {
      msg.channel.send(`Music must be in the queue to use this command`);
      return;
    }
    state[msg.guild.id] = state[msg.guild.id] || {};
    state[msg.guild.id].loopSong = !state[msg.guild.id].loopSong;
    serverQueue.textChannel.send(`Looping is now turned ${state[msg.guild.id].loopSong ? 'On' : 'Off'} for the current song`);
    return;
  }
  if (msg.content.startsWith('!l') || msg.content.startsWith('!loop')) {
    if (!serverQueue) {
      msg.channel.send(`Music must be in the queue to use this command`);
      return;
    }
    state[msg.guild.id] = state[msg.guild.id] || {};
    state[msg.guild.id].loop = !state[msg.guild.id].loop;
    serverQueue.textChannel.send(`Looping is now turned ${state[msg.guild.id].loop ? 'On' : 'Off'}`);
  }
  if (msg.content.startsWith('!q') || msg.content.startsWith('!queue')) {
    if (!serverQueue) {
      msg.channel.send(`Music must be in the queue to use this command`);
      return;
    }
    const songString = serverQueue.songs.map((song, i) => `${i + 1}) ${song.title}`).join('\n')

    serverQueue.textChannel.send(`| Queue: \n ${songString}`);
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
          play(msg.guild, serverQueue.songs[0]);
        }
    } else {
      serverQueue.textChannel.send(`Title matching ${removeTitle} not found in queue`);
    }
  }
  if (msg.content.startsWith('!c') || msg.content.startsWith('!clear')) {
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

function next(serverQueue, guild) {
  const { loop, loopSong } = (state[guild.id] || {});
  if (loop && !loopSong) {
    serverQueue.songs.push(serverQueue.songs.shift());
  } else {
    if (!loopSong) {
      serverQueue.songs.shift();
    }
  }
  play(guild, serverQueue.songs[0]);
}

function stop(serverQueue) {
  serverQueue.songs = [];
  serverQueue.voiceChannel.leave();
}

async function getMusic(message, serverQueue) {
  const voiceChannel = message.member.voice.channel;
  if (!voiceChannel) return console.error("The channel does not exist!");

  console.log("Successfully connected.");
  const songInfo = message.content.substr(message.content.indexOf(' ')+1)
  const { title, video_url: url } = await ytdl.getInfo(songInfo);
  const song = { title, url };
  if (!serverQueue || !client.voice.connections.has(voiceChannel.guild.id)) {
    const queueConstruct = {
      textChannel: message.channel,
      voiceChannel,
      connection: null,
      songs: [],
      volume: 5,
      playing: true
    }
    queue.set(message.guild.id, queueConstruct)
    queueConstruct.songs.push(song)
    try {
      var connection = await voiceChannel.join();
      queueConstruct.connection = connection;
      play(message.guild, queueConstruct.songs[0]);
    } catch (err) {
      console.log(err);
      queue.delete(message.guild.id);
      return message.channel.send(err);
    }
  } else {
    serverQueue.songs.push(song);
    return message.channel.send(`${song.title} has been added to the queue!`);
  }
}

function play(guild, song) {
  const serverQueue = queue.get(guild.id);
  if (!song) {
    serverQueue.voiceChannel.leave();
    queue.delete(guild.id);
    return;
  }

  const dispatcher = serverQueue.connection
    .play(ytdl(song.url))
    .on("finish", () => {
      next(serverQueue, guild);
    })
    .on("error", error => console.error(error));
  dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
  serverQueue.textChannel.send(`Start playing: **${song.title}**`);
}

function rollDice(message) {
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
