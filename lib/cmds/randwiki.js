"use strict";
var requestsync = require('request-sync');

module.exports = {
	"!randwiki":
	{
		"authrequired":false,
		"where":"anywhere",
		"requiredargs":0,
		"detail":"Returns a random Wikipedia article",
		"synopsis":"!randwiki",
		"func":function(api, client, config, sessiondata, style, target, msg, args){
			var response = requestsync("http://en.wikipedia.org/w/api.php?action=query&list=random&rnlimit=1&rnnamespace=0&format=json");
			var data = JSON.parse(response.body);
			
			var title = data.query.random[0].title;
			var pageId = data.query.random[0].id;
			
			response = requestsync("http://en.wikipedia.org/w/api.php?action=query&prop=info&pageids="+pageId+"&inprop=url&format=json");
			data = JSON.parse(response.body);
			
			var pageUrl = data.query.pages[pageId].fullurl;
			
			client.irc.privmsg(target, style.darkblue+title+" - "+pageUrl);
		}
	}
};