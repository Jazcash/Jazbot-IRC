"use strict";
module.exports = {
	"!test":
	{
		"authrequired":false,
		"where":"anywhere",
		"requiredargs":0,
		"detail":"Is used for testing and debugging",
		"synopsis":"!test",
		"func":function(api, client, style, target, msg, args){
			//throw {"name":"Custom Error", "message":"There was a custom error message"};
			//console.log(thing);
		}
	}
};