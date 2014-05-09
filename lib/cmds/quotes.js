"use strict";
var JSONFile = require('json-tu-file');

module.exports = {
	"!quotes":
	{
		"authrequired":false,
		"where":"anywhere",
		"detail":"Turn quotes on or off",
		"func":function(api, client, config, sessiondata, target, msg, args){
			if (config.quotes == undefined){
				config.quotes = true;
			} else {
				config.quotes = !config.quotes;
			}
			JSONFile.writeFileSync(config, "config.json");

			var status = (config.quotes) ? "^9enabled" : "^4disabled";
			client.irc.privmsg(target, "^12Quoting "+status);
		}
	}
};