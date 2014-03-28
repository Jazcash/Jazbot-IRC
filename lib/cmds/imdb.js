"use strict";
var requestsync = require('request-sync');
var validator = require('validator');

module.exports = {
	"!imdb": {
		"authrequired":false,
		"where":"anywhere",
		"requiredargs":1,
		"detail":"Gets IMDB information on a movie or show. Results are more accurate if you specify a year",
		"synopsis":"!imdb <title> [year]",
		"func":function(api, client, config, sessiondata, target, msg, args){
			if (args[args.length-1].match(/^\d{4}$/)){
				var yearQuery = args[args.length-1];
				var searchTerm = args.slice(0, args.length-1).join(" ");	
			} else {
				var searchTerm = args.join(" ");
			}
			
			var url = (yearQuery === undefined) ?  "http://deanclatworthy.com/imdb/?yg=0&q="+searchTerm : "http://deanclatworthy.com/imdb/?yg=0&year="+yearQuery+"&q="+searchTerm;
			console.log(url);
			var response = requestsync(url);
			var item = JSON.parse(response.body);
			response = requestsync("http://www.omdbapi.com/?i="+item.imdbid);
			item = JSON.parse(response.body);
			
			var title = 	("Title" in item) ? 			"^2 "+item.Title+" " 					: "";
			if (title == "") throw {message:"^4No results for '"+searchTerm+"'"}
			
			var year = 		("Year" in item) ? 				"^12 "+"("+item.Year+") " 			: "";
			var rating = 	("imdbRating" in item) ? 	"^10 "+item.imdbRating+"/10 " 	: "";
			var genre = 	("Genre" in item) ? 			"^6 "+item.Genre+": " 					: "";
			var plot = 		("Plot" in item) ? 				"^15 "+item.Plot 							: "";
			
			client.irc.privmsg(target, title+year+rating+genre+plot);
		}
	}
}