"use strict";
var requestsync = require('request-sync');
var validator = require('validator');

module.exports = {
	"!urbdef": {
		"authrequired":false,
		"where":"anywhere",
		"detail":"Attempts to get an urban dictionary definition for a word",
		"args": [
			{
				"names"		:["-r", "--result"],
				"action"	:"store",
				"type"		:"int",
				"help"		:"Result number",
				"defaultValue":1,
				"metavar" :"Result-number"
			},{
				"names"		:["word"],
				"action"	:"store",
				"help"		:"Word or phrase",
				"metavar" :"Word"
			}
		],
		"func":function(api, client, config, sessiondata, target, msg, args){
			var searchTerm = args.word;
			var resultNum = args.result;
			
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
			var defin = def.definition.replace(/\n/g, " ").replace(/\r/g, "");
			var defStr = "^12"+defin;
			var exampleStr = ("example" in def) ? " ^14"+def.example.replace(/\n/g, " ").replace(/\r/g, "") : "";
			
			client.irc.privmsg(target, resultNumsStr+resultNumStr+defStr+exampleStr);
		}
	}
}