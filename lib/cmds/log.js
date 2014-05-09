"use strict";
var JSONFile = require('json-tu-file');
		
module.exports = {
	"!logging":
	{
		"authrequired":true,
		"where":"anywhere",
		"detail":"Turn logging or or off",
		"func":function(api, client, config, sessiondata, target, msg, args){
			if (config.logging == undefined){
				config.logging = true;
			} else {
				config.logging = !config.logging;
			}
			JSONFile.writeFileSync(config, "config.json");

			var status = (config.logging) ? "^9enabled" : "^4disabled";
			client.irc.privmsg(target, "^12Logging "+status);
		}
	}
};