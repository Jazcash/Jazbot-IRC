"use strict";
var requestsync = require('request-sync');
var validator = require('validator');

module.exports = {
	"!urbdef": {
		"authrequired":false,
		"where":"anywhere",
		"requiredargs":1,
		"detail":"Attempts to get an urban dictionary definition for a word",
		"synopsis":"!urbdef <word> [result number]",
		"func":function(api, client, config, sessiondata, style, target, msg, args){
			var searchTerm = args;
			var resultNum = (validator.isNumeric(searchTerm[searchTerm.length-1])) ? searchTerm.pop() : 1;
			searchTerm = searchTerm.join(" ");
			
      var response = requestsync('http://api.urbandictionary.com/v0/define?term='+searchTerm);
      response = JSON.parse(response.body);
			
			var synonyms = response.tags;
			
			var defs = response.list;
			defs.sort(function(a, b) {
				return a.thumbs_up < b.thumbs_up;
			});
			
			if (resultNum != 1 && defs.length > 0){
        if (resultNum > 0){
          if (resultNum-1 < defs.length){
            client.irc.privmsg(target, style.turquoise+" "+resultNum+". "+style.blue+defs[resultNum-1].definition+" - "+style.lightgrey+defs[resultNum-1].example);
          } else {
            client.irc.privmsg(target, style.lightred+"There are not that many results"); 
          }
        } else {
           client.irc.privmsg(target, style.lightred+"Result number must be greater than 0");
        }
			} else if(defs.length > 0){
				client.irc.privmsg(target, style.purple+"("+(defs.length)+" results)"+style.turquoise+" "+resultNum+". "+style.blue+defs[resultNum-1].definition+" - "+style.lightgrey+defs[resultNum-1].example);
			} else {
        client.irc.privmsg(target, style.lightred+"There are no definitions for "+searchTerm);
      }
		}
	}
}