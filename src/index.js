const config = require('./config.json');

const ytdl = require('ytdl-core');

const Discord = require('discord.js');
const client = new Discord.Client();

client.login(config.bot_key).then(() => {
    console.log("Logged in!");
});

let connection;
let dispatcher;
let loopUrl;

client.on('message', async message => {
  if (!message.guild) return;

  const messageTokens = message.content.split(' ');

  if (messageTokens[0] === config.keyword) {

    if (messageTokens[1] === 'join') {
        if (message.member.voice.channel) {
            stopExistingAudio();
            connection = await message.member.voice.channel.join();
        } else {
            message.reply('You need to join a voice channel first!');
        }
    } else if (messageTokens[1] === 'leave') {
        connection.disconnect();
    } else if (messageTokens[1] === 'commands') {
        message.reply(getCommands());
    } else if (messageTokens[1] === 'mappedAudio') {
        message.reply(`\n${Object.keys(config.audio).sort()}`);
    } else {
        if (connection && (connection.channel === message.member.voice.channel)) {
            if (messageTokens[1] === 'stop') {
                stopExistingAudio();
            } else if (messageTokens[1] === 'play') {
                playAudio(messageTokens[2]);
            } else if (messageTokens[1] === 'playYt') {
                playYoutubeAudio(messageTokens[2]);
            } else if (messageTokens[1] === 'loop') {
                loopUrl = messageTokens[2];
                loopAudio(messageTokens[2]);
            }
        } else {
            message.reply('You must invite me to join your voice channel first!');
        }
    }        
  }
});

function playAudio(audioToken) {
    if (config.audio[audioToken]) {
        dispatcher = connection.play(config.audio[audioToken]);
    } else {
        dispatcher = connection.play(audioToken);
    }
    if (loopUrl) {
        dispatcher.on('finish', () => {
            loopAudio(loopUrl);
        });
    }
}

function playYoutubeAudio(audioToken) {
    dispatcher = connection.play(ytdl(audioToken, { filter: 'audioonly' }));
    if (loopUrl) {
        dispatcher.on('finish', () => {
            loopAudio(loopUrl);
        });
    }
}

function getCommands() {
    return `\n${config.keyword} join - have bot join current audio channel` +
            `\n${config.keyword} leave - have bot leave audio channel` +
            `\n${config.keyword} loop <youtube url> - loops youtube audio in the background` +
            `\n${config.keyword} play <url or mapped phrase> - play audio that is mapped by phrase, if no mapping then attempt to play as direct (not youtube) url. Will pause/restart looped audio` +
            `\n${config.keyword} playYt <url> - play youtube video audio. Will pause/restart looped audio.` +
            `\n${config.keyword} stop - stops both played and looped audio` + 
            `\n${config.keyword} mappedAudio - lists all mapped audio phrases`;
}

function loopAudio(url) {
    dispatcher = connection.play(ytdl(url, { filter: 'audioonly' }));
    dispatcher.on('finish', () => {
        loopAudio(url);
    });
}

function stopExistingAudio() {
    if (dispatcher) {
        dispatcher.pause();
    }
    dispatcher = undefined;
    loopUrl = undefined;
}