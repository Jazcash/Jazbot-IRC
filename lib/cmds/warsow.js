"use strict";
var requestsync = require('request-sync');
var cheerio = require('cheerio');
var tablify = require('tablify').tablify

module.exports = {
	"!wsw":
	{
		"authrequired":false,
		"where":"anywhere",
		"detail":"Provides useful functions for the game Warsow",
		"args": [
			{
				"names"		:["-n", "--numofservers"],
				"help"		:"Number of servers to list",
				"defaultValue": 5,
				"metavar" :"Number-of-servers-to-list"
			},
			{
				"names"		:["server"],
				"help"		:"IP:Port of a server",
				"metavar" :"IP:Port",
				"nargs"		:"?"
			}
		],
		"func":function(api, client, config, sessiondata, target, msg, args){
			console.log(args);
			if (args.server == null){
				var html = requestsync("http://www.warsow.net/wmm_servers");
				var $ = cheerio.load(html.body);
				var servers = [];
				servers.push({"listrank":"Rank","name":"Server Name","ipport":"IP and Port","ipportstr":"IP and Port","players":"Players",
											"playersstr":"Players","map":"Map","gametype":"Gametype","ica":"ICA" // Headers
				});
				var numtolist = (args.numofservers > 15) ? 15 : parseInt(args.numofservers);
				for (var i=1; i<numtolist+1; i++){
					var server = $('.tbl-row')[i];
					servers.push({
						"listrank":i,
						"name":$(server.children[0]).text().trim(),
						"ipport":$(server.children[1]).children()[0].attribs.href.split("//")[1].split(":"),
						"ipportstr":$(server.children[1]).children()[0].attribs.href.split("//")[1],
						"players":$(server.children[2]).text().trim().split(" / "),
						"playersstr":$(server.children[2]).text().trim().split(" / ").join("/"),
						"map":$(server.children[3]).text().trim(),
						"gametype":$(server.children[4]).text().trim(),
						"ica":(server.children[0].children[0].attribs.title == "Instagib") ? true : false
					});
				}
				
				var tablestr = tablify(servers, {show_index:false, has_header: false, keys:["name", "playersstr", "map", "gametype", "ipportstr"]}).split("\n");
				var alt = false
				client.irc.privmsg(target, tablestr[0]);
				client.irc.privmsg(target, "^16^2" + tablestr[1]);
				client.irc.privmsg(target, tablestr[0]);
				for (var i=2; i<tablestr.length-1; i++){
					client.irc.privmsg(target, ((alt) ? "^2" : "^12") + tablestr[i]);
					alt = !alt;
				}
				client.irc.privmsg(target, tablestr[0]);
			}
		}
	}
};