const fs = require('fs');
const util = require('util');
const path = require('path');
const ytdl = require('ytdl-core');
const Promise = require('bluebird');

const mongoose = require("mongoose")
const connectDB = require("../connectDB")
const database = "dndbot";
const Users = require('../Users');
connectDB("mongodb://localhost:27017/"+database)


const { play } = require('./music-utils');

async function addSongToPlaylist(message) {
  const stringContent = message.content.substr(message.content.indexOf(' ')+1);
  if (!stringContent) {
    return message.reply('No info provided');
  }

  const splitter = stringContent.split(' ');
  const playlist = splitter[0].toLowerCase();;
  splitter.shift();

  Users.findOne({userId: message.author.id}, (err, user) => {
    if (err) {
      throw err;
    }
    if (!user || user.playlists.length === 0) {
      message.reply('You have no playlists in your collection');
      return mongoose.disconnect();
    }

    const findPlaylist = user.playlists.find(p => p.name === playlist);
    if (!findPlaylist) {
      message.reply('You have no playlists by that name in your collection');
      return mongoose.disconnect();
    }
    Promise.map(splitter, async songUrl => {
      let title, url;
      try {
        ({ title, video_url: url } = await ytdl.getInfo(songUrl));
      } catch (e) {
        return message.reply(`Error: ${e.message}`);
      }
      const song = { title, url };
      const songFound = findPlaylist.songs.find(s => s.title === title);

      if (songFound) {
        message.reply(title, ' is already in playlist');
        return;
      }
      findPlaylist.songs.push(song);
    }).then(() => {
      user.markModified('playlists');
      user.save(err => {
        if (err) {
          throw err;
        }
        message.reply('Songs Added')
        mongoose.disconnect();
      });
    });
  });
}

// addSongToPlaylist({author: {id: 'asdf'}, content: '!addsong test4 https://www.youtube.com/watch?v=YYfoWIlt9vw https://www.youtube.com/watch?v=9SbT71beG0Q'})

async function playPlaylist(message, serverQueue, queue, state, client) {
  const voiceChannel = message.member.voice.channel;
  if (!voiceChannel) return message.channel.send(`You must be in a voice channel that dnd-sink can access to use this command`);

  const playlistName = message.content.substr(message.content.indexOf(' ')+1).toLowerCase();
  Users.findOne({userId: message.author.id}, async (err, user) => {
    if (err) {
      throw err;
    }
    if (!user || !user.playlists) {
      message.reply('You do not have any playlists in your collection');
    }
    const found = user.playlists.find(playlist => playlist.name === playlistName);
    if (!found) {
      message.reply('You do not have a playlist by that name in your collection');
      return mongoose.disconnect();
    }
    const { songs, name } = found;
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
        message.reply(`Playing ${playlistName}`);
        mongoose.disconnect();
      } catch (e) {
        queue.delete(message.guild.id);
        return message.channel.send(`Error: ${e.message}`);
      }
    }
  });
}

function createPlaylist(message) {
  const playlistName = message.content.substr(message.content.indexOf(' ')+1).toLowerCase();
  Users.findOne({userId: message.author.id}, (err, user) => {
    if (!user) {
      const insertedUser = new Users({
        userId: message.author.id,
        playlists: [{name: playlistName, songs: []}]
      });
      return insertedUser.save(err => {
        if (err) throw err;
        message.reply('Playlist Created');
        mongoose.disconnect();
      })
    }
    const found = user.playlists.find(playlist => playlist.name === playlistName);
    if (found) {
      message.reply('Playlist by that name already exists in your collection');
      return mongoose.disconnect();
    }
    user.playlists.push({name: playlistName, songs: []});
    user.markModified('playlists');
    user.save(err => {
      if (err) {
        throw err;
      }
      message.reply('Playlist Created');
      return mongoose.disconnect();
    })
  });
}

async function removeSongFromPlaylist(message) {
  const stringContent = message.content.substr(message.content.indexOf(' ')+1);
  if (!stringContent) {
    return message.reply('No info provided');
  }

  const splitter = stringContent.split(' ');
  const playlist = splitter[0].toLowerCase();;
  splitter.shift();

  Users.findOne({userId: message.author.id}, (err, user) => {
    if (err) {
      throw err;
    }
    if (!user || user.playlists.length === 0) {
      message.reply('You have no playlists in your collection');
      return mongoose.disconnect();
    }

    const findPlaylist = user.playlists.find(p => p.name === playlist);
    if (!findPlaylist) {
      message.reply('You have no playlists by that name in your collection');
      return mongoose.disconnect();
    }
    Promise.map(splitter, async songUrl => {
      let title, url;
      try {
        ({ title, video_url: url } = await ytdl.getInfo(songUrl));
      } catch (e) {
        return message.reply(`Error: ${e.message}`);
      }
      const song = { title, url };
      const songFound = findPlaylist.songs.find(s => s.title === title);

      if (songFound) {
        message.reply(title, ' is already in playlist');
        return;
      }
      findPlaylist.songs.push(song);
    }).then(() => {
      user.markModified('playlists');
      user.save(err => {
        if (err) {
          throw err;
        }
        message.reply('Songs added')
        mongoose.disconnect();
      });
    });
  });
}

function displayPlaylists(message) {
  const userId = message.author.id;
  Users.findOne({userId}, (err, user) => {
    const playlistNames = user.playlists.map((p, i) => `\n | ${i + 1}) ${p.name}`);
    console.log(playlistNames);
    message.reply(playlistNames.join('\n'))
  });
}

function displayPlaylistSongs(message) {
  const playlistName = message.content.substr(message.content.indexOf(' ')+1).toLowerCase();

  const userId = message.author.id;
  Users.findOne({userId}, (err, user) => {
    const playlist = user.playlists.find(p => p.name === playlistName);
    if (!playlist) {
      message.reply('You do not have any playlists by the name of ', playlistName, ' in your collection');
    }
    const songs = playlist.songs.map((s, i) => {
      return `\n | ${i + 1}) ${s.title}`;
    })
    console.log(songs);
    message.reply(songs.join(''))
  });
}

// insertNewPlaylist({author: {id: 'asdf'}, content: '!newplaylist test4'})

module.exports = { createPlaylist, playPlaylist, addSongToPlaylist, displayPlaylists, displayPlaylistSongs, removeSongFromPlaylist };
