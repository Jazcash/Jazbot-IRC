// IMPORTS
var sys = require('sys') 
var exec = require('child_process').exec;
var fs = require('fs');
var irc = require('irc'); // npm install irc
var bcrypt = require('bcrypt-nodejs'); // npm install bcrypt-nodejs

// GLOBAL VARIABLES
var colours = irc.colors.codes

// String formatting (String.format('{0} is dead, but {1} is alive! {0} {2}', 'ASP', 'ASP.NET')
if (!String.format) {
  String.format = function(format) {
    var args = Array.prototype.slice.call(arguments, 1);
    return format.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number] 
        : match
      ;
    });
  };
}

// Create bot
var bot = new irc.Client('irc.w3.org', 'nodebot', {
    channels: ['#ectest'],
});

// On message event
bot.addListener('message', function (from, to, message) {
	if (message[0] == "!"){
   		var temp = message.split(" ");
   		var cmd = temp[0].substring(1)
   		var args = temp.slice(1)

   		switch (cmd){
   			case "hi":
   				bot.say(to, colours["cyan"]+"Hello "+from+"!");
   				break;
   			case "leave":
   				for (var i=0; i<args.length; i++){
   					var channel = args[i]
   					if (channel[0] !== "#"){
   						channel = "#" + channel
   					}
   					try{
	   					bot.part(channel)
	   				} catch (e){
	   					console.log(e)
	   				}
   				}
   				break;
   			case "join":
   				for (var i=0; i<args.length; i++){
   					var channel = args[i]
   					if (channel[0] !== "#"){
   						channel = "#" + channel
   					}
   					try{
	   					bot.join(channel)
	   				} catch (e){
	   					console.log(e)
	   				}
   				}
   				break;
   			case "ls":
				var output = ""
				exec("dir", function(error, stdout, stderr){
					output = stdout.split("\r\n")
					for (var i=0; i<output.length; i++){
						bot.say(to, output[i]);
					}
				});
			case "setpass":
				var hash = bcrypt.hashSync(args[0]);
				if (!fs.existsSync("passhash")){
					fs.writeFile("passhash", hash, function(err) {
					    if(err) {
					        console.log(err);
					    } else {
					        bot.say(to, "The file was saved!");
					    }
					}); 
				} else {
					bot.say(to, "Pass is already set!");
				}
				break;
			case "checkpass":
				if (fs.existsSync("passhash") && args[0]){
					fs.readFile('passhash', "utf-8", function (err, data) {
						if (err){ throw err; }
						var pass = args[0];
						if (bcrypt.compareSync(pass, data)){
							bot.say(to, colours["light_green"]+"Password Valid - User "+from+" is now the authenticated operator");
						} else {
							bot.say(to, "Password Invalid!");
						}
					});
				} else if (!fs.existsSync("passhash")){
					bot.say(to, "Pass isn't set!");
				} else {
					bot.say(to, "You must provide the password");
				}
				break;
   			default:
   				break;
   		}
	} else {
		if (from == "Jazcash"){
			bot.say(to, "You're a cool dude Jaz.");
		}
	}
});

bot.addListener('error', function(message) {
    console.log('error: ', message);
});