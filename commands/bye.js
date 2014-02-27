var cmd = require("./_command.js");

module.exports = new cmd({trigger:"bye", auth:false, where:"chan"}, function(client, style, to, from){
	client.irc.privmsg(to, style["darkRed"]+"Bye "+from+"!");
});