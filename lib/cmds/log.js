"use strict";
module.exports = {
	"!log":
	{
		"authrequired":false,
		"where":"anywhere",
		"detail":"Turn logging or or off",
		"func":function(api, client, config, sessiondata, target, msg, args){
			sessiondata.log = !sessiondata.log;
			var status = (sessiondata.log) ? "^9enabled" : "^4disabled";
			client.irc.privmsg(target, "^12Logging "+status);
		}
	}
};