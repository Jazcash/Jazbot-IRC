function Command(params, process){
	this._trigger = params.trigger;
	this._authRequired = params.auth;
	this._location = params.where
	this._process = process;
}

Command.prototype = {
    get trigger(){ return this._trigger; },
	set trigger(trigger){ this._trigger = trigger; },
	
	get process(){ return this._process; },
	set process(process){ this._process = process; },
	
	get auth(){ return this._authRequired; },
	set auth(authRequired){ this._authRequired = authRequired; },
	
	get where(){ return this._location; },
	set where(location){ this._location = location; },
};

module.exports = Command;