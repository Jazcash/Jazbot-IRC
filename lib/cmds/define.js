"use strict";
var requestsync = require('request-sync');
var cheerio = require('cheerio');
var validator = require('validator');

module.exports = {
	"!define": {
		"authrequired":false,
		"where":"anywhere",
		"requiredargs":1,
		"detail":"Attempts to get a definition for a word",
		"synopsis":"!define <word> [result number]",
		"func":function(api, client, config, sessiondata, style, target, msg, args){
			var searchTerm = args;
			var resultNum = (validator.isNumeric(searchTerm[searchTerm.length-1])) ? searchTerm.pop() : 1;
			searchTerm = searchTerm.join(" ");
			//var resultNum = (args.length > 1) ? args[1] : 1;
			
			var response = requestsync({url:'https://www.google.co.uk/search?q=define+'+searchTerm, headers:{"User-Agent":"Mozilla/5.0 (Windows NT 6.1; WOW64; rv:24.0) Gecko/20100101 Firefox/24.0"}});
			var $ = cheerio.load(response.body);
			try {
				var blocks = $(".lr_dct_sf_sen");
				var numberOfDefinitions = blocks.length;
			} catch (err){ throw {"name":"No definition", "message":"Couldn't find a definition for "+searchTerm} }
			
			if (resultNum > numberOfDefinitions){
				throw {"name":"Result num too high", "message":searchTerm+" does not have that many results. Try a lower number"}
			} else if (resultNum < 1) {
				throw {"name":"Result num too low", "message":"You must specifiy a result number greater than 0"}
			}
			
			var block = blocks[resultNum-1].children[1].children[0]; //font-size:small level
			
			for (var i=0; i<block.children.length; i++){
				var line = block.children[i];
				if ("style" in line.attribs){ // definition text
					var def = "";
					for (var k=0; k<line.children.length; k++){
						def += line.children[k].children[0].data;
					}
					def = def.charAt(0).toUpperCase() + def.slice(1);
				} else if ("class" in line.attribs){ // example text
					var example = line.children[1].children[0].data;
					example = "\""+example.charAt(0).toUpperCase() + example.slice(1)+"\"";
				}
			}
			var def = {"def":def, "example":example};
			
			client.irc.privmsg(target, style.purple+"("+numberOfDefinitions+ " results) "+style.turquoise+resultNum+". "+style.blue+def.def+"  "+style.lightgrey+def.example);
		}
	}
}