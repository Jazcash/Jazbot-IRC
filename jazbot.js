var factory = require('irc-factory'); // this should be 'irc-factory' in your project
var sys = require('sys');
var exec = require('child_process').exec;
var fs = require('fs');
var bcrypt = require('bcrypt-nodejs'); // npm install bcrypt-nodejs

col = {
    white:"\x030",
    black:"\x031",
    darkBlue:"\x032",
    darkGreen:"\x033",
    red:"\x034",
    darkRed:"\x035",
    darkViolet:"\x036",
    orange:"\x037",
    yellow:"\x038",
    lightGreen:"\x039",
    cyan:"\x0310",
    lightCyan:"\x0311",
    blue:"\x0312",
    pink:"\x0313",
    darkGrey:"\x0314",
    lightGrey:"\x0315" 
};

sty = {
    bold: "\x02",
    colour: "\x03",
    italic: "\x09",
    strikeThrough: "\x13",
    reset:"\x0f",
    underline:"\x15",
    underline2: "\x1f",
    reverse: "\x16"
};

var owner = false; // username of the bot's owner for current session
var vote = {
	name: "",
	opt1: 0,
	opt2: 0,
	voters: 0
}

api = new factory.Api();

var client = api.createClient('test', {
	nick : 'Jazbot',
	user : 'Jazbot',
	server : 'irc.w3.org',
	realname: 'Jazbot',
	port: 6667,
	secure: false
});

api.hookEvent('*', 'registered', function(message) {
	client.irc.join('#ec', 'testy2');
});

