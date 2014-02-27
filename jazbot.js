"use strict";
var sys = require('sys');
var exec = require('child_process').exec;
var fs = require('fs');
var factory = require('irc-factory'); // npm install irc-factory
var bcrypt = require('bcrypt-nodejs'); // npm install bcrypt-nodejs
var style = require('./styles.js');
var LastFmNode = require('lastfm').LastFmNode;
var Twit = require('twit');
var cmdsTmp = require('./commands');

var cmds = [];
for (var i in cmdsTmp) {
	var cmdTmp = cmdsTmp[i];
	cmds[cmdTmp.trigger] = cmdTmp;
}

var owner = false; // username of the bot's owner for current session
var vote = {
	name: "",
	opt1: 0,
	opt2: 0,
	voters: 0
};

var api = new factory.Api();

var client = api.createClient('test', {
	nick : 'Jazbot1',
	user : 'Jazbot1',
	server : 'irc.w3.org',
	realname: 'Jazbot1',
	port: 6667,
	secure: false
});

var defaultChan = "#ectest2";

var T = new Twit({
					consumer_key:         'unV8PmqZX40GcD0q5W875w'
				  , consumer_secret:      'of3L3C6TV2eKUVv0q5skYqrb9xxfPJf3tlQAzhVbbc'
				  , access_token:         '244528862-SYzS4E31ZVoPrZq9K3IcczhuPrkp5OnEwNUlLJbz'
				  , access_token_secret:  'PNZDkPNtJVdouJdZV1ko8y9HjCvvCo4ZyBFJfhx48KvVp'
				})

api.hookEvent('*', 'registered', function(message) {
	client.irc.join(defaultChan, 'testy2');
	
	var users = ["Lawley-CobHC", "caffufle", "Jazcash"];

	var lastfm = new LastFmNode({
		api_key: '344c82f3551caf9189cf76653586219d',    // sign-up for a key at http://www.last.fm/api
		secret: '59d8aca13f9d7066447dec40778ff81f'
	});
	
	var trackStreams = [];
	
	for (var i in users) {
		var user = users[i];
		trackStreams[i] = ({"user":user, "trackstream":lastfm.stream(user)});
		trackStreams[i].trackstream.on('nowPlaying', function(track, user) {
			client.irc.privmsg(defaultChan, style["blue"]+user + " is now listening to "+track.artist["#text"] + " - " + track.name);
		});
		trackStreams[i].trackstream.start();
	}
});

