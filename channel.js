function Channel(name, users, topic, modes, key){
	this._name = name;
	this._users = users;
	this._topic = topic;
	this._modes = modes;
	this._key = key;
}

Channel.prototype = {
    get name(){ return this._name; },
	set name(name){ this._name = name; },
	
	get users(){ return this._users; },
	set users(users){ this._users = users; },
	
	get topic(){ return this._topic; },
	set topic(topic){ this._topic = topic; },
	
	get modes(){ return this._modes; },
	set modes(modes){ this._modes = modes; },
	
	get key(){ return this._key; },
	set key(key){ this._key = key; },
};

// chan1 = new Channel("#ec", ["Jazcash", "Awia"], "ur faggots", {"secret":true, "voicerequired":false}, "fish");
// console.log(chan1.name);
// console.log(chan1.users);
// console.log(chan1.topic);
// console.log(chan1.modes);
// console.log(chan1.key);

module.exports = Channel;