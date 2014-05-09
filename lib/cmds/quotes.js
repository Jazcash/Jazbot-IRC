"use strict";
var JSONFile = require('json-tu-file');

module.exports = {
	"!quoting":
	{
		"authrequired":true,
		"where":"anywhere",
		"detail":"Turn quotes on or off",
		"func":function(api, client, config, sessiondata, target, msg, args){
			if (config.quoting == undefined){
				config.quoting = true;
			} else {
				config.quoting = !config.quoting;
			}
			JSONFile.writeFileSync(config, "config.json");

			var status = (config.quoting) ? "^9enabled" : "^4disabled";
			client.irc.privmsg(target, "^12Quoting "+status);
		}
	}
};