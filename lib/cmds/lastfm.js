"use strict";
var requestsync = require('request-sync');

module.exports = {
	"!lastfm":
	{
		"authrequired":false,
		"where":"anywhere",
		"requiredargs":0,
		"detail":"Get information for a last.fm user's last listened to track",
		"synopsis":"!lastfm <last.fm username>",
		"func":function(api, client, config, sessiondata, target, msg, args){
			var user = args[0];
			
			var response = requestsync("http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user="+user+"&api_key="+config.lastfmapikey+"&format=json");
			var body = JSON.parse(response.body);
			if (!("recenttracks" in body)) return {"message":"^4That last.fm user could not be found"};
			if (!("track" in body.recenttracks)) return {"message":"^4There was a problem with that last.fm user"};
			var JSONtrack = body.recenttracks.track[0];
			
			var track = {
				"title":JSONtrack.name,
				"artist":JSONtrack.artist["#text"],
				"url":JSONtrack.url,
				"nowplaying":("@attr" in JSONtrack) ? JSONtrack["@attr"].nowplaying : false
			}
			
			try {
				response = requestsync("http://api.lyricsnmusic.com/songs?api_key="+config.lyricsnmusicapikey+"&artist="+track.artist+"&track="+track.title);
				var lyric = JSON.parse(response.body)[0].snippet.split("\r\n");
				
				lyric.pop();
				var lyricsstr = "";
				for (var i in lyric){
					var line = lyric[i].trim();
					if (line.length > 0){
						if (!line[line.length-1].match(/\!|\?/g)){
							line += ". ";
							lyricsstr += line;
						} else {
							line += " ";
							lyricsstr += line;	
						}
					}
				}
				track.lyric = lyricsstr.trim();
			} catch (err){
				track.lyric = undefined;	
			}
			
			var trackstr = "^2"+track.title+" - ^12"+track.artist
			var isListeningstr = (track.nowplaying) ? " is currently listening to " : " last listened to ";
			
			client.irc.privmsg(target, "^10"+user+isListeningstr+trackstr);
			if (track.lyric !== undefined && track.lyric.length > 5) client.irc.privmsg(target, "^6"+track.lyric);
		}
	}
};