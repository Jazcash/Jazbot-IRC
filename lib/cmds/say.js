"use strict";
module.exports = {
	"!say":
	{
		"authrequired":false,
		"where":"anywhere",
		"requiredargs":1,
		"detail":"Make Jazbot say something",
		"synopsis":"!say [#channel - default=this] <message>",
		"func":function(api, client, config, sessiondata, target, msg, args){
			var channel = (args[0][0] == "#") ? args[0] : target;
			var saymsg = (args[0][0] == "#") ? args.slice(1, args.length).join(" ") : args.join(" ");
			
			client.irc.privmsg(channel, saymsg+" ");
		}
	}
};