"use strict";
module.exports = {
	"!join": {
		"authrequired":false,
		"where":"anywhere",
		"requiredargs":1,
		"detail":"Joins the channel specified",
		"synopsis":"!join <channel>",
		"func":function(api, client, config, sessiondata, style, target, msg, args){
			client.irc.join(args[0]);
		}
	},
	"!leave": {
		"authrequired":false,
		"where":"anywhere",
		"requiredargs":0,
		"detail":"Leaves the channel command is issued in, or the channel specified",
		"synopsis":"!leave [channel]",
		"func":function(api, client, config, sessiondata, target, msg, args){
			if (msg.isPm && args.length == 0){
				throw {"name":"Argument required", "message":"^4You must provide a channel to leave"};
			} else{
				var chan = (args.length > 0) ? args[0] : msg.target;	
			}
			client.irc.part(chan, "Leaving this channel");
		}
	},
	"!quit": {
		"authrequired":false,
		"where":"anywhere",
		"requiredargs":0,
		"detail":"Quits the server. Will state a quit message if provided",
		"synopsis":"!quit [message]",
		"func":function(api, client, config, sessiondata, style, target, msg, args){
			var str = (args.length > 0) ? args[0] : msg.nickname+" called !quit";
			client.irc.disconnect(str);
			process.exit();
		}
	}
};