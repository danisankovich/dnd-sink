const http = require('http');
http.createServer((req, res) => {
res.writeHead(200, {
    'Content-type': 'text/plain'
});
    res.write('Hey');
    res.end();
}).listen(process.env.PORT || 3001);

require('dotenv').config();

const Discord = require('discord.js');
const client = new Discord.Client();
const TOKEN = process.env.TOKEN;

const { findSpellByName } = require('./utils/spell-search');
const rollDice = require('./utils/dice-roll');
const { next, play, getMusic, stop, remove } = require('./utils/music-utils');
const { createPlaylist, playPlaylist, addSongToPlaylist, removeSongFromPlaylist, displayPlaylists, displayPlaylistSongs } = require('./utils/playlist');

client.login(TOKEN);

client.on('ready', () => {
  console.info(`Logged in as ${client.user.tag}!`);
});

const queue = new Map();
const state = {}

client.on('message', msg => {
  const serverQueue = queue.get(msg.guild.id);
  if (msg.content.startsWith('!play')) {
      return getMusic(msg, serverQueue, queue, state, client);
  }
  if (msg.content.startsWith('!start')) {
      return playPlaylist(msg, serverQueue, queue, state, client);
  }
  if (msg.content.startsWith('!addsong')) {
      return addSongToPlaylist(msg);
  }
  if (msg.content.startsWith('!removesong')) {
      return removeSongFromPlaylist(msg);
  }
  if (msg.content.startsWith('!newplaylist')) {
      return createPlaylist(msg);
  }
  if (msg.content.startsWith('!showplaylistsongs')) {
      return displayPlaylistSongs(msg);
  }
  if (msg.content.startsWith('!showplaylists')) {
      return displayPlaylists(msg);
  }
  if (msg.content.startsWith('!next')) {
    if (!serverQueue) {
      return msg.channel.send(`Music must be in the queue to use this command`);
    }
    next(serverQueue, msg.guild, queue, state);
  }
  if (msg.content.startsWith('!restart')) {
    if (!serverQueue) {
      return msg.channel.send(`Music must be in the queue to use this command`);
    }
    play(msg.guild, serverQueue.songs[0], queue, state);
    return msg.channel.send(`Restarting current song`);
  }
  if (msg.content.startsWith('!stop')) {
    if (!serverQueue) {
      return msg.channel.send(`Music must be in the queue to use this command`);
    }
    stop(serverQueue);
    return msg.channel.send(`Stopping music stream`);
  }
  if (msg.content.startsWith('!loopsong')) {
    if (!serverQueue) {
      return msg.channel.send(`Music must be in the queue to use this command`);
    }
    state[msg.guild.id] = state[msg.guild.id] || {};
    state[msg.guild.id].loopSong = !state[msg.guild.id].loopSong;
    return msg.channel.send(`Looping is now turned ${state[msg.guild.id].loopSong ? 'On' : 'Off'} for the current song`);
  }
  if (msg.content.startsWith('!loop')) {
    if (!serverQueue) {
      return msg.channel.send(`Music must be in the queue to use this command`);
    }
    state[msg.guild.id] = state[msg.guild.id] || {};
    state[msg.guild.id].loop = !state[msg.guild.id].loop;
    return msg.channel.send(`Looping is now turned ${state[msg.guild.id].loop ? 'On' : 'Off'} for the queue`);
  }
  if (msg.content.startsWith('!queue')) {
    if (!serverQueue) {
      return msg.channel.send(`Music must be in the queue to use this command`);
    }
    const songString = serverQueue.songs.map((song, i) => `${i + 1}) ${song.title}`).join('\n')
    return msg.channel.send(`\`\`\`| Queue:\n${songString}\`\`\``);
  }
  if (msg.content.startsWith('!remove')) {
    if (!serverQueue) {
      return msg.channel.send(`Music must be in the queue to use this command`);
    }
    return remove(msg, serverQueue, queue, state)
  }
  if (msg.content.startsWith('!clear')) {
    if (!serverQueue) {
      return msg.channel.send(`Music must be in the queue to use this command`);
    }
    serverQueue.songs = [];
    return msg.channel.send(`Queue has been cleared`);
  }
  if (msg.content.startsWith('!roll')) {
    return rollDice(msg);
  }
  if (msg.content.startsWith('!adv') || msg.content.startsWith('!disadv')) {
    return rollDice(msg, true);
  }
  if (msg.content.startsWith('!spell')) {
    const spellName = msg.content.substr(msg.content.indexOf(' ')+1)
    return msg.channel.send(`${findSpellByName(spellName)}`);
  }
  if (msg.content.startsWith('!help')) {
    return msg.channel.send(`List of commands can be found here: https://danisankovich.github.io/dnd-sink/`);
  }
});
