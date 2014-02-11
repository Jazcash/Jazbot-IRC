function User(username, nickname, channelList, hostaddress){
	this._username = username;
	this._nickname = nickname;
	this._channelList = channelList;
	this._hostaddress = hostaddress;
}

User.prototype = {
    get username(){ return this._username; },
	set username(username){ this._username = username; },
	
	get nickname(){ return this._nickname; },
	set nickname(nickname){ this._nickname = nickname; },
	
	get channelList(){ return this._channelList; },
	set channelList(channelList){ this._channelList = channelList; },
	
	get hostaddress(){ return this._hostaddress; },
	set hostaddress(hostaddress){ this._hostaddress = hostaddress; },
};

// user1 = new User("Jazcash", "Jaz", ["#ec", "#ectest"], "123.456.654.321");
// console.log(user1.username);
// console.log(user1.nickname);
// console.log(user1.channelList);
// console.log(user1.hostaddress);

module.exports = User;