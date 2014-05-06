"use strict";
module.exports = {
	"!say":
	{
		"authrequired":true,
		"where":"anywhere",
		"detail":"Make Jazbot say something",
		"args": [
			{
				"names"		:["-t", "--target"],
				"action"	:"store",
				"help"		:"Recepient of message. Can be a user or channel.",
				"nargs"		:"?"
			},
			{
				"names"		:["msg"],
				"action"	:"store",
				"help"		:"Message to send"
			}
		],
		"func":function(api, client, config, sessiondata, target, msg, args){
			var atarget = (args.target == null) ? target : args.target;
			var saymsg = args.msg;
			client.irc.privmsg(atarget, saymsg+" ");
		}
	}
};