api.hookEvent('*', 'privmsg', function(message) {
	var from = message.nickname;
	var to = message.target;
	var message = message.message;
	console.log(message);
	function cmdHandler(params){
		// if params not supplied, default command is executable anywhere, by anybody
		var cmdFunc = (params.cmd === undefined) ? function(){console.log("You must pass a function as a value for the 'cmd' key!")} : params.cmd;
		var authRequired = (params.authRequired === undefined) ? false : params.authRequired; // does cmd require auth?
		var userHasAuth = (from == owner) ? true : false; // does user have auth?
		var where = (params.where === undefined) ? "anywhere" : params.where; // where is cmd executable?
		var loc = (pm) ? from : to; // where to send response
		
		if (where == "pm_only" && !pm){ // not allowed
			client.irc.privmsg(loc, "That command can only be used in a private message to me");
		} else if(where == "channel_only" && pm){ // not allowed
			client.irc.privmsg(loc, "That command can only be used in a channel I am in");
		} else {
			if (authRequired && userHasAuth){ // allowed
				cmdFunc(loc);
			} else if(authRequired && !userHasAuth){ // now allowed
				client.irc.privmsg(loc, "You need to be owner to do that");
			} else if(!authRequired){ // allowed
				cmdFunc(loc);
			}
		}
	}
	var pm = false;
	if (to == client.irc.nick){
		//to = from;	// if message sent directly to bot, set 'to' to the username
		pm = true;
	}
	//console.log(pm);
	if (message[0] == "!"){
   		var temp = message.split(" ");
   		var cmd = temp[0].substring(1)
   		var args = temp.slice(1)
		/*console.log("from "+from);
		console.log("to "+to);
		console.log("msg "+message);
		console.log("owner: "+owner);
		console.log("==============================");*/

		switch (cmd){
			case "testCmd":
				cmdHandler({where: "all", authRequired:true, cmd:function(loc){
					client.irc.privmsg(loc, "Hello!");
				}});
				break;	
			case "setpass":
				cmdHandler({where: "pm_only", authRequired:false, cmd:function(loc){
					var hash = bcrypt.hashSync(args[0]);
					if (!fs.existsSync("passhash") && !owner){
						fs.writeFile("passhash", hash, function(err) {
							if(err) {
								console.log(err);
							} else {
								client.irc.privmsg(loc, col["lightGreen"]+"The file was saved successfully");
							}
						});
					} else if(from == owner){
						fs.writeFile("passhash", hash, function(err) {
							if(err) {
								console.log(err);
							} else {
								client.irc.privmsg(loc, col["lightGreen"]+"The file was saved successfully");
							}
						});
					} else {
						client.irc.privmsg(loc, col["pink"]+"Pass is already set");
					}
				}});
				break;
			case "auth":
				cmdHandler({where: "pm_only", authRequired:false, cmd:function(loc){
					if (fs.existsSync("passhash") && args[0] && !owner){
						fs.readFile('passhash', "utf-8", function (err, data) {
							if (err){ throw err; }
							var pass = args[0];
							if (bcrypt.compareSync(pass, data)){
								client.irc.privmsg(loc, col["lightGreen"]+"Password Valid - User "+from+" is now the authenticated operator");
								owner = from;
							} else {
								client.irc.privmsg(loc, col["pink"]+"Password Invalid");
							}
						});
					} else if (from == owner){
						client.irc.privmsg(loc, col["pink"]+"You are already the owner!");
					} else if (owner){
						client.irc.privmsg(loc, col["pink"]+"An owner has already been set");
					} else if (!fs.existsSync("passhash")){
						client.irc.privmsg(loc, col["pink"]+"Pass isn't set");
					} else {
						client.irc.privmsg(loc, col["pink"]+"You must provide the password");
					}
				}});
				break;
			case "hi":
				cmdHandler({where: "all", authRequired:false, cmd:function(loc){
					client.irc.privmsg(loc, col["cyan"]+"Hello "+from+"!");
				}});
				break;
			case "leave":
				cmdHandler({where: "all", authRequired:true, cmd:function(loc){
					if (args.length == 0){ args[0] = to; }
					for (var i=0; i<args.length; i++){
						var channel = args[i]
						if (channel[0] !== "#"){
							channel = "#" + channel
						}
						try{
							client.irc.part(channel);
						} catch (e){
							console.log(e)
						}
					}
				}});
				break;
			case "join":
				cmdHandler({where: "all", authRequired:true, cmd:function(loc){
					if (args.length > 0){
						for (var i=0; i<args.length; i++){
							var channel = args[i]
							if (channel[0] !== "#"){
								channel = "#" + channel
							}
							try{
								client.irc.join(channel);
							} catch (e){
								console.log(e)
							}
						}
					} else {
						client.irc.privmsg(loc, col["darkRed"]+"You must provide a channel to join");	
					}
				}});
				break;
			case "exec":
				cmdHandler({where: "all", authRequired:true, cmd:function(loc){
					if (owner == from && args.length > 0){
						var output = ""
						var str = args.join(' ');
						console.log(str);
						exec(str, function(error, stdout, stderr){
							output = JSON.stringify(stdout);//stdout.replace('\n', '\\n');
							output = output.substring(1, output.length-1);
							output = output.split('\\n');
							//client.irc.privmsg(loc, col["orange"]+"PMing the output to "+from);
							if (output.length > 50){
								client.irc.privmsg(loc, col["darkRed"]+"No can do - Output is more than 50 lines long");							
							} else {
								for (var i=0; i<output.length-1; i++){
									client.irc.privmsg(loc, col["lightGrey"]+output[i]);
								}
							}
						});
					} else if(owner == from && args.length == 0){
						client.irc.privmsg(loc, col["darkRed"]+"You must provide a command");
					} else {
						client.irc.privmsg(loc, col["pink"]+"You must be owner to do that");
					}					
				}});
				break;
			case "xkcd":
				cmdHandler({where: "all", authRequired:true, cmd:function(loc){
					var loc = (args[0] === undefined) ? loc : args[0];
					if (owner == from){
						for (var i=1; i<10; i++){
							client.irc.privmsg(loc, "https://xkcd.com/"+i+"/");
						}
					}
				}});
				break;
			case "callvote":
				cmdHandler({where: "channel_only", authRequired:false, cmd:function(loc){
					if (args[0]){
						vote.name = args.join(" ");
						client.irc.raw('LIST', loc);
					} else {
						client.irc.privmsg(loc, "You must state what you wish to vote on!");
					}
				}});
				break;
			case "vote":
				cmdHandler({where: "all", authRequired:false, cmd:function(loc){
					if ((vote.opt1 < vote.voters-1) && (vote.opt2 < vote.voters-1)){
						if (args[0] == "y"){
							vote.opt1 = vote.opt1+1;
							client.irc.privmsg(loc, vote.name+" - Yes: "+vote.opt1+"/"+vote.voters+" - No: "+vote.opt2+"/"+vote.voters);
						} else if(args[0] == "n"){
							vote.opt2 = vote.opt2+1;
							client.irc.privmsg(loc, vote.name+" - Yes: "+vote.opt1+"/"+vote.voters+" - No: "+vote.opt2+"/"+vote.voters);
						} else {
							client.irc.privmsg(loc, "You must say state y or n");
						}
						vote.name = args[0];
					} else if (args[0] && vote.name == "") {
						client.irc.privmsg(loc, "Currently no vote in progress");
					} else{
						client.irc.privmsg(loc, "Vote passed! Majority voted in favour of "+vote.name);
						vote.opt1 = 0;
						vote.op2 = 0;
						vote.name = ""
						vote.voters = 0;
					}
				}});
				break;
			default:
				break;
		}
	}
});

api.hookEvent('*', 'list', function(message) {
	vote.voters = message.list[0].users-1;
	client.irc.privmsg("#ec", vote.name+" - Yes: "+vote.opt1+"/"+vote.voters+" - No: "+vote.opt2+"/"+vote.voters);
	//client.irc.privmsg('#ectest2', 'hey this is a test');
});