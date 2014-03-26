module.exports = function(str){
	var finalstr = str;
	var colourcodes = str.match(/\^[0-9]{1}[0-5]?,[0-9]{1}[0-5]?|\^((20|1([0-9]?)|[0-9])|[0-9])/g);
	for (var i in colourcodes){
		var num = colourcodes[i].slice(1).split(",");
		if (num.length == 1){ // if not background colour
			if (num[0] > 15){
				switch(num[0]){
					case "16":
						finalstr = finalstr.replace(colourcodes[i], "\x02");
						break;
					case "17":
						finalstr = finalstr.replace(colourcodes[i], "\x09");
						break;
					case "18":
						finalstr = finalstr.replace(colourcodes[i], "\x13");
						break;
					case "19": 
						finalstr = finalstr.replace(colourcodes[i], "\x15");
						break;
					case "20": 
						finalstr = finalstr.replace(colourcodes[i], "\x0f");
						break;
					default: break;
				}
			} else {
				finalstr = finalstr.replace(colourcodes[i], "\x03"+num[0]);
			}
		} else { // if background colour
			var background = num[1];
			var foreground = num[2];
			finalstr = finalstr.replace(colourcodes[i], "\x03"+num[0]+","+num[1]);
		}
	}
	return finalstr;
}

/*module.exports = {
    white:"\x030",
		lightgrey:"\x0315",
		darkgrey:"\x0314",
    black:"\x031",
		lightblue:"\x0311",
		blue:"\x0312",
    darkblue:"\x032",
		lightgreen:"\x039",
    darkgreen:"\x033",
    lightred:"\x034",
    darkred:"\x035",
    purple:"\x036",
    orange:"\x037",
    yellow:"\x038",
    turquoise:"\x0310",
    pink:"\x0313",
	
    bold: "\x02",
    colour: "\x03",
    italic: "\x09",
    strikethrough: "\x13",
    reset:"\x0f",
    underline:"\x15",
    underline2: "\x1f",
    reverse: "\x16"
}*/