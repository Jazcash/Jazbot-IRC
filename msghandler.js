function MsgHandler(api, client){
	this.style = require('./styles');
	this.api = api;
	this.client = client;
	
	var cmds = {};
	require('fs').readdirSync(__dirname + '/' + "cmds").forEach(function(file) { // for every file in the 'cmds/' directory
		if (file.match(/.+\.js/g) !== null) { // if file is a .js file
			var cmd = require(__dirname + '/cmds/' + file); // require it
			for (var key in cmd){
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
			if ((cmd.authrequired && msg.auth) ||!cmd.authrequired){ // if user has auth to use the cmd
				if ((cmd.where == "anywhere") || (cmd.where == "pm" && msg.isPm) || (cmd.where == "channel" && !msg.isPm)){ // if cmd is in right place
					if (args.length >= cmd.requiredargs){ // if the correct number of arguments are supplier
						
						// all requirements are validated, execute command
						try {
							var cmdstatus = cmd.func(this.api, this.client, this.style, target, msg, args);
						} catch (err){
							if ("stack" in err){ // if uncaught error
								this.client.irc.privmsg(target, this.style.lightred+"There was an uncaught error, please see the console");
								console.log(err.stack);
							} else { // if custom error thrown from cmd
								console.log(err.name);
								this.client.irc.privmsg(target, this.style.lightred+err.message);			
							}
						}
						
					} else {
						this.client.irc.privmsg(target, this.style.lightred+"That command requires "+cmd.requiredargs+" arguments. ("+args.length+" provided)");
					}
				} else if (cmd.where == "pm" && !msg.isPm){
					this.client.irc.privmsg(target, this.style.lightred+"That command can only be messaged to me privately");
				} else if (cmd.where == "channel" && msg.isPm){
					this.client.irc.privmsg(target, this.style.lightred+"That command can only be used in a channel");
				} else {
					this.client.irc.privmsg(target, this.style.lightred+"Unknown error with that command");
				}
			} else {
				this.client.irc.privmsg(target, this.style.lightred+"You require authorisation to use that command");
			}
		}
	}
}

module.exports = MsgHandler;