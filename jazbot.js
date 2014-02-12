// IMPORTS
var sys = require('sys') 
var exec = require('child_process').exec;
var fs = require('fs');
var irc = require('irc'); // npm install irc
var bcrypt = require('bcrypt-nodejs'); // npm install bcrypt-nodejs
// My imports - Unused atm
//var Server = require("./server.js");
//var Channel = require("./channel.js");
//var User = require("./user.js");

// GLOBAL VARIABLES
var colours = irc.colors.codes
	/* COLOURS 
		white, black, dark_blue, dark_green, light_red, dark_red, magenta, orange, 
		yellow, light_green, cyan, light_cyan, light_blue, light_magenta, gray, light_gray, reset
	*/

// SESSION VARIABLES
var owner = false; // username of the bot's owner for current session

// Create bot
var server = "irc.w3.org";
var botname = "Jazbot";

var bot = new irc.Client(server, botname, {
    channels: ["#ectest2 test"]
});

// On message event
bot.addListener('message', function(from, to, message) {
	console.log(message); // Debugging
	var pm = false;
	if (to == botname){
		//to = from;	// if message sent directly to bot, set 'to' to the username
		pm = true;
	}
	if (message[0] == "!"){
   		var temp = message.split(" ");
   		var cmd = temp[0].substring(1)
   		var args = temp.slice(1)
		/*console.log("from "+from);
		console.log("to "+to);
		console.log("msg "+message);
		console.log("owner: "+owner);
		console.log("==============================");*/
		function cmdHandler(params, cmdFunc){
			var a = (params.a === undefined) ? "default value" : params.a /* If undefined, set default value */,
			var b = (params.b === undefined) ? "default value" : params.b /* If undefined, set default value */,
			switch(location){
				case "pm":
					if (authRequired && from == owner){
						cmdFunc(from);	
					} else (authRequired && from !== owner){
						bot.say(from, "You can't do that!");
					} else {
						cmdFunc(from);	
					}
					break;
				case "channel":
					if (authRequired && from == owner){
						cmdFunc(to);	
					} else (authRequired && from !== owner){
						bot.say(to, "You can't do that"+from+"!");
					} else {
						cmdFunc(to);
					}
					break;
				case "all":
					if (authRequired && from == owner){
						cmdFunc(from);	
					} else (authRequired && from !== owner){
						bot.say(from, "You can't do that!");
					} else {
						cmdFunc(from);
					}
					break;
				default:
					break;
			}
		}
		switch (cmd){
			case "testCmd":
				cmdHandler({where:"all", authRequired:true}, function(loc){
					bot.say(loc, "Hello!");
				});
				break;	
			default: 
				break;
		}
		if (pm == true){
			switch (cmd){
				case "setpass":
					var hash = bcrypt.hashSync(args[0]);
					if (!fs.existsSync("passhash") && !owner){
						fs.writeFile("passhash", hash, function(err) {
							if(err) {
								console.log(err);
							} else {
								bot.say(to, colours["light_green"]+"The file was saved successfully");
							}
						});
					} else if(from == owner){
						fs.writeFile("passhash", hash, function(err) {
							if(err) {
								console.log(err);
							} else {
								bot.say(to, colours["light_green"]+"The file was saved successfully");
							}
						});
					} else {
						bot.say(to, colours["light_red"]+"Pass is already set");
					}
					break;
				case "auth":
					if (fs.existsSync("passhash") && args[0] && !owner){
						fs.readFile('passhash', "utf-8", function (err, data) {
							if (err){ throw err; }
							var pass = args[0];
							if (bcrypt.compareSync(pass, data)){
								bot.say(to, colours["light_green"]+"Password Valid - User "+from+" is now the authenticated operator");
								owner = from;
							} else {
								bot.say(to, colours["light_red"]+"Password Invalid");
							}
						});
					} else if (from == owner){
						bot.say(to, colours["light_red"]+"You are already the owner!");
					} else if (owner){
						bot.say(to, colours["light_red"]+"An owner has already been set");
					} else if (!fs.existsSync("passhash")){
						bot.say(to, colours["light_red"]+"Pass isn't set");
					} else {
						bot.say(to, colours["light_red"]+"You must provide the password");
					}
					break;
				default:
					break;
			}
		} else {
			switch (cmd){
				case "hi":
					bot.say(to, colours["cyan"]+"Hello "+from+"!");
					break;
				case "leave":
					if (args.length == 0){ args[0] = to; }
					for (var i=0; i<args.length; i++){
						var channel = args[i]
						if (channel[0] !== "#"){
							channel = "#" + channel
						}
						try{
							bot.part(channel)
						} catch (e){
							console.log(e)
						}
					}
					break;
				case "join":
					if (args.length > 0){
						for (var i=0; i<args.length; i++){
							var channel = args[i]
							if (channel[0] !== "#"){
								channel = "#" + channel
							}
							try{
								bot.join(channel)
							} catch (e){
								console.log(e)
							}
						}
					} else {
						bot.say(to, colours["dark_red"]+"You must provide a channel to join");	
					}
					break;
				case "exec":
					if (owner == from && args.length > 0){
						var output = ""
						var str = args.join(' ');
						console.log(str);
						exec(str, function(error, stdout, stderr){
							output = JSON.stringify(stdout);//stdout.replace('\n', '\\n');
							output = output.substring(1, output.length-1);
							output = output.split('\\n');
							bot.say(to, colours["orange"]+"PMing the output to "+from);
							if (output.length > 50){
								bot.say(to, colours["dark_red"]+"No can do - Output is more than 50 lines long");							
							} else {
								for (var i=0; i<output.length-1; i++){
									bot.say(from, colours["light_gray"]+output[i]);
								}
							}
						});
					} else if(owner == from && args.length == 0){
						bot.say(to, colours["dark_red"]+"You must provide a command");
					} else {
						bot.say(to, colours["light_red"]+"You must be owner to do that");
					}
					break;
				//case "xkcd":
				//	if (owner == from){
				//		for (var i=1; i<1329; i++){
				//			bot.say(to, "https://xkcd.com/"+i+"/");
				//		}
				//	}
				//	break;
				default:
					break;
			}
		}
	}
});
// Uncomment this to keep errors from crashing the bot
//bot.addListener('error', function(message) {
//    console.log('error: ', message);
//});