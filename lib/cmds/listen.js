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
				"defaultValue":1,
				"metavar" :"Poll-interval"
			},{
				"names"		:["name"],
				"action"	:"store",
				"help"		:"Name/ID to give to this listener",
				"metavar" :"Name/ID"
			},{
				"names"		:["rss"],
				"action"	:"store",
				"help"		:"The RSS URI, must be an XML doc",
				"metavar" :"RSS-URI"
			}
		],
		"func":function(api, client, config, sessiondata, target, msg, args){
			
		}
	}
};