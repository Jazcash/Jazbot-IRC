// IMPORTS
// irc requires node-irc (npm -g install irc)
var irc = require('irc');
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