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
		"func":function(api, client, config, sessiondata, target, msg, args){
			var searchTerm = args;
			var resultNum = (validator.isNumeric(searchTerm[searchTerm.length-1]) && args.length > 1) ? searchTerm.pop() : 1;
			searchTerm = searchTerm.join(" ");
			
      var response = requestsync('http://api.urbandictionary.com/v0/define?term='+searchTerm);
      response = JSON.parse(response.body);
			
			var synonyms = response.tags;
			
			var defs = response.list;
			defs.sort(function(a, b) {
				return a.thumbs_up < b.thumbs_up;
			});
			
			var def = defs[resultNum-1];
			
			if (defs.length <= 0) return "^4There are no definitions for \'"+searchTerm+"\'";
			if (resultNum <= 0) return "^4Result number must be greater than 0";
			if (resultNum > defs.length) return "^4There are not that many results";
			
			var resultNumsStr = (resultNum > 1) ? "" : "^6("+(defs.length)+" results) ";
			var resultNumStr = "^10"+resultNum+". ";
			var defStr = "^12"+def.definition;
			var exampleStr = ("example" in def) ? " ^15"+def.example : "";
			
			client.irc.privmsg(target, resultNumsStr+resultNumStr+defStr+exampleStr);
		}
	}
}