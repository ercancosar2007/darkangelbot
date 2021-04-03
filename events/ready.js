const chalk = require('chalk');
const moment = require('moment');
const Discord = require('discord.js');
const ayarlar = require('../ayarlar.json');

var prefix = ayarlar.prefix;


module.exports = client => {
  console.log(`Bot = ${client.user.username} ismi ile giriş yapıldı!`);
  console.log(`Bot = ${client.user.username} Şu anda ` + client.channels.size + ` adet kanala, ` + client.guilds.size + ` adet sunucuya ve ` + client.guilds.reduce((a, b) => a + b.memberCount, 0).toLocaleString() + ` kullanıcıya hizmet veriliyor!`);
const link = "https://discordapp.com/oauth2/authorize?client_id="+client.user.id+"&scope=bot&permissions=8";
   console.log(`Davet Linki = ${link}`)
};