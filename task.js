const cheerio = require('cheerio');
const fs = require('fs');
const request = require('request');
const readline = require('readline');
const knwl = require('knwl.js');

var knwlInstance = new knwl('english');

//Gets the site source code from the email.
function getWebData(url){
	request(url, function(err, resp, html){
		if(!err){
			const $ = cheerio.load(html);
			//knwlInstance.init(html);
			console.log(typeof html);
			//console.log($);
		}
		else{
			console.log('That email has not been recognised.');
		}
	});
}

//Gets the input of the user to the console.
function getUserInput(){var rl = readline.createInterface(process.stdin, process.stdout);
	rl.setPrompt('input email> ');
	rl.prompt();
	rl.on('line', function(line) {	
		var website = stripEmail(line);
		getWebData(line);
		rl.close();
	});
}

function stripEmail(email) {
	var words;
	words = email.split('@');
	return words[1];
}

fs.readFile("./canddiHtml.txt", 
            {"encoding": "utf8"}, 
              function(err, data) {
    if (err)
        console.log(err);
    else {
        var contents = data;
		const $ = cheerio.load(contents);
		
		$(":contains('phone')").forEach(function(element){
			console.log(element);
		});
		
    }
});

