require('dotenv').config();
const mongoose = require("mongoose")
const connectDB = require("./connectDB")
const database = "dndbot";
connectDB("mongodb://localhost:27017/"+database)
const Discord = require('discord.js');
const client = new Discord.Client();
const TOKEN = process.env.TOKEN;

const feedback = require('./utils/feedback');
const { findSpellByName } = require('./utils/spell-search');
const rollDice = require('./utils/dice-roll');
const { next, play, getMusic, stop, remove } = require('./utils/music-utils');
const { createPlaylist, playPlaylist, addSongToPlaylist, removeSongFromPlaylist, displayPlaylists, displayPlaylistSongs, deletePlaylist } = require('./utils/playlist');
const { findConditionByName } = require('./utils/conditions');
const { rollStatsd20, rollStats3d6, rollStats4d6DropLowest, rollStats4d6DropLowestForgiving } = require('./utils/stat-generator');
const generateNPC = require('./utils/generate-npc');
const classLookup = require('./utils/class-lookup');
client.login(TOKEN);

client.on('ready', () => {
  console.info(`Logged in as ${client.user.tag}!`);
});

const queue = new Map();
const state = {}

const timer = 1000 * 60 * 60 * 2;

function timeoutChecker(msg, serverQueue, voiceChannel) {
  state[msg.guild.id].timeoutHandle = state[msg.guild.id].timeoutHandle;
  state[msg.guild.id].voiceChannel = voiceChannel || serverQueue.voiceChannel;
  clearTimeout(state[msg.guild.id].timeoutHandle);
  state[msg.guild.id].timeoutHandle = undefined;
  state[msg.guild.id].timeoutHandle = setTimeout(() => {
    if (state[msg.guild.id].voiceChannel && typeof state[msg.guild.id].voiceChannel.leave === 'function') {
      state[msg.guild.id].voiceChannel.leave();
      msg.channel.send('DND-Sink left voice channel after 1 hour of inactivity.')
    }
  }, timer); // disconnect on an hour
}

