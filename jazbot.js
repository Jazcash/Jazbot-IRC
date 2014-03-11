"use strict";
// Built-in imports
var sys = require('sys');
var exec = require('child_process').exec;
var fs = require('fs');
// Third-party imports
var factory = require('irc-factory');
var bcrypt = require('bcrypt-nodejs');
var Twit = require('twit');
var LastFmNode = require('lastfm').LastFmNode;
var request = require('request');
var parseString = require('xml2js').parseString;
var JSONFile = require('json-tu-file');
// My imports
var style = require('./styles.js');

var config;
if (fs.existsSync("config.json")){
	config = JSONFile.readFileSync("config.json");
} else {
	config = {
		"botnick":"Jazbot",
		"botuser":"Jazbot",
		"realname":"Jazbot",
		"server":"irc.w3.org",
		"port":6667,
		"channels":["#test"],
		"lastfm":{"apikey":"API KEY GOES HERE", "secret":"SECRET GOES HERE"},
		"lyricsnmusicApiKey":"API KEY GOES HERE",
	}
	JSONFile.writeFileSync(config, 'config.json', {encoding: 'utf-8'});
}

var api = new factory.Api();
var client = api.createClient('jazbot', {
	nick : config.botnick,
	user : config.botuser,
	server : config.server,
	realname: config.realname,
	port: config.port,
	secure: false
});

var lastfm = new LastFmNode({
	api_key: config.lastfm.apikey, //	'344c82f3551caf9189cf76653586219d',
	secret: config.lastfm.secret	 //	'59d8aca13f9d7066447dec40778ff81f'
});

