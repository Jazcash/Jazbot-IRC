"use strict";
var requestsync = require('request-sync');
var dateutils = require('date-utils');

module.exports = {
	"!imdb": {
		"authrequired":false,
		"where":"anywhere",
		"requiredargs":1,
		"detail":"Gets IMDB information on a movie or show. Results are more accurate if you specify a year",
		"synopsis":"!imdb <title> [year]",
		"func":function(api, client, config, sessiondata, target, msg, args){
			/* 	this cmd uses two apis because one doesn't provide
					enough info and the other has a crappy search system  
					
					ToDo: Use the no-limit API (OMDb) and then fallback
					to the other if there are no results
					*/
			
			if (args[args.length-1].match(/^\d{4}$/) && args.length > 1){
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
			var year 		= ("Year" in item && item.Year !== "N/A") 						? "^12 "+"("+item.Year+") " 			: "";
			var today = new Date();
			var releaseDate = ("Released" in item && item.Released !== "N/A") ? new Date(item.Released) : new Date();
			var released = (releaseDate > today) ? "^12 "+"("+releaseDate.toFormat("D MMM, YYYY")+") " : year;
			var rating 	= ("imdbRating" in item && item.imdbRating !== "N/A") ? "^10 "+item.imdbRating+"/10 " 	: "";
			var genre 	= ("Genre" in item && item.Genre !== "N/A") 					? "^6 "+item.Genre+": " 					: "";
			var plot 		= ("Plot" in item && item.Plot !== "N/A") 						? "^15 "+item.Plot 							: "";
			
			var release = new Date(item.Released);
			
			client.irc.privmsg(target, title+released+rating+genre+plot);
		}
	}
}