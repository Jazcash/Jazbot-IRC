"use strict";
module.exports = {
	"!join": {
		"authrequired":true,
		"where":"anywhere",
		"detail":"Joins the channel specified",
		"args": [
			{
				"names"		:["chan"],
				"action"	:"store",
				"help"		:"Channel",
				"metavar" :"#Channel"
			}
		],
		"func":function(api, client, config, sessiondata, target, msg, args){
			client.irc.join(args.chan);
		}
	},
	"!leave": {
		"authrequired":true,
		"where":"anywhere",
		"detail":"Leaves the channel command is issued in, or the channel specified",
		"args": [
			{
				"names"		:["chan"],
				"action"	:"store",
				"help"		:"Channel",
				"nargs"		:"?",
				"metavar" :"#Channel"
			}
		],
		"func":function(api, client, config, sessiondata, target, msg, args){
			if (msg.isPm && args.chan == null) return "^4You must provide a channel to leave";
			
			var chan = (args.chan != null) ? args.chan : msg.target;	
			client.irc.part(chan, "Leaving this channel");
		}
	},
	"!quit": {
		"authrequired":true,
		"where":"anywhere",
		"detail":"Quits the server. Will state a quit message if provided",
		"args": [
			{
				"names"		:["msg"],
				"action"	:"store",
				"help"		:"Quit Message",
				"nargs"		:"?",
				"metavar" :"Quit Message"
			}
		],
		"func":function(api, client, config, sessiondata, target, msg, args){
			var str = (args.msg != null) ? args.msg : msg.nickname+" called !quit";
			client.irc.disconnect(str);
			console.log(str);
			process.exit();
		}
	}
};