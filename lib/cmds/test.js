"use strict";

module.exports = {
	"!test":
	{
		"authrequired":false,
		"where":"anywhere",
		"requiredargs":0,
		"detail":"Is used for testing and debugging",
		"synopsis":"!test",
		"func":function(api, client, config, sessiondata, target, msg, args){
			client.irc.privmsg("yo");
		}
	}
};