"use strict";
var requestsync = require('request-sync');

module.exports = {
	"!reddit":
	{
		"authrequired":false,
		"where":"anywhere",
		"requiredargs":0,
		"detail":"Get a random reddit thread",
		"synopsis":"!reddit",
		"func":function(api, client, config, sessiondata, target, msg, args){
			var randomSubreddit = requestsync("http://www.reddit.com/r/random").headers.location.split("/");
			randomSubreddit = randomSubreddit[randomSubreddit.length-2];
			
			var rand = requestsync("http://www.reddit.com/r/"+randomSubreddit+".json?limit=1");
			var item = JSON.parse(rand.body).data.children[0].data;
			
			client.irc.privmsg(target, "^2/r/"+randomSubreddit+"/"+" - "+"^12"+item.title+" - "+item.url);
		}
	}
};