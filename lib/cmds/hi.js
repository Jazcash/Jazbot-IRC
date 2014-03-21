"use strict";
module.exports = {
	"!hi":
	{
		"authrequired":false,
		"where":"anywhere",
		"requiredargs":0,
		"detail":"Says Hi to the user triggering the command or to a string if specified",
		"synopsis":"!hi [string]",
		"func":function(api, client, style, target, msg, args){
			// api, client are not likely needed
			// style is for irc message formatting and colours
			// target is the destination for your messages, defaults to where command was issued
			// msg is the full msg object that was sent
			// args are the cmd arguments the user stated
			
			var str = (args.length > 0) ? args.join(" ") : msg.nickname;
			client.irc.privmsg(target, style.blue+"Hello "+str+"!");
			client.irc.privmsg(target, style.lightred+"How are you?");
			
			// throw {"name":"Nasty Error", "message":"There was a very nasty error"}; // tell msghandler there was an error
			return true; // tells the msghandler the cmd was executed successfully
		}
	}
};