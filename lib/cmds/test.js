"use strict";

module.exports = {
	"!test":
	{
		"authrequired":false,
		"where":"anywhere",
		"detail":"Is used for testing and debugging",
		"subparsers":[
			{
				"title":"c1",
				"addHelp":true,
				"aliases":["co"],
				"args":[
					{
						"names": ["-f", "--foo"],
						"action": "store",
						"help": "foo3 bar3"
					}
				]
			},
			{
				"title":"c2",
				"addHelp":true,
				"args":[
					{
						"names": ["-b", "--bar"],
						"action": "store",
						"type": "int",
						"help": "foo3 bar3"
					}
				]
			}
		],
		"func":function(api, client, config, sessiondata, target, msg, args){
			client.irc.privmsg("yo");
		}
	}
};