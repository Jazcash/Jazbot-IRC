"use strict";  // strict mode for development

// Built-in imports
var fs = require('fs');
// Third-party imports
var factory = require('irc-factory');
var JSONFile = require('json-tu-file');
var validator = require('validator');
var ArgumentParser = require('argparse').ArgumentParser;
var argv = []; // cli args
// My imports
var MsgHandler = require('./msghandler');

try { // parse config.json
	var config = JSONFile.readFileSync("config.json"); // store config.json file into config as a dictionary
	if (config == null) throw {"code":"JSONERR"} // if there is an error in the config.json file
} catch (err){
	switch (err.code){
		case "ENOENT": // if the config.json could not be found
			console.log("config.json file not found");
			break;
		case "JSONERR":
			console.log("config.json couldn't be parsed as JSON (Try running it through a JSON validator)");
			break;
		default:
			console.log(err);
	}
	process.exit(); // End jazbot.js
}

var sessiondata = {"owner":null}; // global variables for the current irc session stored in here
if ("authpass" in argv) config.authpass = argv.authpass; // override config.authpass with cli authpass arg
var port = ("server" in argv && argv.server.split(":")[1] !== undefined) ? argv.server.split(":")[1] : config.port; // if port specified in cli args
if (port === undefined) port = 6667; // default port is 6667

var api = new factory.Api(); // new jazbot api
var client = api.createClient('jazbot', { // one client, with unique id 'jazbot'
	nick : ("nick" in argv) ? argv.nick : config.botnick, // override config.botnick with cli nick arg
	user : ("user" in argv) ? argv.user : config.botuser, // override config.botuser with cli user arg
	server : ("server" in argv) ? argv.server.split(":")[0] : config.server, // override config.server with cli server arg
	realname: ("bio" in argv) ? argv.bio : config.realname, // override config.realname with cli bio arg
	port: port
});

var msghandler = new MsgHandler(api, client, config, sessiondata); // setup a MsgHandler for this bot

api.hookEvent('*', 'registered', function(msg) { // when bot is registered and successfully logged into irc server
	sessiondata.mynick = msg.nickname; // store actual botnick
	sessiondata.serverinfo = msg.capabilities; // store server options
	
	var channels = ("channels" in argv) ? argv.channels.split(",") : config.channels; // override config.channels with cli channels arg
	for (var i in channels){ // Join all initial channels
		var channel = channels[i].split(" ");
		(channel.length < 2) ? client.irc.join(channel[0]) : client.irc.join(channel[0], channel[1]);	
	}
});

api.hookEvent('*', 'privmsg', function(msg) { // for every irc message jazbot sees
	// message contains nickname, username, hostname, target, message, time and raw
	console.log(msg.target+" "+"<"+msg.nickname+"> "+msg.message); // log message to console
	
	msg.ignored = (validator.isIn(msg.username, config.ignore)) // is message sender on ignore list
	msg.isPm = (msg.target == sessiondata.mynick) // is message a private message
	msg.isCmd = (msg.message[0] == "!") // is message a command
	msg.hasAuth = (msg.username == sessiondata.owner) // is message from owner
	
	try {
		var target = (msg.isPm) ? msg.username : msg.target; // where to send message back to
		if (!msg.ignored || msg.hasAuth) var response = msghandler.handle(msg, target); // if message isn't ignored, send it off to the message handler
		if (response !== undefined) client.irc.privmsg(target, response); // if there was a response from the message handler then print it in irc
	} catch (err){
		console.log(err.stack); // if anything goes wrong with the message handling, log the stack trace in the console
	}
});

process.on('SIGINT', function() { // Generally used to terminate bot gracefully when ctrl+c is pressed
	client.irc.disconnect("Shutdown by owner");
  console.log("\nGracefully shutting down from signal interupt" );
  process.exit();
});