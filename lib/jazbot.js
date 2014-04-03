"use strict";
// Built-in imports
var fs = require('fs');
// Third-party imports
var factory = require('irc-factory');
var JSONFile = require('json-tu-file');
var validator = require('validator');
// My imports
var MsgHandler = require('./msghandler');

try { // parse config.json
	var config = JSONFile.readFileSync("config.json");
	if (config == null) throw {"code":"JSONERR"}
	var sessiondata = {"owner":null}; // {"owner":"~Jazcash"}; // global variables for the current irc session stored here
} catch (err){
	switch (err.code){
		case "ENOENT":
			console.log("config.json file not found");
			break;
		case "JSONERR":
			console.log("config.json couldn't be parsed as JSON (Try running it through a JSON validator)");
			break;
		default:
			console.log(err);
	}
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
	console.log("<"+msg.nickname+"> "+msg.message); // Prints every chat message that isn't ignored to console
	
	msg.ignored = (validator.isIn(msg.username, config.ignore))
	msg.isPm = (msg.target == config.botnick)
	msg.isCmd = (msg.message[0] == "!")
	msg.hasAuth = (msg.username == sessiondata.owner)
	
	try {
		if (!msg.ignored || msg.hasAuth) msghandler.handle(msg);
	} catch (err){
		console.log(err);
	}
});

process.on('SIGINT', function() {
	client.irc.disconnect("Shutdown by owner");
  console.log("\nGracefully shutting down from signal interupt" );
  process.exit();
});