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
		"args": [
			{
				"names"		:["-i", "--interval"],
				"action"	:"store",
				"type"		:"int",
				"help"		:"Poll the rss feed for updates every x minutes",
				"defaultValue":1
			},{
				"names"		:["name"],
				"action"	:"store",
				"help"		:"Name/ID to give to this listener"
			},{
				"names"		:["rss"],
				"action"	:"store",
				"help"		:"The RSS URI, must be an XML doc"
			}
		],
		"func":function(api, client, config, sessiondata, target, msg, args){
			
		}
	}
};