"use strict";
var fs = require('fs');

module.exports = {
		"where":"anywhere",
		"func":function(api, client, config, sessiondata, target, msg){
			if (config.logging){
				var line = msg.target + " <"+msg.nickname+"> "+msg.message+"\n";
				fs.appendFileSync('data/log.txt', line);
			}
		}
};