client.on('message', msg => {
  if (msg.guild && msg.guild.id) {
    const serverQueue = queue.get(msg.guild.id);
    state[msg.guild.id] = state[msg.guild.id] || {};

    if (msg.content.startsWith('!play')) {
      // }, 60000 * 60); // disconnect on an hour
        return getMusic(msg, serverQueue, queue, state, client).then((voiceChannel) => {
          timeoutChecker(msg, serverQueue, voiceChannel)
        }).catch(err => {
          console.error(`${new Date()} ${err}`);
        });
    }
    if (msg.content.startsWith('!start')) {

        return playPlaylist(msg, serverQueue, queue, state, client).then(voiceChannel => {
          timeoutChecker(msg, serverQueue, voiceChannel)
        });
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
    if (msg.content.startsWith('!deleteplaylist')) {
        return deletePlaylist(msg);
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
      timeoutChecker(msg, serverQueue)
      next(serverQueue, msg.guild, queue, state);
    }
    if (msg.content.startsWith('!restart')) {
      if (!serverQueue) {
        return msg.channel.send(`Music must be in the queue to use this command`);
      }
      timeoutChecker(msg, serverQueue)
      play(msg.guild, serverQueue.songs[0], queue, state);
      return msg.channel.send(`Restarting current song`);
    }
    if (msg.content.startsWith('!stop')) {
      if (!serverQueue) {
        return msg.channel.send(`Music must be in the queue to use this command`);
      }
      state[msg.guild.id].timeoutHandle = state[msg.guild.id].timeoutHandle;
      state[msg.guild.id].voiceChannel = serverQueue.voiceChannel;
      clearTimeout(state[msg.guild.id].timeoutHandle);
      state[msg.guild.id].timeoutHandle = undefined;
      stop(serverQueue);
      return msg.channel.send(`Stopping music stream`);
    }
    if (msg.content.startsWith('!loopsong')) {
      if (!serverQueue) {
        return msg.channel.send(`Music must be in the queue to use this command`);
      }
      state[msg.guild.id] = state[msg.guild.id] || {};
      state[msg.guild.id].loopSong = !state[msg.guild.id].loopSong;

      timeoutChecker(msg, serverQueue)
      return msg.channel.send(`Looping is now turned ${state[msg.guild.id].loopSong ? 'On' : 'Off'} for the current song`);
    }
    if (msg.content.startsWith('!loop')) {
      if (!serverQueue) {
        return msg.channel.send(`Music must be in the queue to use this command`);
      }
      state[msg.guild.id] = state[msg.guild.id] || {};
      state[msg.guild.id].loop = !state[msg.guild.id].loop;

      timeoutChecker(msg, serverQueue)
      return msg.channel.send(`Looping is now turned ${state[msg.guild.id].loop ? 'On' : 'Off'} for the queue`);
    }
    if (msg.content.startsWith('!queue')) {
      if (!serverQueue) {
        return msg.channel.send(`Music must be in the queue to use this command`);
      }

      timeoutChecker(msg, serverQueue)

      const songString = serverQueue.songs.map((song, i) => `${i + 1}) ${song.title}`).join('\n')
      return msg.channel.send(`\`\`\`| Queue:\n${songString}\`\`\``);
    }
    if (msg.content.startsWith('!remove')) {
      if (!serverQueue) {
        return msg.channel.send(`Music must be in the queue to use this command`);
      }

      timeoutChecker(msg, serverQueue)

      return remove(msg, serverQueue, queue, state)
    }
    if (msg.content.startsWith('!clear')) {
      if (!serverQueue) {
        return msg.channel.send(`Music must be in the queue to use this command`);
      }
      serverQueue.songs = [];

      timeoutChecker(msg, serverQueue)

      return msg.channel.send(`Queue has been cleared`);
    }
    if (msg.content.startsWith('!roll')) {
      return rollDice(msg);
    }
    if (msg.content.startsWith('!stats')) {
      const type = msg.content.substr(msg.content.indexOf(' ')+1).toLowerCase();
      let string;
      if (type === '3d6') {
        string = rollStats3d6();
      } else if (type === '4d6') {
        string = rollStats4d6DropLowest();
      } else if (type === '4d6*') {
        string = rollStats4d6DropLowestForgiving();
      } else if (type === 'd20') {
        string = rollStatsd20();
      } else {
        string = 'Stat type must be "3d6", "4d6", "4d6*", or "d20"';
      }
      return msg.reply(`\`\`\`${string}\`\`\``);
    }
    if (msg.content.startsWith('!adv') || msg.content.startsWith('!disadv')) {
      return rollDice(msg, true);
    }
    if (msg.content.startsWith('!spell')) {
      const spellName = msg.content.substr(msg.content.indexOf(' ')+1)
      return msg.channel.send(`${findSpellByName(spellName)}`);
    }
    if (msg.content.startsWith('!condition')) {
      return msg.channel.send(`${findConditionByName(msg)}`);
    }
    if (msg.content.startsWith('!generate')) {
      return msg.channel.send(`${generateNPC(msg)}`);
    }
    if (msg.content.startsWith('!barbarian')) {
      return classLookup('barbarian', msg);
    }
    if (msg.content.startsWith('!bard')) {
      return classLookup('bard', msg);
    }
    if (msg.content.startsWith('!cleric')) {
      return classLookup('cleric', msg);
    }
    if (msg.content.startsWith('!blood hunter')) {
      return classLookup('blood-hunter', msg);
    }
    if (msg.content.startsWith('!help')) {
      return msg.channel.send(`List of commands can be found here: https://danisankovich.github.io/dnd-sink/`);
    }
    if (msg.content.startsWith('!feedback')) {
      const content = msg.content.substr(msg.content.indexOf(' ')+1);
      if (content === '!feedback') {
        return msg.reply('Must provide feedback');
      }
      feedback(content).then(e => {
        return msg.reply('Feedback sent. Thank you for your input.');
      }).catch(err => {
        console.err(`${new Date()} ${err}`)
      })
    }
    if (msg.content.startsWith('!test')) {
      console.log(msg, client.user.id)
    }
  }

});
