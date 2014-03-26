"use strict";
var JSONFile = require('json-tu-file');
var validator = require('validator');

module.exports = {
	"!ignore":
	{
		"authrequired":true,
		"where":"anywhere",
		"requiredargs":1,
		"detail":"Make Jazbot ignore a specific user",
		"synopsis":"!ignore <nickname>",
		"func":function(api, client, config, sessiondata, style, target, msg, args){
			var nickname = args[0];
			api.hookEvent('*', 'whois', function(whoisdata) {
				if (whoisdata != false){ // if whois was successful
					var username = whoisdata.username; // get username of target
					if (!validator.isIn(username, config.ignore)){ // if user isn't already being ignored
						config.ignore.push(whoisdata.username); // add them to the ignore list
						client.irc.privmsg(target, "^9"+"Ignoring "+nickname);
						JSONFile.writeFileSync(config, "config.json"); // save config
					} else {
						client.irc.privmsg(target, "^4"+nickname+" is already being ignored");
					}
				} else {
					client.irc.privmsg(target, "^4"+"User with nickname "+nickname+" could not be found");	
				}
				api.unhookEvent('*', 'whois'); // unhook whois listener to prevent future conflicts
			});
			client.irc.raw("WHOIS", nickname); // emit a whois
		}
	},
	"!unignore":
	{
		"authrequired":true,
		"where":"anywhere",
		"requiredargs":1,
		"detail":"Make Jazbot unignore a specific user",
		"synopsis":"!unignore <nickname>",
		"func":function(api, client, config, sessiondata, style, target, msg, args){
			var nickname = args[0];
			api.hookEvent('*', 'whois', function(whoisdata) {
				if (whoisdata != false){ // if whois was successful
					var username = whoisdata.username; // get username of target
					if (validator.isIn(username, config.ignore)){ // if user is being ignored
						config.ignore.pop(whoisdata.username); // remove them from the ignore list
						client.irc.privmsg(target, "^9"+nickname+" is not longer being ignored");
						JSONFile.writeFileSync(config, "config.json"); // save config
					} else {
						client.irc.privmsg(target, "^4"+nickname+" is already not being ignored");
					}
				} else {
					client.irc.privmsg(target, "^4User with nickname "+nickname+" could not be found");	
				}
				api.unhookEvent('*', 'whois'); // unhook whois listener to prevent future conflicts
			});
			client.irc.raw("WHOIS", nickname);
		}
	},
	"!ignorelist":
	{
		"authrequired":false,
		"where":"anywhere",
		"requiredargs":0,
		"detail":"Lists all currently ignored users",
		"synopsis":"!ignorelist",
		"func":function(api, client, config, sessiondata, target, msg, args){
			client.irc.privmsg(target, "^2Currently ignored users: "+style.blue+config.ignore.join(", "));
		}
	},
	"!clearignores":
	{
		"authrequired":true,
		"where":"anywhere",
		"requiredargs":0,
		"detail":"Clears all ignored users",
		"synopsis":"!clearignores",
		"func":function(api, client, config, sessiondata, style, target, msg, args){
			client.irc.privmsg(target, "^9All ignored users cleared");
		}
	}
};