import "dotenv/config";
import { Client, GatewayIntentBits} from 'discord.js';
import { createAudioPlayer, createAudioResource, joinVoiceChannel, NoSubscriberBehavior } from "@discordjs/voice";
import ytdl from 'ytdl-core';

const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildVoiceStates,
    ],
  });

const version = "version 0.9";
const PREFIX = "!";
let player;
let playStatus = false;
let playList = [
  "https://www.youtube.com/watch?v=CID-sYQNCew",
  "https://www.youtube.com/watch?v=mZLjlnzfONc",
  "https://www.youtube.com/watch?v=ewGJ-YsSah8",
  "https://www.youtube.com/watch?v=hLoH1eKY9-U",
];
let playListIterator = 0;

client.on('ready', () => {
    console.log(`Bot gotowy`);
  });

client.on('messageCreate', async (message) => {
  let args = message.content.substring(PREFIX.length).split(" ");
  let channel;
  let url;
  let stream;
  let songInfo;
  let songLength;


  switch(args[0]){
      case "play":

          if(!args[1]){
              message.channel.send("Musisz podać link");
              return;
          }

          channel = message.member.voice.channel;
          url = args[1];  
          stream = ytdl(url,{filter: 'audioonly'});

          if(channel === null){
              console.log("Nie ma Cię na żadnym kanale");
          } else {
              console.log(`Jesteś na serwerze ${channel.name}`);
              
              let connection = joinVoiceChannel({
                  channelId: channel.id,
                  guildId: channel.guild.id,
                  adapterCreator: channel.guild.voiceAdapterCreator,
              });

              console.log("Bot dołączył");

              player = createAudioPlayer({
                  behaviors: {
                    noSubscriber: NoSubscriberBehavior.Pause,
                  },
                });

              const resource = createAudioResource(stream, {inlineVolume: true});
              // const resource = createAudioResource('./muzyczka.mp3');

              connection.subscribe(player);
              player.play(resource);
              playStatus = !playStatus;
          }

          songInfo = await ytdl.getInfo(url);
          songLength = (songInfo.player_response.videoDetails.lengthSeconds)*1000; // *1000 bo ms


          setTimeout(()=>{
            console.log(`Koniec piosnki`);
          },songLength);

          break;
      case 'stop':
              
          if(playStatus){
              player.pause();
              console.log("Wycisz") 
              playStatus = !playStatus;  
          }

          break;
      case 'help':

          message.channel.send(`List of commands: !help, !play, !stop, !add, !clear, !remove, !version`);

          break;
      case 'version':

          message.channel.send(version);

          break;
      case "show":

          if(playList.length === 0 ){
            message.channel.send("Lista jest pusta");
          } else {
            playList.forEach(one=>{
              message.channel.send(one);
            })
          }

          break;
      case "add":

          if(!args[1]){
            message.channel.send("Musisz podać link");
            return;
          }

          playList.push(args[1]);
          message.channel.send("Dodano do listy");

          break;

      case "clear":

          playList = [];
          message.channel.send("Wyczyszczono listę");
          
          break;

      case "remove":

        if(!args[1]){
          message.channel.send("Podaj numer utworu na liście np: !remove 2 (pamiętaj że lista numerowana jest od zera)");
          return;
        }

        playList = playList.filter((one,index)=>{
          return index != args[1];
        })

        message.channel.send(`Usunięto element nr ${args[1]}`);

          break;

      case "start":

          channel = message.member.voice.channel;
          url = playList[playListIterator];  
          stream = ytdl(url,{filter: 'audioonly'});

          if(channel === null){
              console.log("Nie ma Cię na żadnym kanale");
          } else {
              console.log(`jesteś na serwerze ${channel.name}`);
              
              let connection = joinVoiceChannel({
                  channelId: channel.id,
                  guildId: channel.guild.id,
                  adapterCreator: channel.guild.voiceAdapterCreator,
              });

              console.log("bot dołączył");

              player = createAudioPlayer({
                  behaviors: {
                    noSubscriber: NoSubscriberBehavior.Pause,
                  },
                });

              let resource = createAudioResource(stream, {inlineVolume: true});
              // const resource = createAudioResource('./muzyczka.mp3');

              connection.subscribe(player);
              player.play(resource);
              playStatus = !playStatus;
          }

          songInfo = await ytdl.getInfo(url);
          songLength = (songInfo.player_response.videoDetails.lengthSeconds)*1000; // *1000 bo ms
          playListIterator++;

          setTimeout(()=>{
            console.log(`koniec piosnki`);
            message.channel.send(`!play ${playList[playListIterator]}`)
          },songLength);
      
          break;
      case "skip":
        player.pause();
        message.channel.send(`!play ${playList[playListIterator]}`)
        playListIterator++;

          break;
  }
});
  
client.login(process.env.DISCORD_BOT_ID);