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
			
      var response = requestsync({url:'https://www.google.co.uk/search?q=define+'+searchTerm, headers:{"User-Agent":"Mozilla/5.0 (Windows NT 6.1; WOW64; rv:24.0) Gecko/20100101 Firefox/24.0"}});
      var $ = cheerio.load(response.body);
			
			//var word = console.log($('.vk_ans').text());
			
      var defs = [];
      
			$('div[data-dobid="dfn"]').each(function(i, el) {
				var definition = el.children[0].children[0].data.trim();
				var def = {"def":definition.charAt(0).toUpperCase() + definition.slice(1)};
				if (el.next != null){
					if (el.next.attribs.class == "vk_gy"){
						var example = $(el.next).text().trim();
						//def.example = "\""+example.charAt(1).toUpperCase() + example.slice(2);
					}
				}
				if (el.next != null){
					if (el.next.attribs.class == "vk_gy"){
						def.example = $(el.next).text().trim();
					}
				}
				//def.word = $(el).closest('.vk_ans').text();
				def.word = $(el).closest('.lr_dct_ent')[0].children[0].children[0].children[0].data;
				defs.push(def);
			});
      
      var webdef = $('div[data-dobid="wd-dfn"]')[0];
      if (webdef !== undefined){
        defs.push({"def":webdef.children[0].data, "url":webdef.next.attribs.href});
      }
			
			console.log(defs);
			
      if (resultNum != 1 && defs.length > 0){
        if (resultNum > 0){
          if (resultNum-1 < defs.length){
            if (defs[resultNum-1].example !== undefined  && defs[resultNum-1].url === undefined) client.irc.privmsg(target, style.turquoise+" "+resultNum+". "+style.darkblue+defs[resultNum-1].word+": "+style.blue+defs[resultNum-1].def+" - "+style.lightgrey+defs[resultNum-1].example);
						else if (defs[resultNum-1].url !== undefined) client.irc.privmsg(target, style.purple+"("+(defs.length)+" results)"+style.turquoise+" "+resultNum+". "+style.darkblue+defs[resultNum-1].word+": "+style.blue+defs[resultNum-1].def+" - "+defs[resultNum-1].url);
						else client.irc.privmsg(target, style.turquoise+" "+resultNum+". "+style.darkblue+defs[resultNum-1].word+": "+style.blue+defs[resultNum-1].def);
          } else {
            client.irc.privmsg(target, style.lightred+"There are not that many results"); 
          }
        } else {
           client.irc.privmsg(target, style.lightred+"Result number must be greater than 0");
        }
			} else if(defs.length > 0){
				if (defs[resultNum-1].example !== undefined && defs[resultNum-1].url === undefined) client.irc.privmsg(target, style.purple+"("+(defs.length)+" results)"+style.turquoise+" "+resultNum+". "+style.darkblue+defs[resultNum-1].word+": "+style.blue+defs[resultNum-1].def+" - "+style.lightgrey+defs[resultNum-1].example);
				else if (defs[resultNum-1].url !== undefined) client.irc.privmsg(target, style.purple+"("+(defs.length)+" results)"+style.turquoise+" "+resultNum+". "+style.darkblue+defs[resultNum-1].word+": "+style.blue+defs[resultNum-1].def+" - "+defs[resultNum-1].url);
				else client.irc.privmsg(target, style.purple+"("+(defs.length)+" results)"+style.turquoise+" "+resultNum+". "+style.darkblue+defs[resultNum-1].word+": "+style.blue+defs[resultNum-1].def);
			} else {
				client.irc.privmsg(target, style.lightred+"There are no definitions for "+searchTerm);
      }
		}
	}
}