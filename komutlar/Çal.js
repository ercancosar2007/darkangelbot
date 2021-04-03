const Discord = require("discord.js");
const { RichEmbed } = require("discord.js");
const YouTube = require("simple-youtube-api");
const ytdl = require("ytdl-core");
const youtube = new YouTube("AIzaSyDo6dfoQ3ybLhRLAnpGjZ3E714qtkTbq6g");

exports.run = async (client, message, args) => {
  const queue = client.queue;

  var searchString = args.slice(0).join(" ");
  var url = args[0] ? args[0].replace(/<(.+)>/g, "$1") : "";
  var serverQueue = queue.get(message.guild.id); //böyle amk

  var voiceChannel = message.member.voiceChannel; //tüm thisleri message yap

  const embed = new RichEmbed()
    .setColor("#0f0f0f")
    .setTitle(":x: Hata")
    .setDescription("Lütfen Bu Komudu (çal [ Şarkının Linki yada İsmi ]) Şeklinde Kullanın (Adam Akıllı Ol Adamın Asabını Bozma)");
  if (!args[0]) return message.channel.send(embed);

  const voiceChannelAdd = new RichEmbed()
    .setColor("#0f0f0f")
    .setDescription(
      `:x: **Bu Komut Sadece Ses Kanallarında Kullanılabilir (Ama Bu Zeki Kardeş Burada Kullanmaya Çalışıyor)**`
    );
  if (!voiceChannel) return message.channel.send(voiceChannelAdd);

  var permissions = voiceChannel.permissionsFor(client.user);
  if (!permissions.has("CONNECT")) {
    const warningErr = new RichEmbed()
      .setColor("#0f0f0f")
      .setDescription(
        `:x: Bulunduğun Kanala Katılmam İçin Yeterli Yetkim Yok (YETKİ VERİN ULAN BANA)`
      );
    return message.channel.send(warningErr);
  }
  if (!permissions.has("SPEAK")) {
    const musicErr = new RichEmbed()
      .setColor("#0f0f0f")
      .setDescription(
        `:x: Bu Kanalda Konuşma Yetkim Bulunmadığı İçin Şarkıyı Çalamıyorum (LAN YETKİ VERİN DEMEDİMİ SİZE)`
      );
    return message.channel.send(musicErr);
  }
  if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
    var playlist = await youtube.getPlaylist(url);
    var videos = await playlist.getVideos();
    for (const video of Object.values(videos)) {
      var video2 = await youtube.getVideoByID(video.id);
      await handleVideo(video2, message.message, voiceChannel, true);
    }
    const PlayingListAdd = new RichEmbed()
      .setColor("#0f0f0f")
      .setDescription(
        `[${playlist.title}](https://www.youtube.com/watch?v=${playlist.id}) Çalma Listesine Eklendi (Hadi Hayırlı Olsun)`
      );
    return message.channel.send(PlayingListAdd);
  } else {
    try {
      var video = await youtube.getVideo(url);
    } catch (error) {
      try {
        var videos = await youtube.searchVideos(searchString, 10);

        var r = 1;

        var video = await youtube.getVideoByID(videos[r - 1].id);
      } catch (err) {
        console.error(err);
        const songNope = new RichEmbed()
          .setColor("#0f0f0f")
          .setDescription(
            `:x: Uzay Bile Tarandı ama Bu İsimde Bir Şarkı Bulunamadı (Bizi mi Yiyon?)`
          );
        return message.channel.send(songNope);
      }
    }
    return handleVideo(video, message, voiceChannel);
  }

  async function handleVideo(video, message, voiceChannel, playlist = false) {
    var serverQueue = queue.get(message.guild.id);

    var song = {
      id: video.id,
      title: video.title,
      durationh: video.duration.hours,
      durationm: video.duration.minutes,
      durations: video.duration.seconds,
      url: `https://www.youtube.com/watch?v=${video.id}`,
      thumbnail: `https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`,
      requester: message.author.tag
    };
    if (!serverQueue) {
      var queueConstruct = {
        textChannel: message.channel,
        voiceChannel: voiceChannel,
        connection: null,
        songs: [],
        volume: 3,
        playing: true
      };
      queue.set(message.guild.id, queueConstruct);

      queueConstruct.songs.push(song);

      try {
        var connection = await voiceChannel.join();
        queueConstruct.connection = connection;
        play(message.guild, queueConstruct.songs[0]);
      } catch (error) {
        console.error(
          `:x: I couldn't get into the audio channel ERROR: ${error}`
        );
        queue.delete(message.guild.id);
        return message.channel.send(
          `:x: I couldn't get into the audio channel ERROR: ${error}`
        );
      }
    } else {
      serverQueue.songs.push(song);

      if (playlist) return undefined;

      const songListBed = new RichEmbed()
        .setColor("RANDOM")
        .setDescription(
          `[${song.title}](https://www.youtube.com/watch?v=${song.id}) Adlı Şarkı Kuyruğa Alındı (Hadi Yine İyisin Ben Olmasam Senin İçin Şarkıyı Otomatik Çalacak Adam Yok)`
        );
      return message.channel.send(songListBed);
    }
    return undefined;
  }
  function play(guild, song) {
    var serverQueue = queue.get(guild.id);

    if (!song) {
      serverQueue.voiceChannel.leave();
      voiceChannel.leave();
      queue.delete(guild.id);
      return;
    }

    const dispatcher = serverQueue.connection
      .playStream(ytdl(song.url))
      .on("end", reason => {
        serverQueue.songs.shift();
        play(guild, serverQueue.songs[0]);
      })
      .on("error", error => console.error(error));
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);

    let y = "";
    if (song.durationh === 0) {
      y = `${song.durationm || 0}:${song.durations || 0}`;
    } else {
      y = `${song.durationh || 0}:${song.durationm || 0}:${song.durations ||
        0}`;
    }

    const playingBed = new RichEmbed()
      .setColor("#0f0f0f")
      .setAuthor(`Oynatılıyor`, song.thumbnail)
      .setDescription(`[${song.title}](${song.url})`)
      .addField("Şarkının Süresi       ", `${y}`, true)
      .addField("Şarkıyı Oynatan Kişi", `${song.requester}`, true)
      .setThumbnail(song.thumbnail);
    serverQueue.textChannel.send(playingBed);
  }
};

exports.conf = {
  enabled: true,
  aliases: ["p"],
  permLevel: 0
};

exports.help = {
  name: "çal",
  description:
    "Belirttiğiniz şarkıyı bulunduğunuz sesli kanalda çalar/oynatır.",
  usage: "oynat [şarkı adı]"
};
