var cmd = require("./_command.js");

module.exports = new cmd({trigger:"hi", auth:false, where:"chan"}, function(client, style, to, from){
	client.irc.privmsg(to, style["cyan"]+"Hello "+from+"!");
});