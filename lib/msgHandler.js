"use strict";

function MsgHandler(api, client, config, sessiondata){
	this.api = api;
	this.client = client;
	this.config = config;
	this.sessiondata = sessiondata;
	
	var msgHandles = [];
	require('fs').readdirSync(__dirname + '/' + "msgHandles").forEach(function(file) { // for every file in the 'cmds/' directory
		if (file.match(/.+\.js/g) !== null) { // if file is a .js file
			var msgHandle = require(__dirname + '/msgHandles/' + file); // require it
			msgHandles.push(msgHandle);	// store it in cmds for later use
		}
	});
	
	this.msgHandles = msgHandles;
}

MsgHandler.prototype.handle = function(msg, target){
	for (var i=0; i<this.msgHandles.length; i++){
		var msgHandle = this.msgHandles[i];
		msgHandle.func(this.api, this.client, this.config, this.sessiondata, target, msg);
	}
}

module.exports = MsgHandler;