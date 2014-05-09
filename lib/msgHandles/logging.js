"use strict";
var fs = require('fs');

module.exports = {
		"where":"anywhere",
		"func":function(api, client, config, sessiondata, target, msg){
			if (sessiondata.log){
				var line = msg.target + " <"+msg.nickname+"> "+msg.message+"\n";
				fs.appendFileSync('log.txt', line);
			}
		}
};