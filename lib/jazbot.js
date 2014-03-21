"use strict";
// Built-in imports
var fs = require('fs');
// Third-party imports
var factory = require('irc-factory');
var JSONFile = require('json-tu-file');
var validator = require('validator');
// My imports
var MsgHandler = require('./msghandler');

if (fs.existsSync("config.json")){
	var config = JSONFile.readFileSync("config.json");
	var sessiondata = {"authpass":config.authpass, "owner":null};
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

var msghandler = new MsgHandler(api, client, config, sessiondata);

api.hookEvent('*', 'registered', function(msg) {
	for (var i in config.channels){
		var channel = config.channels[i].split(" ");
		(channel.length < 2) ? client.irc.join(channel[0]) : client.irc.join(channel[0], channel[1]);	
	}
});

api.hookEvent('*', 'privmsg', function(msg) { // message contains nickname, username, hostname, target, message, time and raw
	console.log("<"+msg.nickname+"> "+msg.message); // Prints every chat message to console
	
	msg.isPm = (msg.target == config.botnick) ? true : false;
	msg.isCmd = (msg.message[0] == "!") ? true : false;
	msg.hasAuth = (msg.username == sessiondata.owner) ? true : false;
	
	msghandler.handle(msg);
});

process.on('SIGINT', function() {
	client.irc.disconnect("Shutdown from CLI");
  console.log("\nGracefully shutting down from signal interupt" );
  process.exit();
});