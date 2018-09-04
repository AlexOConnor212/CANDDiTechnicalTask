const cheerio = require('cheerio');
const fs = require('fs');
const request = require('request');
const readline = require('readline');
const knwl = require('knwl.js');
//const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
//const phoneRegex = /^(((\+44\s?\d{4}|\(?0\d{4}\)?)\s?\d{3}\s?\d{3})|((\+44\s?\d{3}|\(?0\d{3}\)?)\s?\d{3}\s?\d{4})|((\+44\s?\d{2}|\(?0\d{2}\)?)\s?\d{4}\s?\d{4}))(\s?\#(\d{4}|\d{3}))?$/;

var knwlInstance = new knwl('english');

var $;
var emails = [];
var phones = [];
var places = [];

//Gets the site source code from the email.
function getWebData(url){
	request(url, function(err, resp, html){
		if(!err){
			$ = cheerio.load(html);
			$("*").each(function(){			
				searchData($(this).text());	
				//console.log($(this).text());
			});	
			
			//console.log(emails);
			//console.log(phones);
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
		//var website = stripEmail(line);
		getWebData(line);
		rl.close();
	});
}

//scans data for email addresses, phones and places
function searchData(input){		
		checkEmail(input);
		checkPhone(input);
		checkPlaces(inpit);
		//only outputs to console at the moment, plan to store values and echo them at the end in a presentable manner (also without repeats)
}

//checks for strings in email format.
function checkEmail(input){	
	knwlInstance.init(input);
	var email = knwlInstance.get('emails')
	
	if(email != "undefined" && email.length > 0)
	{
		console.log(email);		
	}
}
//gets rid of whitespace between numbers that dont a + at the start ie +44 161 414 1080 becomes +44 1614141080 which knwl can process. However I realise this defeats the point of detecting the format, but I couldn't think of a elegant solution for possible uk formats. I hope to go back and improve this.
function checkPhone(input){
	const numRegex = /(?<!\+\d+)(?<=\d) +(?=\d)/g;
	console.log(input);
	if(numRegex.test(input)){			
		input = input.replace(numRegex, "");	
		knwlInstance.init(input);
	}
	var phone = knwlInstance.get('phones')

	if(phone != "undefined" && phone.length > 0)
	{
		console.log(phone);
	}
}

//not started this yet
function checkPlaces(){
	var places = knwlInstance.get('places')
	console.log(places);
	if(places != "undefined" && places.length > 0)
	{
		console.log(places);		
	}
}

function stripEmail(email) {
	var words;
	var result;
	words = email.split('@');
	result = "http://" + words[1];
	return result;
}

getUserInput();