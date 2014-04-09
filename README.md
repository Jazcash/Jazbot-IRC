Jazbot
======
My Node-JS IRC bot!
##Usage
Put your IRC connection info in config.json OR specify the necessary info via CLI params  
Then, with Node.js installed, just run `node jazbot.js` (CLI params override config.json options)  
Use `!help` in irc to list all available commands to you (only ones you have permission to use will be shown) and `!help <cmd>` to show help for a specific command
###CLI Options
`--server <server>[:port]`  
`--channels <#channel>[ pass][,#channel2]`  
`--nick <botnickname>`  
`--user <botusername>`  
`--bio <information>`

Note that any of these options are optional, so long as they're specified in the config.json.  
If you specify a server without a port, it will default to using port 6667.

__Example:__  
`node jazbot.js --server irc.w3.org --channels "#jazbot pass,#jazbot2" --nick AwesomeBot --bio "I'm a really cool bot!"`