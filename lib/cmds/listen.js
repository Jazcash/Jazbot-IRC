"use strict";
var requestsync = require('request-sync');

module.exports = {
	"!listen":
	{
		"authrequired":false,
		"where":"anywhere",
		"requiredargs":0,
		"detail":"Make me listen to an RSS or Atom feed for updates",
		"synopsis":"!listen <name> <rss xml> [interval - default=1min]",
		"func":function(api, client, config, sessiondata, target, msg, args){
			
		}
	}
};