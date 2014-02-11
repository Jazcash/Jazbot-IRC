function Server(address, port, channels, motd){
	this._address = address;
	this._port = port;
	this._channels = channels;
	this._motd = motd;
}

Server.prototype = {
    get address(){ return this._address; },
	set address(address){ this._address = address; },
	
	get port(){ return this._port; },
	set port(port){ this._port = port; },
	
	get channels(){ return this._channels; },
	set channels(channels){ this._channels = channels; },
	
	get motd(){ return this._motd; },
	set motd(motd){ this._motd = motd; }
};

// serv1 = new Server("w3.irc.org", 6667, ["#ec", "#ectest"], "Hello there\nHow be you?");
// console.log(serv1.address);
// console.log(serv1.port);
// console.log(serv1.channels);
// console.log(serv1.motd);

exports.Server = Server;