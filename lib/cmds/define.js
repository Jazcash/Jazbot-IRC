"use strict";
var requestsync = require('request-sync');
var cheerio = require('cheerio');
var validator = require('validator');

module.exports = {
	"!define": {
		"authrequired":false,
		"where":"anywhere",
		"detail":"Attempts to get a definition for a word",
		"args": [
			{
				"names"		:["-r", "--result"],
				"action"	:"store",
				"type"		:"int",
				"help"		:"Result number",
				"defaultValue":1
			},{
				"names"		:["word"],
				"action"	:"store",
				"help"		:"Word or phrase"
			}
		],
		"func":function(api, client, config, sessiondata, target, msg, args){
			var searchTerm = args.word;
			var resultNum = args.result;
			
      var response = requestsync({url:'https://www.google.co.uk/search?q=define+'+searchTerm, headers:{"User-Agent":"Mozilla/5.0 (Windows NT 6.1; WOW64; rv:24.0) Gecko/20100101 Firefox/24.0"}});
      var $ = cheerio.load(response.body);
			
      var defs = [];
      
			$('div[data-dobid="dfn"]').each(function(i, el) {
				var definition = el.children[0].children[0].data.trim();
				var def = {"definition":definition.charAt(0).toUpperCase() + definition.slice(1)};
				if (el.next != null){
					if (el.next.attribs.class == "vk_gy"){
						var example = $(el.next).text().trim();
					}
				}
				if (el.next != null){
					if (el.next.attribs.class == "vk_gy"){
						def.example = $(el.next).text().trim();
					}
				}
				def.word = $(el).closest('.lr_dct_ent')[0].children[0].children[0].children[0].data;
				defs.push(def);
			});
      
      var webdef = $('div[data-dobid="wd-dfn"]')[0];
      if (webdef !== undefined){
				defs.push({"definition":webdef.children[0].data, "url":webdef.next.attribs.href, "word":$('.vk_ans').text()});
      }
			
			var def = defs[resultNum-1];
			
			if (defs.length <= 0) return "^4There are no definitions for \'"+searchTerm+"\'";
			if (resultNum <= 0) return "^4Result number must be greater than 0";
			if (resultNum > defs.length) return "^4There are not that many results";
			
			var resultNumsStr = (resultNum > 1) ? "" : "^6("+(defs.length)+" results) ";
			var resultNumStr = "^10"+resultNum+". ";
			var defStr = "^2"+def.word+": ^12"+def.definition;
			var exampleStr = ("example" in def) ? " ^15"+def.example : "";
			var urlStr = ("url" in def) ? " "+def.url : "";
			
			client.irc.privmsg(target, resultNumsStr+resultNumStr+defStr+exampleStr+urlStr);
		}
	}
}