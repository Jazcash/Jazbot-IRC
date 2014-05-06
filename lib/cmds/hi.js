"use strict";
module.exports = {
	"!hi":
	{
		"authrequired":false,
		"where":"anywhere",
		"detail":"Says Hi to the user triggering the command or to a string if specified",
		"args": [
			{
				"names"		:["msg"],
				"action"	:"store",
				"help"		:"Unrequired message",
				"nargs"		:"?"
			}
		],
		"func":function(api, client, config, sessiondata, target, msg, args){
			// api, client are not likely needed
			// config holds information stored in config.json or passed in as cli args at runtime
			// session data is used to store temporary data for the current session
			// target is the destination for your messages, defaults to wherever command was issued
			// msg is the full msg object that was sent
			// args are the cmd arguments from an irc command (!hi arg1 arg2)
			
			var str = (args.msg != null) ? args.msg : msg.nickname;
			client.irc.privmsg(target, "^6Hello "+str+"!");

			// return {"message":"There was a very nasty error"}; // tell msghandler there was an error
		}
	}
};