"use strict";
var fs = require('fs');
var JSONFile = require('json-tu-file');

module.exports = {
	"!setpass": {
		"authrequired":false,
		"where":"pm",
		"requiredargs":1,
		"detail":"If no password exists OR user has auth, set password and store it",
		"synopsis":"!setpass <password>",
		"func":function(api, client, config, sessiondata, target, msg, args){
			var pass = args[0];
			
			// (if there is no current owner OR user is the owner) AND there is no password set
			if ((sessiondata.owner == null && config.authpass == null) || msg.username == sessiondata.owner){ 
				config.authpass = pass; // Get the set password from the config
				JSONFile.writeFileSync(config, "config.json"); // save the password to config file
				client.irc.privmsg(target, "^9Password set successfully");
			} else if(config.authpass != null){ // if password is already set
				return "^4Password is already set";
			}
		}
	},
	"!auth": {
		"authrequired":false,
		"where":"pm",
		"requiredargs":1,
		"detail":"Authenticates you as the owner if the password is correct",
		"synopsis":"!auth <password>",
		"func":function(api, client, config, sessiondata, target, msg, args){
			var pass = args._[0];
			
			if (config.authpass == null) return "^4Password is not set"; // if no password set
			if (msg.username == sessiondata.owner) return "^4You are already the owner"; // if the user is already auth'd
			if (sessiondata.owner != null) return "^4An owner has already been set"; // if a user is already auth'd
			
			if (pass != config.authpass) return "^4Password Invalid"; // if password doesn't match
			
			client.irc.privmsg(target, "^9Password Valid - You are now the authenticated operator");
			sessiondata.owner = msg.username; // set user as owner for this session
		}
	}
};