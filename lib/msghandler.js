"use strict";
function MsgHandler(api, client, config, sessiondata){
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
								this.client.irc.privmsg(target, "^4There was an uncaught error, please see the console");
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