"use strict";

module.exports = {
	"!test":
	{
		"authrequired":false,
		"where":"anywhere",
		"requiredargs":0,
		"detail":"Is used for testing and debugging",
		"synopsis":"!test",
		"func":function(api, client, config, sessiondata, target, msg, args){
			var total = 0;
			for (var i=0; i<430046532; i++){
				total += (i*i*i)/i-1;
			}
		}
	}
};