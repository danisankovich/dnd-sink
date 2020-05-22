const fs = require('fs');
const util = require('util');
const path = require('path');
const ytdl = require('ytdl-core');
const Promise = require('bluebird');

const fsReadAsync = util.promisify(fs.readFile);
const fsWriteAsync = util.promisify(fs.writeFile);

const { play } = require('./music-utils');

async function addSongToPlaylist(message) {
  const stringContent = message.content.substr(message.content.indexOf(' ')+1);
  if (!stringContent) {
    return message.reply('No info provided');
  }

  const splitter = stringContent.split(' ');
  const playlist = splitter[0];
  splitter.shift();

  let playlists;
  try {
    playlists = await fsReadAsync(path.join(__dirname, 'playlist.json'), 'utf-8');
    if (playlists) {
      playlists = JSON.parse(playlists);
    }
  } catch (err) {
    console.log(err);
    return;
  }

  if (!playlists[message.author.id] || !playlists[message.author.id][playlist]) {
    return message.reply(`You don't have a playlist named ${playlist} in your list`);
  }

  Promise.map(splitter, async songUrl => {
    let title, url;
    try {
      ({ title, video_url: url } = await ytdl.getInfo(songUrl));
    } catch (e) {
      return message.reply(`Error: ${e.message}`);
    }
    const song = { title, url };
    playlists[message.author.id][playlist].push(song);
  }).then(async () => {
    try {
      await fsWriteAsync(path.join(__dirname, 'playlist.json'), JSON.stringify(playlists, null, 2));
      message.reply(`Songs Added To Playlist ${playlist}`);
    } catch (err) {
      console.log(err);
      return;
    }
  });
}

async function createPlaylist(message) {
  const userId = message.author.id;
  const playlistName = message.content.substr(message.content.indexOf(' ')+1);
  if (playlistName) {
    if (playlistName.length > 20) {
      return message.reply('Playlist names have a max length of 20 characters');
    }
    let playlists;
    try {
      playlists = await fsReadAsync(path.join(__dirname, 'playlist.json'), 'utf-8');
      if (playlists) {
        playlists = JSON.parse(playlists);
      }
    } catch (err) {
      console.log(err);
      return;
    }

    playlists[userId] = playlists[userId] || {};
    if (playlists[userId][playlistName]) {
      return message.reply(`You already have a playlist named ${playlistName}`)
    }
    playlists[userId][playlistName] = [];
    try {
      await fsWriteAsync(path.join(__dirname, 'playlist.json'), JSON.stringify(playlists, null, 2));
      message.reply(`New Playlist ${playlistName} has been created`);
    } catch (err) {
      console.log(err);
      return;
    }
  }
}

async function playPlaylist(message, serverQueue, queue, state, client) {
  const voiceChannel = message.member.voice.channel;
  if (!voiceChannel) return message.channel.send(`You must be in a voice channel that dnd-sink can access to use this command`);

  const playlistName = message.content.substr(message.content.indexOf(' ')+1);
  let playlists;
  try {
    playlists = await fsReadAsync(path.join(__dirname, 'playlist.json'), 'utf-8');
    if (playlists) {
      playlists = JSON.parse(playlists);
    }
  } catch (err) {
    console.log(err);
    return;
  }

  if (!playlists[message.author.id] || !playlists[message.author.id][playlistName]) {
    return message.reply(`You don't have a playlist named ${playlistName} in your list`);
  }

  const songs = playlists[message.author.id][playlistName];

  if (!serverQueue || !client.voice.connections.has(voiceChannel.guild.id)) {
    const queueConstruct = {
      textChannel: message.channel,
      voiceChannel,
      connection: null,
      songs,
      volume: 5,
      playing: true
    }
    queue.set(message.guild.id, queueConstruct)
    try {
      const connection = await voiceChannel.join();
      console.log("Successfully connected.");
      queueConstruct.connection = connection;
      play(message.guild, queueConstruct.songs[0], queue, state);
    } catch (e) {
      queue.delete(message.guild.id);
      return message.channel.send(`Error: ${e.message}`);
    }
  }
}

module.exports = { createPlaylist, playPlaylist, addSongToPlaylist };
