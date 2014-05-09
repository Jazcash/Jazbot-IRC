"use strict";  // strict mode for development

// Built-in imports
var fs = require('fs');
// Third-party imports
var factory = require('irc-factory');
var JSONFile = require('json-tu-file');
var validator = require('validator');
var ArgumentParser = require('argparse').ArgumentParser;
// My imports
var CmdHandler = require('./cmdHandler');
var MsgHandler = require('./msgHandler');

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

var parser = new ArgumentParser({version: '0.0.1',addHelp:true});
parser.addArgument([ '-a', '--authpass' ],{"help": 'Password for owner authentication using !auth <pass>',"defaultValue":config.authpass});
parser.addArgument([ '-s', '--server' ],	{"help": 'Server bot should connect to',"defaultValue":config.server});
parser.addArgument([ '-p', '--port' ],		{"help": 'Port bot should connect to',"defaultValue":config.port});
parser.addArgument([ '-u', '--user' ],		{"help": 'Username bot should use',"defaultValue":config.botuser});
parser.addArgument([ '-n', '--nick' ],		{"help": 'Nickname bot should use',"defaultValue":config.botnick});
parser.addArgument([ '-b', '--bio' ],			{"help": 'Motto/Realname, shows up in userlists and whois queries',"defaultValue":config.bio});
parser.addArgument([ '-c', '--chans' ],		{"help": 'Channels bot should join on connecting to the server',"defaultValue":config.channels});
parser.addArgument([ '-o', '--owner' ],		{"help": 'Set an owner by nickname for this session, not advisable in case nick is stolen',"nargs":"?"});

var argv = parser.parseArgs();

var sessiondata = {
	owner: "~"+argv.owner,
	log: true // enabled message logging by default
}; // global variables for the current irc session stored in here

var api = new factory.Api(); // new jazbot api
var client = api.createClient('jazbot', { // one client, with unique id 'jazbot'
	nick : argv.nick, // override config.botnick with cli nick arg
	user : argv.user, // override config.botuser with cli user arg
	server : argv.server, // override config.server with cli server arg
	realname: argv.bio, // override config.realname with cli bio arg
	port: argv.port
});

var cmdHandler = new CmdHandler(api, client, config, sessiondata); // setup a MsgHandler for this bot
var msgHandler = new MsgHandler(api, client, config, sessiondata);

api.hookEvent('*', 'registered', function(msg) { // when bot is registered and successfully logged into irc server
	sessiondata.mynick = msg.nickname; // store actual botnick
	sessiondata.serverinfo = msg.capabilities; // store server options
	var channels = ("chans" in argv) ? argv.chans.split(",") : config.chans; // override config.channels with cli channels arg
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
		if ((!msg.ignored || msg.hasAuth) && msg.isCmd){
			var response = cmdHandler.handle(msg, target); // if message isn't ignored, send it off to the message handler
			if (response !== undefined) client.irc.privmsg(target, response); // if there was a response from the message handler then print it in irc
		} else {
			msgHandler.handle(msg, target);
		}		
	} catch (err){
		console.log(err.stack); // if anything goes wrong with the message handling, log the stack trace in the console
	}
});

process.on('SIGINT', function() { // Generally used to terminate bot gracefully when ctrl+c is pressed
	client.irc.disconnect("Shutdown by owner");
  console.log("\nGracefully shutting down from signal interupt" );
  process.exit();
});