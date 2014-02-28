var cmd = require("./_command.js");

module.exports = new cmd({trigger:"hi", auth:false, where:"pm"}, function(client, style, to, from){
	client.irc.privmsg(from, style["cyan"]+"Hello "+from+"!");
});