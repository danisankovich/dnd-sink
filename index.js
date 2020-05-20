require('dotenv').config();
const Discord = require('discord.js');
const client = new Discord.Client();
const TOKEN = process.env.TOKEN;
const ytdl = require('ytdl-core');
const { OpusEncoder } = require('@discordjs/opus');

// Create the encoder.
// Specify 48kHz sampling rate and 2 channel size.
const encoder = new OpusEncoder(48000, 2);

// Encode and decode.
const encoded = encoder.encode(buffer, 48000 / 100);
const decoded = encoder.decode(encoded, 48000 / 100);

client.login(TOKEN);

client.on('ready', () => {
  console.info(`Logged in as ${client.user.tag}!`);
});

const queue = new Map();

client.on('message', msg => {
  const serverQueue = queue.get(msg.guild.id);
  if (msg.content.startsWith('!p')) {

      getMusic(msg, serverQueue).then(song => {
        // queue.songs.push(song);

      })
  }
});

async function getMusic(message, serverQueue) {
  const voiceChannel = client.channels.get("712695826203410446");
  if (!voiceChannel) return console.error("The channel does not exist!");

  console.log("Successfully connected.");
  const songInfo = message.content.substr(message.content.indexOf(' ')+1)
  // msg.channel.send(song);\
  const { title, video_url: url } = await ytdl.getInfo(songInfo);
  const song = { title, url };
  if (!serverQueue) {
    const queueConstruct = {
      textChannel: message.channel,
      voiceChannel,
      connection: null,
      songs: [],
      volume: 20,
      playing: true
    }
    queue.set(message.guild.id, queueConstruct)
    queueConstruct.songs.push(song)
    // console.log(serverQueue.songs)
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
      serverQueue.songs.shift();
      play(guild, serverQueue.songs[0]);
    })
    .on("error", error => console.error(error));
  dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
  serverQueue.textChannel.send(`Start playing: **${song.title}**`);
}