var initialChannels = config.channels; // ["#ectest4 testytttr"];
var myNick = null;
var	owner = null;
var votename, opt1, opt2, voteinprogress, eligible, maxvotes;

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
		"any":{"auth":true, "reqArgs":0, "synopsis":"!quit [string]"}, 
		"func":function(msg, target, args){
			var str = (args.length > 1) ? args[1] : msg.nickname+" called !quit";
			client.irc.disconnect(str);
		}
	},
	"!join":{
		"any":{"auth":true, "reqArgs":1, "synopsis":"!join <channel>"}, 
		"func":function(msg, target, args){
			client.irc.join(args[1]);
		}
	},
	"!leave":{
		"chan":{"auth":true, "reqArgs":0, "synopsis":"!leave [channel] (Defaults to channel spoken in)"},
		"pm":{"auth":true, "reqArgs":1, "synopsis":"!leave <channel>"},
		"func":function(msg, target, args){
			var chan;
			if (msg.isPm){
				chan = args[1];
			} else{
				chan = (args.length > 1) ? args[1] : msg.target;	
			}
			client.irc.part(chan, "Bye dude");
		}
	},
	"!kick":{
		"any":{"auth":true, "reqArgs":1, "synopsis":"!kick [channel] <username>"},
		"func":function(msg, target, args){
			// When irc-factory adds the thing - Make sure username is valid and in channel
			if (msg.isPm){
				if (args.length <= 2){
					client.irc.privmsg(target, style.lightred+"You must provide a channel. "+this.synopsis);
				} else {
					client.irc.kick(args[1], args[2]);
				}
			} else {
				client.irc.kick(target, args[1]);
			}
		}
	},
	"!callvote":{ // Discontinued voting until irc-factory supports better info grabbing
		"chan":{"auth":true, "reqArgs":1, "synopsis":"!callvote <votename>"},
		"func":function(msg, target, args){
			if (voteinprogress === undefined || voteinprogress == false){
				votename = args[1];
				eligible = [];
				opt1 = 0;
				opt2 = 0;
				voteinprogress = true;
				client.irc.raw("LIST", target);
				api.hookEvent('*', 'list', function(list) {
					var users = list.list[0].users-1;
					maxvotes = users;
					api.unhookEvent('*', 'list');
				});
				client.irc.privmsg(target, style.blue+msg.nickname+" called a vote: "+votename+". !vote y,1,n,2 to cast your vote");
				setTimeout(function () {
					voteinprogress = false;
					var winnerstr;
					var winnerstr = (opt1 > opt2) ? "Option 1!" : "Option 2!";
					client.irc.privmsg(target, style.blue+"Time up, vote ended - Winner is "+winnerstr);
					eligible = [];
				}, 5000)
			} else {
				client.irc.privmsg(target, style.red+"Vote already in progress");
			}
		}
	},
	"!vote":{ // Discontinued voting until irc-factory supports better info grabbing
		"chan":{"auth":true, "reqArgs":1, "synopsis":"!vote <option>(y,1,n,2)"},
		"func":function(msg, target, args){
			if (voteinprogress){
				if (eligible.indexOf(msg.username) == -1){
					if (args[1] == "1" || args[1] == "y"){
						opt1 += 1;
						client.irc.privmsg(target, style.blue+votename+" - Yes="+opt1+"/"+maxvotes+" | No="+opt2+"/"+maxvotes);
					} else if(args[1] == "2" || args[1] == "n"){
						opt2 += 1;
						client.irc.privmsg(target, style.blue+votename+" - Yes="+opt1+"/"+maxvotes+" | No="+opt2+"/"+maxvotes);
					}
					console.log("opt1"+opt1);
					eligible += msg.username;
				} else {
					client.irc.privmsg(target, style.lightred+"You have already voted "+msg.nickname+"!");
				}
			} else {
				client.irc.privmsg(target, style.lightred+"No vote is in progress!");
			}
			if (opt1+opt2 == maxvotes){
				voteinprogress = false;
				var winnerstr = (opt1 > opt2) ? "Option 1!" : "Option 2!";
				client.irc.privmsg(target, style.blue+"Vote ended - Winner is "+winnerstr);
				eligible = [];
			}
		}
	},
	"!lastfm":{
		"any":{"auth":false, "reqArgs":1, "synopsis":"!lastfm <last.fm username>"},
		"func":function(msg, target, args){
			var user = args[1];
			try {
			var trackStream = lastfm.stream(user);
			} catch (err){
				console.log(err);
			}
			var done = false;
			trackStream.on('nowPlaying', function(track) {
				if (!done){
					client.irc.privmsg(target, style.blue+user+" is currently listening to "+style.bold+track.artist["#text"]+" - "+track.name);
					displayLyric(track);
				}
				done = true;
			});
			trackStream.on('lastPlayed', function(track) {
				if (!done){
					client.irc.privmsg(target, style.blue+user+" last listened to "+style.bold+track.artist["#text"]+" - "+track.name);
					displayLyric(track);
				}
				done = true;
			});
			function displayLyric(track){
				var url = "http://api.lyricsnmusic.com/songs?api_key="+config.lyricsnmusicApiKey+"&artist="+track.artist["#text"]+"&track="+track.name;
				request(url, function (error, response, body) {
					if (!error && response.statusCode == 200) {
						var track = JSON.parse(body)[0];
						if (track !== undefined && track.snippet !== undefined){
							var lyric = track.snippet.split("\r\n");
							lyric.pop();
							var lyricsstr = "";
							for (var i in lyric){
								var line = lyric[i].trim();
								if (line.length > 0){
									if (!line[line.length-1].match(/\!|\?/g)){
										line += ". ";
										lyricsstr += line;
									} else {
										line += " ";
										lyricsstr += line;	
									}
								}
							}
							if (lyricsstr.length > 0) client.irc.privmsg(target, style.pink+lyricsstr);
						}
					} else {
						console.log(error);	
					}
				});
			}
			trackStream.on('error', function(error) {
				client.irc.privmsg(target, style.lightred+"There was an error with that command, make sure the username exists");
				console.log(error);
			});
			trackStream.start();
			trackStream.stop();
		}
	},
	"!listen":{
		"any":{"auth":false, "reqArgs":2, "synopsis":"!listen <name> <rss xml> [interval - default=1min]"},
		"func":function(msg, target, args){
			var rssListener = {"id":args[1], "feed":args[2], "interval":(args.length > 3) ? args[3] : 60000};
			onNewRSSItem(rssListener, false, target, function(item){
				client.irc.privmsg(target, style.darkblue+rssListener.id+" - "+style.blue+item.title + ": "+item.link);
			});
		}
	},
	"!subscribe":{
		"any":{"auth":false, "reqArgs":2, "synopsis":"!subscribe <name> <rss xml> [interval - default=1min]"}, 
		"func":function(msg, target, args){
			var rssListener = {"id":args[1], "feed":args[2], "interval":(args.length > 3) ? args[3] : 60000};
			onNewRSSItem(rssListener, true, target, function(item){
				client.irc.privmsg(target, style.darkblue+rssListener.id+" - "+style.blue+item.title + ": "+item.link);
			});
		}
	},
}

