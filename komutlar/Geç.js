const Discord = require('discord.js');
const { RichEmbed } = require('discord.js');
const YouTube = require('simple-youtube-api');
const ytdl = require('ytdl-core');
const youtube = new YouTube('AIzaSyDSiyHBWZI9dDZBWXloNVhrHbpzTTfa0L8');

exports.run = async (client, message, args) => {
    const queue = client.queue;
    
    var searchString = args.slice(0).join(' ');
    var url = args[0] ? args[0].replace(/<(.+)>/g, '$1') : '';
    var serverQueue = queue.get(message.guild.id);

    var voiceChannel = message.member.voiceChannel;
        
    const err0 = new RichEmbed()
      .setColor("#0f0f0f")
      .setDescription(`:x: **Bu Komut Sadece Ses Kanalındayken Kulanılabilir (Ama Bu Zeki Kardeş Burada Kullanmaya Çalışıyor)**`) 
    if (!voiceChannel) return message.channel.send(err0);
    const err05 = new RichEmbed()
    .setColor("#0f0f0f")
    .setDescription(`:x: Şu Anda Hiçbir Şarkı Çalınmıyor (Sanırım Olmayan Şarkıyı Geçecek Bu Zeki Kardeş)`)
    if (!serverQueue) return message.channel.send(err05);
    const songSkip = new RichEmbed()
    .setColor("#0f0f0f")
    .setDescription(`Bu Şarkı Başarıyla Skip Geçildi`)
    serverQueue.connection.dispatcher.end('');
    message.channel.send(songSkip)
if(!message.member.hasPermission("KİCK_MEMBERS")) return message.reply(":x: **This command requires you to either have a role named** `DJ` **or** `Manage Channels` **permission to use it** (being alone with the bot also works)");
};

exports.conf = {
    enabled: true,
    aliases: ['s'],
    permLevel: 0
};

exports.help = {
    name: 'geç',
    description: 'Sıradaki şarkıya geçer. Sırada şarkı yoksa şarkıyı kapatır.',
    usage: 'geç'
};