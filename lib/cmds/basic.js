"use strict";
module.exports = {
	"!join": {
		"authrequired":false,
		"where":"anywhere",
		"requiredargs":1,
		"detail":"Joins the channel specified",
		"synopsis":"!join <['#']channel>",
		"func":function(api, client, config, sessiondata, target, msg, args){
			client.irc.join(args._[0]);
		}
	},
	"!leave": {
		"authrequired":false,
		"where":"anywhere",
		"requiredargs":0,
		"detail":"Leaves the channel command is issued in, or the channel specified",
		"synopsis":"!leave [['#']channel]",
		"func":function(api, client, config, sessiondata, target, msg, args){
			if (msg.isPm && args._.length == 0) return "^4You must provide a channel to leave";
			
			var chan = (args._.length > 0) ? args._[0] : msg.target;	
			client.irc.part(chan, "Leaving this channel");
		}
	},
	"!quit": {
		"authrequired":false,
		"where":"anywhere",
		"requiredargs":0,
		"detail":"Quits the server. Will state a quit message if provided",
		"synopsis":"!quit [message]",
		"func":function(api, client, config, sessiondata, target, msg, args){
			var str = (args._.length > 0) ? args._[0] : msg.nickname+" called !quit";
			client.irc.disconnect(str);
			console.log(str);
			process.exit();
		}
	}
};