api.hookEvent('*', 'privmsg', function(message) {
	var from = message.nickname;
	var to = message.target;
	var message = message.message;
	console.log(message); // Shows every IRC message the bot sees in the console
	
	function cmdHandler(params){
		// if params not supplied, default command is executable anywhere, by anybody
		var cmdFunc = (params.cmd === undefined) ? function(){console.log("You must pass a function as a value for the 'cmd' key!")} : params.cmd;
		var authRequired = (params.authRequired === undefined) ? false : params.authRequired; // does cmd require auth?
		var userHasAuth = (from == owner) ? true : false; // does user have auth?
		var where = (params.where === undefined) ? "anywhere" : params.where; // where is cmd executable?
		var loc = (pm) ? from : to; // where to send response
		
		if (where == "pm_only" && !pm){ // not allowed
			client.irc.privmsg(loc, "That command can only be used in a private message to me");
		} else if(where == "channel_only" && pm){ // not allowed
			client.irc.privmsg(loc, "That command can only be used in a channel I am in");
		} else {
			if (authRequired && userHasAuth){ // allowed
				cmdFunc(loc);
			} else if(authRequired && !userHasAuth){ // now allowed
				client.irc.privmsg(loc, "You need to be owner to do that");
			} else if(!authRequired){ // allowed
				cmdFunc(loc);
			}
		}
	}
	var pm = false;
	if (to == client.irc.nick){
		//to = from;	// if message sent directly to bot, set 'to' to the username
		pm = true;
	}
	//console.log(pm);
	if (message[0] == "!"){
   		var temp = message.split(" ");
   		var cmd = temp[0].substring(1)
   		var args = temp.slice(1)
		
		
		
		//console.log(cmds);
		//if (cmd == cmdHi.trigger){
		//	cmdHi.process(client, style, to, from);
		//}
		
		if (cmds[cmd]){
			cmds[cmd].process(client, style, to, from);	
		}
		
		switch (cmd){
			case "testCmd":
				cmdHandler({where: "all", authRequired:true, cmd:function(loc){
					client.irc.privmsg(loc, "Hello!");
				}});
				break;	
			case "setpass":
				cmdHandler({where: "pm_only", authRequired:false, cmd:function(loc){
					var hash = bcrypt.hashSync(args[0]);
					if (!fs.existsSync("passhash") && !owner){
						fs.writeFile("passhash", hash, function(err) {
							if(err) {
								console.log(err);
							} else {
								client.irc.privmsg(loc, style["lightGreen"]+"The file was saved successfully");
							}
						});
					} else if(from == owner){
						fs.writeFile("passhash", hash, function(err) {
							if(err) {
								console.log(err);
							} else {
								client.irc.privmsg(loc, style["lightGreen"]+"The file was saved successfully");
							}
						});
					} else {
						client.irc.privmsg(loc, style["pink"]+"Pass is already set");
					}
				}});
				break;
			case "auth":
				cmdHandler({where: "pm_only", authRequired:false, cmd:function(loc){
					if (fs.existsSync("passhash") && args[0] && !owner){
						fs.readFile('passhash', "utf-8", function (err, data) {
							if (err){ throw err; }
							var pass = args[0];
							if (bcrypt.compareSync(pass, data)){
								client.irc.privmsg(loc, style["lightGreen"]+"Password Valid - User "+from+" is now the authenticated operator");
								owner = from;
							} else {
								client.irc.privmsg(loc, style["pink"]+"Password Invalid");
							}
						});
					} else if (from == owner){
						client.irc.privmsg(loc, style["pink"]+"You are already the owner!");
					} else if (owner){
						client.irc.privmsg(loc, style["pink"]+"An owner has already been set");
					} else if (!fs.existsSync("passhash")){
						client.irc.privmsg(loc, style["pink"]+"Pass isn't set");
					} else {
						client.irc.privmsg(loc, style["pink"]+"You must provide the password");
					}
				}});
				break;
			//case "hi":
			//	cmdHandler({where: "all", authRequired:false, cmd:function(loc){
			//		client.irc.privmsg(loc, style["cyan"]+"Hello "+from+"!");
			//	}});
			//	break;
			case "leave":
				cmdHandler({where: "all", authRequired:true, cmd:function(loc){
					if (args.length == 0){ args[0] = to; }
					for (var i=0; i<args.length; i++){
						var channel = args[i]
						if (channel[0] !== "#"){
							channel = "#" + channel
						}
						try{
							client.irc.part(channel);
						} catch (e){
							console.log(e)
						}
					}
				}});
				break;
			case "trends":
				cmdHandler({where: "all", authRequired:false, cmd:function(loc){
					T.get('trends/place', {id:1}, function (err, reply) {
						try {
							var trends = reply[0].trends;
							var trendsString = "";
							for (var i in trends) {
								var trend = trends[i];
								if (i < trends.length-1){
									trendsString += trend.name + ", ";
								} else {
									trendsString += trend.name;
								}
							}
							client.irc.privmsg(loc, style["cyan"]+trendsString);
						} catch (Exception){
								
						}
					})
				}});
				break;
			case "join":
				cmdHandler({where: "all", authRequired:true, cmd:function(loc){
					if (args.length > 0){
						for (var i=0; i<args.length; i++){
							var channel = args[i]
							if (channel[0] !== "#"){
								channel = "#" + channel
							}
							try{
								client.irc.join(channel);
							} catch (e){
								console.log(e)
							}
						}
					} else {
						client.irc.privmsg(loc, style["darkRed"]+"You must provide a channel to join");	
					}
				}});
				break;
			case "exec":
				cmdHandler({where: "all", authRequired:true, cmd:function(loc){
					if (owner == from && args.length > 0){
						var output = ""
						var str = args.join(' ');
						console.log(str);
						exec(str, function(error, stdout, stderr){
							output = JSON.stringify(stdout);//stdout.replace('\n', '\\n');
							output = output.substring(1, output.length-1);
							output = output.split('\\n');
							//client.irc.privmsg(loc, style["orange"]+"PMing the output to "+from);
							if (output.length > 50){
								client.irc.privmsg(loc, style["darkRed"]+"No can do - Output is more than 50 lines long");							
							} else {
								for (var i=0; i<output.length-1; i++){
									client.irc.privmsg(loc, style["lightGrey"]+output[i]);
								}
							}
						});
					} else if(owner == from && args.length == 0){
						client.irc.privmsg(loc, style["darkRed"]+"You must provide a command");
					} else {
						client.irc.privmsg(loc, style["pink"]+"You must be owner to do that");
					}					
				}});
				break;
			case "xkcd":
				cmdHandler({where: "all", authRequired:true, cmd:function(loc){
					var loc = (args[0] === undefined) ? loc : args[0];
					if (owner == from){
						for (var i=1; i<10; i++){
							client.irc.privmsg(loc, "https://xkcd.com/"+i+"/");
						}
					}
				}});
				break;
			case "callvote":
				cmdHandler({where: "channel_only", authRequired:false, cmd:function(loc){
					if (args[0]){
						vote.name = args.join(" ");
						client.irc.raw('LIST', loc);
					} else {
						client.irc.privmsg(loc, "You must state what you wish to vote on!");
					}
				}});
				break;
			case "vote":
				cmdHandler({where: "all", authRequired:false, cmd:function(loc){
					if ((vote.opt1 < vote.voters-1) && (vote.opt2 < vote.voters-1)){
						if (args[0] == "y"){
							vote.opt1 = vote.opt1+1;
							client.irc.privmsg(loc, vote.name+" - Yes: "+vote.opt1+"/"+vote.voters+" - No: "+vote.opt2+"/"+vote.voters);
						} else if(args[0] == "n"){
							vote.opt2 = vote.opt2+1;
							client.irc.privmsg(loc, vote.name+" - Yes: "+vote.opt1+"/"+vote.voters+" - No: "+vote.opt2+"/"+vote.voters);
						} else {
							client.irc.privmsg(loc, "You must say state y or n");
						}
						vote.name = args[0];
					} else if (args[0] && vote.name == "") {
						client.irc.privmsg(loc, "Currently no vote in progress");
					} else{
						client.irc.privmsg(loc, "Vote passed! Majority voted in favour of "+vote.name);
						vote.opt1 = 0;
						vote.op2 = 0;
						vote.name = ""
						vote.voters = 0;
					}
				}});
				break;
			case "users":
				cmdHandler({where: "all", authRequired:false, cmd:function(loc){
					client.irc.privmsg(loc, "test cmd called!");
					client.irc.raw('LIST', loc);
					api.hookEvent('*', 'list', function(info) {
						client.irc.privmsg(loc, "Done!");
						console.log(info["list"][0]);
						var numOfUsersInChannel = info["list"][0]["users"];
						client.irc.privmsg(loc, "There are "+numOfUsersInChannel+" users in this channel");
					});
				}});
			default:
				break;
		}
	} else {
		//console.log(message);	
	}
});

//api.hookEvent('*', 'list', function(message) {
//	vote.voters = message.list[0].users-1;
//	client.irc.privmsg("#ectest2", vote.name+" - Yes: "+vote.opt1+"/"+vote.voters+" - No: "+vote.opt2+"/"+vote.voters);
	//client.irc.privmsg('#ectest2', 'hey this is a test');
//});