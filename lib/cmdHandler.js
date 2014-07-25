"use strict";
var ArgumentParser = require('argparse').ArgumentParser;

function CmdHandler(api, client, config, sessiondata){
	this.api = api;
	this.client = client;
	this.config = config;
	this.sessiondata = sessiondata;
	
	var cmds = {};
	require('fs').readdirSync(__dirname + '/' + "cmds").forEach(function(file) { // for every file in the 'cmds/' directory
		if (file.match(/.+\.js/g) !== null) { // if file is a .js file
			var cmdsjson = require(__dirname + '/cmds/' + file); // require it
			for (var key in cmdsjson){ // for each command
				var cmd = cmdsjson[key];
				var parser = new ArgumentParser({version: '0.0.1', addHelp:true});
				/*if ("subparsers" in cmd){
					var subparsers = parser.addSubparsers({title:'subcommands', dest:"subcommand_name"});
					var sp = cmd["subparsers"];
					for (var i=0; i<sp.length; i++){
						var bar = subparsers.addParser(sp[i].title, sp[i]);
						for (var j=0; j<sp[i].args.length; j++){
							bar.addArgument(sp[i].args[j].names, sp[i].args[j]);
						}
					}
					cmd.parser = parser;
				} else {*/
					if ("args" in cmd){
						var p = cmd.args;
						for (var i=0; i<p.length; i++){
							parser.addArgument(p[i].names, p[i]);
						}
					}
					cmd.parser = parser;
				//}
				
				
				cmds[key] = cmd;	// store it in cmds for later use*/
			}
		}
	});
	
	this.cmds = cmds;
	this.sessiondata.cmds = this.cmds;
}

CmdHandler.prototype.handle = function(msg, target){
	var args = getargs(msg.message); // !trigger arg0 arg1 arg2 ...
	var cmdtrigger = args.shift(); // !trigger
	
	if (!(cmdtrigger in this.cmds) && cmdtrigger != "!help") return; // if command doesn't exist then end
	var cmd = this.cmds[cmdtrigger]; // the full cmd itself
	
	try {
		if ("parser" in cmd) args = cmd.parser.parseArgs(args);
	}	catch(err){
		this.client.irc.privmsg(target, "^4"+err);
		return;
	}
	
	if (cmd.authrequired && !msg.hasAuth) return "^4You require authorisation to use that command"; // if user has no auth for that cmd
	if (cmd.where == "pm" && !msg.isPm) return "^4That command can only be messaged to me privately"; // if cmd is in wrong location
	if (cmd.where == "channel" && msg.isPm) return "^4That command can only be used in a channel"; // if cmd is in wrong location
	try { // all requirements are validated, attempt to execute command
		var errormsg = cmd.func(this.api, this.client, this.config, this.sessiondata, target, msg, args); // call cmd function
		if (errormsg !== undefined) {
			this.client.irc.privmsg(target, errormsg); // If an error is returned from the command then write it in irc
		}
	} catch (err){
		if (err != "Incorrect arguments"){ // invalid args passed to command
			if ("stack" in err) console.log(err.stack); // log uncaught errors
			else console.log(err);
			return "^4There was an uncaught error in the command '"+cmdtrigger+"', please see the console";
		} else {
			return "^4Incorrect arguments for that command ("+cmdtrigger+")";
		}
	}
}

function getargs(argstr){ // delimits options with quotes. e.g. '--word "hello world"' -> ['--word', 'hello world']
	argstr = argstr+" ";
	var insideQuotes = false;
	var argstart = 0;
	var argend = 0;
	var args = [];
	for (var i in argstr){
		var char = argstr[i];
		if ((char == " ") && !insideQuotes){
			var arg = argstr.substr(argstart, argend);
			if (arg[0] == "\"" && arg[arg.length-1] == "\""){
				args.push(argstr.substr(argstart+1, argend-2));
			} else {
				args.push(argstr.substr(argstart, argend));
			}
			argstart = parseInt(i)+1;
			argend = 0;
		} else {
			if (char == "\""){
				insideQuotes = !insideQuotes;	
			}
			argend++;	
		}
	}
	return args;
}

module.exports = CmdHandler;