// Built-in imports
var sys = require('sys');
var exec = require('child_process').exec;
var fs = require('fs');
// Third-party imports
var factory = require('irc-factory');
var bcrypt = require('bcrypt-nodejs');
var LastFmNode = require('lastfm').LastFmNode;
var requestsync = require('request-sync');
var request = require('request');
var cheerio = require('cheerio');
var parseString = require('xml2js').parseString;
var JSONFile = require('json-tu-file');
var Twit = require('twit');
var validator = require('validator');
// My imports
var MsgHandler = require('./msghandler');

if (fs.existsSync("config.json")){
	var config = JSONFile.readFileSync("config.json");
} else {
	console.log("No config.json file found");
	process.exit();
}

var api = new factory.Api();
var client = api.createClient('jazbot', {
	nick : config.botnick,
	user : config.botuser,
	server : config.server,
	realname: config.realname,
	port: config.port,
	secure: false
});

var msghandler = new MsgHandler(api, client);

api.hookEvent('*', 'registered', function(msg) {
	client.irc.join("#ectest5", "jaztest");
});

api.hookEvent('*', 'privmsg', function(msg) { // message contains nickname, username, hostname, target, message, time and raw
	console.log("<"+msg.nickname+"> "+msg.message); // Prints every chat message to console
	
	msg["isPm"] = (msg.target == config.botnick) ? true : false;
	msg["isCmd"] = (msg.message[0] == "!") ? true : false;
	msg["hasAuth"] = (msg.username == "Jazcash") ? true : false;
	
	msghandler.handle(msg);
});