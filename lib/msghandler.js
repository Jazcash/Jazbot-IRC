"use strict";
function MsgHandler(api, client, config, sessiondata){
	this.style = require('./styles');	
	this.api = api;
	this.client = client;
	this.config = config;
	this.sessiondata = sessiondata;
	
	var cmds = {};
	require('fs').readdirSync(__dirname + '/' + "cmds").forEach(function(file) { // for every file in the 'cmds/' directory
		if (file.match(/.+\.js/g) !== null) { // if file is a .js file
			var cmd = require(__dirname + '/cmds/' + file); // require it
			for (var key in cmd){ // extract all the commands in the file
				cmds[key] = cmd[key];	// store it in cmds for later use
			}
		}
	});
	
	this.cmds = cmds;
}

function col(str){
	var finalstr = str;
	var colourcodes = str.match(/\^[0-9]{1}[0-5]?,[0-9]{1}[0-5]?|\^((20|1([0-9]?)|[0-9])|[0-9])/g);
	for (var i in colourcodes){
		var num = colourcodes[i].slice(1).split(",");
		if (num.length == 1){ // if not background colour
			if (num[0] > 15){
				switch(num[0]){
					case "16":
						finalstr = finalstr.replace(colourcodes[i], "\x02");
						break;
					case "17":
						finalstr = finalstr.replace(colourcodes[i], "\x09");
						break;
					case "18":
						finalstr = finalstr.replace(colourcodes[i], "\x13");
						break;
					case "19": 
						finalstr = finalstr.replace(colourcodes[i], "\x15");
						break;
					case "20": 
						finalstr = finalstr.replace(colourcodes[i], "\x0f");
						break;
					default: break;
				}
			} else {
				finalstr = finalstr.replace(colourcodes[i], "\x03"+num[0]);
			}
		} else { // if background colour
			var background = num[1];
			var foreground = num[2];
			finalstr = finalstr.replace(colourcodes[i], "\x03"+num[0]+","+num[1]);
		}
	}
	return finalstr;
}

MsgHandler.prototype.handle = function(msg){
	var target =  (msg.isPm) ? msg.username : msg.target; // who to direct the response to
	if (msg.isCmd){
		var args = msg.message.split(" "); // !trigger arg0 arg1 arg2 ...
		var cmdtrigger = args.shift();
		if (cmdtrigger in this.cmds){ // if cmd exists
			var cmd = this.cmds[cmdtrigger]; // the cmd itself
			if ((cmd.authrequired && msg.hasAuth) ||!cmd.authrequired){ // if user has auth to use the cmd
				if ((cmd.where == "anywhere") || (cmd.where == "pm" && msg.isPm) || (cmd.where == "channel" && !msg.isPm)){ // if cmd is in right place
					if (args.length >= cmd.requiredargs){ // if the correct number of arguments are supplied
						
						try { // all requirements are validated, attempt to execute command
							cmd.func(this.api, this.client, this.config, this.sessiondata, target, msg, args); // call cmd function
						} catch (err){
							if ("stack" in err){ // if uncaught error
								this.client.irc.privmsg(target, "^2There was an uncaught error, please see the console");
								console.log(err.stack);
							} else { // if custom error thrown from cmd
								//console.log(err.name);
								this.client.irc.privmsg(target, err.message);			
							}
						}
						
					} else {
						this.client.irc.privmsg(target, "^4That command requires "+cmd.requiredargs+" arguments. ("+args.length+" provided)");
					}
				} else if (cmd.where == "pm" && !msg.isPm){
					this.client.irc.privmsg(target, "^4That command can only be messaged to me privately");
				} else if (cmd.where == "channel" && msg.isPm){
					this.client.irc.privmsg(target, "^4That command can only be used in a channel");
				} else {
					this.client.irc.privmsg(target, "^4Unknown error with that command");
				}
			} else {
				this.client.irc.privmsg(target, "^4You require authorisation to use that command");
			}
		} else if (cmdtrigger == "!help"){
			if (args.length > 0){ // specific help	
				if (args[0][0] == "!"){
					var cmdname = args[0].slice(1, args[0].length);	
				} else {
					var cmdname = args[0];	
				}
				if ("!"+cmdname in this.cmds){ // show help
					this.client.irc.privmsg(target, "^3"+this.cmds["!"+cmdname].synopsis+" "+"^10"+this.cmds["!"+cmdname].detail);
				} else { // cmd doesn't exist
					this.client.irc.privmsg(target, "^4The command \'"+cmdname+"\' doesn't exist");
				}
			} else { // list all cmds	
				for (var cmd in this.cmds){
					this.client.irc.privmsg(msg.username, "^3"+cmd+" - "+"^10"+this.cmds[cmd].detail);
				}
			}
		}
	}
}

module.exports = MsgHandler;