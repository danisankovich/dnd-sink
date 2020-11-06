const ytdl = require('ytdl-core');
const ytsearch = require('yt-search');
const { search } = require('yt-search');

function next(serverQueue, guild, queue, state) {
  const { loop, loopSong } = (state[guild.id] || {});
  if (loop && !loopSong) {
    serverQueue.songs.push(serverQueue.songs.shift());
  } else {
    if (!loopSong) {
      serverQueue.songs.shift();
    }
  }

  play(guild, serverQueue.songs[0], queue, state);
}

function prev(serverQueue, guild, queue, state) {
  serverQueue.songs.unshift(serverQueue.songs.pop());

  play(guild, serverQueue.songs[0], queue, state);
}

function play(guild, song, queue, state) {
  const serverQueue = queue.get(guild.id);

  if (!song) {
    serverQueue.voiceChannel.leave();
    queue.delete(guild.id);
    return;
  }
  try {
    const dispatcher = serverQueue.connection
    .play(ytdl(song.url))
    .on("finish", () => {
      next(serverQueue, guild, queue, state);
    })
    .on("error", error => console.error(error));
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 40);
    if (!state[guild.id] || !state[guild.id].loopSong) {
      return serverQueue.textChannel.send(`Start playing: **${song.title}**`);
    }
  } catch (err) {
    console.error(err);
  }
}

async function getMusic(message, serverQueue, queue, state, client) {
  const voiceChannel = message.member.voice.channel;
  if (!voiceChannel) return message.channel.send(`You must be in a voice channel that dnd-sink can access to use this command`);
  const songInfo = message.content.substr(message.content.indexOf(' ')+1)
  let title, url;
  try {
    let searchResp = await ytsearch(songInfo);
    if (searchResp && searchResp.all) {
      if (!searchResp.all[0]) {
        searchResp = await ytsearch(songInfo); // sometimes first query returns empty array
      }
      ({url, title} = searchResp.all[0]);
    }
    if (!title || !url) {
      return message.reply(`${songName} could not be found`);
    }
  } catch (e) {
    return message.channel.send(`Error: ${e.message}`);
  }
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
      const connection = await voiceChannel.join();
      console.log("Successfully connected.");
      message.channel.send(`
      Settings: \`\`\`
      Loop Song: ${state[message.guild.id].loopSong === 'On' ? 'On' : 'Off'}
      Loop Queue: ${state[message.guild.id].loop === 'On' ? 'On' : 'Off'}\`\`\`
      `)
      queueConstruct.connection = connection;
      return play(message.guild, queueConstruct.songs[0], queue, state);
    } catch (e) {
      queue.delete(message.guild.id);
      return message.channel.send(`Error: ${e.message}`);
    }
  } else {
    serverQueue.songs.push(song);
    message.channel.send(`${song.title} has been added to the queue!`);
    return voiceChannel;
  }
}

function stop(serverQueue) {
  serverQueue.songs = [];
  serverQueue.voiceChannel.leave();
}

function remove(msg, serverQueue, queue, state) {
  const removeTitle = msg.content.substr(msg.content.indexOf(' ')+1).toLowerCase();

  const removeIndex = serverQueue.songs.findIndex(song => song.title.toLowerCase().indexOf(removeTitle) > -1);
  if (removeIndex > -1) {
    msg.channel.send(`Removed '${serverQueue.songs[removeIndex].title}' from queue`);
    serverQueue.songs.splice(removeIndex, 1);
    if (removeIndex === 0) {
      return play(msg.guild, serverQueue.songs[0], queue, state);
    }
  } else {
    return msg.channel.send(`Title matching '${removeTitle}' not found in queue`);
  }
}

module.exports = { next, prev, play, stop, getMusic, remove }
