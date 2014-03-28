"use strict";
var requestsync = require('request-sync');
var validator = require('validator');

module.exports = {
	"!imdb": {
		"authrequired":false,
		"where":"anywhere",
		"requiredargs":1,
		"detail":"Queries IMDb for a title specified - Use quotes if your search title ends in a number",
		"synopsis":"!imdb <title> [result number]",
		"func":function(api, client, config, sessiondata, target, msg, args){
			if (validator.contains(str, "\"")){
				var str = args.join(" ");
				var startPos = str.indexOf('\"') + 1;
				var endPos = str.indexOf('\"', startPos);
				var searchTerm = str.substring(startPos+1, endPos);
				var resultNum = str.substring(endPos+2, str.length);
			} else {
				if (validator.isNumeric(args[args.length-1])){
					var searchTerm = args.slice(0, args.length-1).join(" ");
					var resultNum = args[args.length-1];
				} else {
					var searchTerm = args.join(" ");
					var resultNum = 1;
				}
			}
			
      var response = requestsync('http://www.omdbapi.com/?s='+searchTerm);
			console.log(response);
      response = JSON.parse(response.body);
			var searchResults = response.Search;
			
			var singleresponse = requestsync("http://www.omdbapi.com/?i="+searchResults[resultNum].imdbID);
			var singleresponsebody = JSON.parse(singleresponse.body);
			
			//if (searchResults === undefined) throw {"name":"NODEFS", "message":"^4There are no definitions for \'"+searchTerm+"\'"};
			//if (resultNum <= 0) throw {"name":"NODEFS", "message":"^4Result number must be greater than 0"};
			//if (resultNum > searchResults.length) throw {"name":"NODEFS", "message":"^4There are only "+searchResults.length+" results"};
			
			//console.log(searchResults);
		}
	}
}