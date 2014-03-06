"use strict";
/* 	##################
		Author: Jazcash
 		################## */
// Built-in imports
var sys = require('sys');
var exec = require('child_process').exec;
var fs = require('fs');
// Third-party imports
var factory = require('irc-factory');
var bcrypt = require('bcrypt-nodejs');
var Twit = require('twit');
var LastFmNode = require('lastfm').LastFmNode;
// My imports
var style = require('./styles.js');

var lastfm = new LastFmNode({
	api_key: '344c82f3551caf9189cf76653586219d',
	secret: '59d8aca13f9d7066447dec40778ff81f'
});

var api = new factory.Api();
var client = api.createClient('jazbot', {
	nick : "Jazbot",
	user : "Jazbot",
	server : 'irc.w3.org',
	realname: "Jazbot",
	port: 6667,
	secure: false
});

var initialChannels = ["#ectest4 testy4"];
var channels = [];
var myNick = null;
var	owner = null;

var cmds =
{
	"!setpass":{
		"pm":{"auth":false, "reqArgs":1, "synopsis":"!setpass <password>"},
		"func":function(msg, target, args){
			var hash = bcrypt.hashSync(args[1]);
			if ((!fs.existsSync("passhash") && owner == null) || msg.username == owner){
				fs.writeFile("passhash", hash, function(err) {
					if(err) {
						console.log(err);
					} else {
						client.irc.privmsg(target, style.lightgreen+"The file was saved successfully");
					}
				});
			} else if(fs.existsSync("passhash")){
				client.irc.privmsg(target, style.lightred+"Pass is already set");
			}
		}
	},
	"!auth":{
		"pm":{"auth":false, "reqArgs":1, "synopsis":"!auth <password>"},
		"func":function(msg, target, args){
			if (fs.existsSync("passhash") && owner == null){
				fs.readFile('passhash', "utf-8", function (err, data) {
					if (err){ throw err; }
						var pass = args[1];
					if (bcrypt.compareSync(pass, data)){
						client.irc.privmsg(target, style.lightgreen+"Password Valid - You are now the authenticated operator");
						owner = msg.username;
					} else {
						client.irc.privmsg(target, style.lightred+"Password Invalid");
					}
				});
			} else if (msg.username == owner){
				client.irc.privmsg(target, style.lightred+"You are already the owner!");
			} else if (owner !== null){
				client.irc.privmsg(target, style.lightred+"An owner has already been set");
			} else if (!fs.existsSync("passhash")){
				client.irc.privmsg(target, style.lightred+"Password is not set");
			}
		}
	},
	"!hi":{
		"any":{"auth":false, "reqArgs":0, "synopsis":"!quit [string]"},
		"func":function(msg, target, args){
			var str = (args.length > 1) ? args[1] : msg.nickname;
			client.irc.privmsg(target, style.purple+"Hello "+str+"!");
		}
	},
	"!quit":{
		"auth":true, "reqArgs":0, "synopsis":"!quit [string]", 
		"func":function(msg, target, args){
			var str = (args.length > 1) ? args[1] : msg.nickname + " called !quit";
			client.irc.disconnect(str);
		}
	},
	"!join":{
		"auth":true, "reqArgs":1, "synopsis":"!join <channel>", 
		"func":function(msg, target, args){
			client.irc.join(args[1]);
		}
	},
	"!leave":{
		"chan":{"auth":true, "reqArgs":0, "synopsis":"!leave [channel]"},
		"pm":{"auth":true, "reqArgs":1, "synopsis":"!leave <channel>"},
		"func":function(msg, target, args){
			var chan = "bobo";
			client.irc.join(args[1]);
		}
	},
	"!kick":{
		"any":{"auth":true, "reqArgs":1, "synopsis":"!kick [channel] <username>"},
		"func":function(msg, target, args){
			// When irc-factory adds the thing - Make sure username is valid and in channel
			if (msg.isPm){
				if (args.length <= 2){
					client.irc.privmsg(target, style.lightred+"You must provide a channel. " + this.synopsis);
				} else {
					client.irc.kick(args[1], args[2]);
				}
			} else {
				client.irc.kick(target, args[1]);
			}
		}
	},
	"!chans":{
		"auth":true, "reqArgs":0, "synopsis":"!chans",
		"func":function(msg, target, args){
			client.irc.privmsg(target, channels);
		}
	},
	"!lastfm":{
		"auth":false, "reqArgs":1, "synopsis":"!lastfm <last.fm username>",
		"func":function(msg, target, args){
			var user = args[1];
			var trackStream = lastfm.stream(user);
			var done = false;
			trackStream.on('nowPlaying', function(track) {
				if (!done){
					client.irc.privmsg(target, style.blue+user + " is currently listening to "+style.bold+track.artist["#text"] + " - " + track.name);
				}
				done = true;
			});
			trackStream.on('lastPlayed', function(track) {
				if (!done){
					client.irc.privmsg(target, style.blue+user + " last listened to "+style.bold+track.artist["#text"] + " - " + track.name);
				}
				done = true;
			});
			trackStream.start();
			trackStream.stop();
		}
	}
};

process.on('SIGINT', function() {
	client.irc.disconnect("Shutdown from CLI");
  console.log("\nGracefully shutting down from SIGINT (Ctrl-C)" );
  process.exit();
});

api.hookEvent('*', 'registered', function(msg) {
	myNick = msg.nickname;
	for (var i in initialChannels){
		client.irc.join(initialChannels[i].split(" ")[0], initialChannels[i].split(" ")[1]);
	}
});

api.hookEvent('*', 'join', function(msg) {
	if (msg.nickname == myNick){
		channels.push(msg.channel);	
	}
});

api.hookEvent('*', 'part', function(msg) {
	if (msg.nickname == myNick){
		channels.remove(msg.channel);
	}
});

api.hookEvent('*', 'privmsg', function(msg) { // message contains nickname, username, hostname, target, message, time and raw
	msg["isPm"] = (msg.target == myNick) ? true : false;
	var target = (msg.isPm) ? msg.username : msg.target;
	msg["isCmd"] = (msg.message[0] == "!") ? true : false;
	msg ["auth"] = (msg.username == owner) ? true : false;
	
	if (msg.nickname == "Jazcash") msg.auth = true; //temp
	
	if (msg.isCmd) {
		var args = msg.message.split(" ");
		if (cmds[args[0]] !== undefined){
			var cmd = cmds[args[0]];
			var where;
			if (cmd.any !== undefined){
				where = "any";	
			} else{
				where = (msg.isPm) ? "pm" : "chan";	
			}
			if (cmd[where] !== undefined || (cmd.pm === undefined && cmd.chan === undefined)){
				console.log(cmd);
				console.log(where);
				if ((cmd.auth && msg.auth) || !cmd.auth){
					if (args.length-1 >= cmd[where].reqArgs){
						 cmd.func(msg, target, args);
					} else {
						client.irc.privmsg(target, style.lightred+"We require more args");
					}
				} else {
					client.irc.privmsg(target, style.lightred+"You require authorisation to use that command");
				}
			} else if(cmd[where] == undefined){
				var err = (msg.isPm) ? "That command can only be used in a channel I am in" : "That command can only be used in a PM to me";
				client.irc.privmsg(target, style.lightred+err);
			} else{
				client.irc.privmsg(target, style.lightred+"Oh nobs");
			}
		}
	}
});