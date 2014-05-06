"use strict";

module.exports = {
	"!test":
	{
		"authrequired":false,
		"where":"anywhere",
		"detail":"Is used for testing and debugging",
		"func":function(api, client, config, sessiondata, target, msg, args){
			client.irc.privmsg("yo");
		}
	}
};