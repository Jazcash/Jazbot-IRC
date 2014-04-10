"use strict";

// Built-in imports
var fs = require('fs');
// Third-party imports
var factory = require('irc-factory');
var JSONFile = require('json-tu-file');
var validator = require('validator');
var argv = require('minimist')(process.argv.slice(2));
// My imports
var MsgHandler = require('./msghandler');

try { // parse config.json
	var config = JSONFile.readFileSync("config.json");
	if (config == null) throw {"code":"JSONERR"}
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

var sessiondata = {"owner":null}; // global variables for the current irc session stored in here

//console.log(argv) // print cli options
var port = ("server" in argv && argv.server.split(":")[1] !== undefined) ? argv.server.split(":")[1] : config.port;
if (port === undefined) port = 6667;

var api = new factory.Api();
var client = api.createClient('jazbot', {
	nick : ("nick" in argv) ? argv.nick : config.botnick,
	user : ("user" in argv) ? argv.user : config.botuser,
	server : ("server" in argv) ? argv.server.split(":")[0] : config.server,
	realname: ("bio" in argv) ? argv.realname : config.realname,
	port: port
});

var msghandler = new MsgHandler(api, client, config, sessiondata);

api.hookEvent('*', 'registered', function(msg) {
	sessiondata.mynick = msg.nickname;
	sessiondata.serverinfo = msg.capabilities;
	
	var channels = ("channels" in argv) ? argv.channels.split(",") : config.channels;
	for (var i in channels){
		var channel = channels[i].split(" ");
		(channel.length < 2) ? client.irc.join(channel[0]) : client.irc.join(channel[0], channel[1]);	
	}
});

api.hookEvent('*', 'privmsg', function(msg) { // message contains nickname, username, hostname, target, message, time and raw
	console.log("<"+msg.nickname+"> "+msg.message);
	
	msg.ignored = (validator.isIn(msg.username, config.ignore))
	msg.isPm = (msg.target == sessiondata.mynick)
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