var listeners = {};

function getSubscriptions(){
	var data;
	if (fs.existsSync("subscriptions.json")){
		data = JSONFile.readFileSync("subscriptions.json");
	} else {
		data = {};	
	}
	return data;
}

function addSubscription(sub){
	var subs = getSubscriptions();
	subs[sub.id] = {"feed":sub.feed, "interval":sub.interval};
	JSONFile.writeFileSync(subs, 'subscriptions.json', {encoding: 'utf-8'});
}

function onNewRSSItem(rssListener, subscription, target, func){
	var latestItem = null;
	var intervalId = setInterval(function addFeed(firstIteration){
		if (firstIteration === undefined) firstIteration = false;
		request(rssListener.feed, function (error, response, body) {
			try {
				if (error == null && response.statusCode == 200) {
					var xml = body;
					parseString(xml, function (err, result) {
						var type;
						if ("rss" in result) type = "rss"
						else if("feed" in result) type = "feed"
						var thisItem;
						if (type == "rss") thisItem = result.rss.channel[0].item[0]
						else if(type == "feed") thisItem = result.feed.entry[0];
						if (thisItem !== undefined){
							//console.log(thisItem);
							if (type == "rss") thisItem = {"title":thisItem.title[0], "link":thisItem.link[0], "id": thisItem.guid[0]}
							else if(type == "feed") thisItem = {"title":thisItem.title[0]._, "link":thisItem.link[0].$.href, "id":thisItem.id[0]}
							var namepluslink = thisItem.name + thisItem.link;
							if (namepluslink != latestItem){
								if (firstIteration){
									if (subscription){ // !subscribe
										console.log(getSubscriptions());
										console.log(rssListener.id);
										if (rssListener.id in getSubscriptions()){
											throw {name:"Subscription Exists", msg:"Subscription already exists"}
										} else {
											addSubscription(rssListener);
											client.irc.privmsg(target, style.lightgreen+"Subscription added");
										}
									} else { // !listen
										if (rssListener.id in listeners){
											throw {name:"Listener Exists", msg:"Listener already exists"}
										} else {
											listeners[rssListener.id] = {"feed":rssListener.feed, "interval":rssListener.interval};
											client.irc.privmsg(target, style.lightgreen+"Listener added");
										}
									}
								}
								latestItem = namepluslink;
								func(thisItem);
							}
						} else {
							throw {name:"RSS Error", msg:"There was an error with that resource"}
						}
					});
				} else {
					throw {name:"RSS Error", msg:"There was an error with that resource"}
				}
				firstIteration = false;
				return addFeed;
			} catch (err){
				if (err.stack === undefined){
					client.irc.privmsg(target, style.lightred+err.msg);
				} else {
					client.irc.privmsg(target, style.lightred+"There was an error");
					console.log(err.stack);
				}
				clearInterval(intervalId);
			}
		});
		return addFeed;
	}(true), rssListener.interval);
}
	
api.hookEvent('*', 'registered', function(msg) {
	myNick = msg.nickname;
	for (var i in initialChannels){
		client.irc.join(initialChannels[i].split(" ")[0], initialChannels[i].split(" ")[1]);
	}
});

api.hookEvent('*', 'privmsg', function(msg) { // message contains nickname, username, hostname, target, message, time and raw
	msg["isPm"] = (msg.target == myNick) ? true : false;
	var target = (msg.isPm) ? msg.username : msg.target;
	msg["isCmd"] = (msg.message[0] == "!") ? true : false;
	msg ["auth"] = (msg.username == owner) ? true : false;
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
				if ((cmd[where].auth && msg.auth) || !cmd[where].auth){
					if (args.length-1 >= cmd[where].reqArgs){
						cmd.func(msg, target, args);
					} else {
						client.irc.privmsg(target, style.lightred+"More args required - SYNOPSIS: "+cmd[where].synopsis);
					}
				} else {
					client.irc.privmsg(target, style.lightred+"You require authorisation to use that command");
				}
			} else if(cmd[where] == undefined){
				var err = (msg.isPm) ? "That command can only be used in a channel I am in" : "That command can only be used in a PM to me";
				client.irc.privmsg(target, style.lightred+err);
			}
		}
	}
});

process.on('SIGINT', function() {
	client.irc.disconnect("Shutdown from CLI");
  console.log("\nGracefully shutting down from SIGINT (Ctrl-C)" );
  process.exit();
});