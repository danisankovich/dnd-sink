const ytdl = require('ytdl-core');

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

function play(guild, song, queue, state) {
  const serverQueue = queue.get(guild.id);
  if (!song) {
    serverQueue.voiceChannel.leave();
    queue.delete(guild.id);
    return;
  }

  const dispatcher = serverQueue.connection
    .play(ytdl(song.url))
    .on("finish", () => {
      next(serverQueue, guild, state);
    })
    .on("error", error => console.error(error));
  dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
  serverQueue.textChannel.send(`Start playing: **${song.title}**`);
}

async function getMusic(message, serverQueue, queue, state, client) {
  const voiceChannel = message.member.voice.channel;
  if (!voiceChannel) return console.error("The channel does not exist!");

  const songInfo = message.content.substr(message.content.indexOf(' ')+1)
  let title, url;
  try {
    ({ title, video_url: url } = await ytdl.getInfo(songInfo));
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
      queueConstruct.connection = connection;
      play(message.guild, queueConstruct.songs[0], queue, state);
    } catch (e) {
      queue.delete(message.guild.id);
      return message.channel.send(`Error: ${e.message}`);
    }
  } else {
    serverQueue.songs.push(song);
    return message.channel.send(`${song.title} has been added to the queue!`);
  }
}

function stop(serverQueue) {
  serverQueue.songs = [];
  serverQueue.voiceChannel.leave();
}

module.exports = { next, play, stop, getMusic }
