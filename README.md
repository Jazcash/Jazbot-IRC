Jazbot
======

My Node-JS IRC bot!

##Usage

`node jazbot.js`
Use `!help` to list all available commands to you (only ones you have permission to use will be shown) and `!help <cmd>` to show help for a specific command.

##ToDo

###General

* Turn this ToDo list into separate issues on Github!
* Make a package.json

###Jazbot Core

* Refactor and reimplement the old commands: lastfm, listen, subscribe, tweet, spelling, image, synonyms
* Update irc-factory to latest repo version
* Fix colour code parsing to not slice off the start of numbers (^61993 = 993)
* Replace literal string + variable implementations with util.format('thing %s %d', var1, var2) style
* Add minumum interval for commands to prevent spamming and stepping over API rate limits
* Colour code wildcard for random colour and another symbol for rainbow colours

###Commands

* Make !imdb use the OMDb as the primary API and the other, rate-limited one as the fallback if the first returns no results
* Add operator awareness with op-commands like !kick, !ban, !mute, !voice, !op etc
* Add custom errors for missing API keys and where to go to get them

##Ideas

* Automatic documentation generation displaying help information for commands?
* Look into making each command a separate child process
* Steam command
* Chat logging to text files
* Build a function to parse messages and extract certain parts using regex group capturing
