const cheerio = require('cheerio');
const request = require('request');
const readline = require('readline');
const knwl = require('knwl.js');


var knwlInstance = new knwl('english');

var $;

//These could be turned into a single data object with a type and value
var emails = [];
var phones = [];
var places = [];

//Makes a request to the site and scans through the body
function getWebData(url){
	request(url, function(err, resp, html){
		if(!err){
			$ = cheerio.load(html);
			$("*").each(function(){								
				searchData($(this).text());					
			});	
			displayData();
		}
		else{
			console.log("Error getting web data");
		}
	});
}

//Gets the input of the user to the console.
function getUserInput(){var rl = readline.createInterface(process.stdin, process.stdout);
	rl.setPrompt('input email> ');
	rl.prompt();
	rl.on('line', function(line) {	
		knwlInstance.init(line);
		
		if(knwlInstance.get('emails').length > 0){
			var website = stripEmail(line);			
			var contactPageUrl = findContactPage(website);

			if(contactPageUrl != null){
				getWebData(contactPageUrl);
			}
		}
		else{
			console.log('That email has not been recognised.');
		}
		rl.close();
	});
}

//scans data for email addresses, phones and places
function searchData(input){		
		checkEmail(input);
		checkPhone(input);
		checkPlaces(input);
}

//scans the input string using the knwl api for email addresses and adds them to the emails array as long as they aren't already in it
function checkEmail(input){	
	knwlInstance.init(input);	
	var email = knwlInstance.get('emails')
	
	if(email != "undefined" && email.length > 0 && !emails.includes(email[0].address))
	{
		emails.push(email[0].address);		
	}
}
//gets rid of whitespace between numbers that dont a + at the start ie +44 161 414 1080 becomes +44 1614141080 which knwl can process. However I realise this defeats the point of detecting the format, but I couldn't think of a elegant solution for possible uk formats. I hope to go back and improve this.
function checkPhone(input){
	const numRegex = /(?<!\+\d+)(?<=\d) +(?=\d)/g;

	if(numRegex.test(input)){			
		input = input.replace(numRegex, "");	
		knwlInstance.init(input);
	}
	var phone = knwlInstance.get('phones')

	if(phone != "undefined" && phone.length > 0 && !phones.includes(phone[0].phone))
	{
		phones.push(phone[0].phone);
	}
}

//Uses regex to scan input strings for possible UK addresses. It won't pick up addresses without a street key word and can have issues with non UK address formats. The output is also not formatted so can include characters such as \t etc. I hope to come back to this and implement a custon knwl plugin to resolve the aforementioned issues.
function checkPlaces(input){
	const addressRegex = /(([A-Z][a-zA-Z]*\s*)+,\s?)*(\d+\s)?(([A-Z][a-zA-Z]*\s?)+)\s(Street|Ave|Lane|Road|Hill|Close|Avenue|Boulevard|Course|Drive|Way|Alley|St|Square|Mews),?\s*([A-Z][a-zA-Z]*\s?)+,?(\s*([A-Z][a-zA-Z]*)+)?,?\s*\w{2,4}\s?\w{3}/g;
	if(addressRegex.test(input) && !places.includes(input.match(addressRegex)[0]))
	{
		places.push(input.match(addressRegex)[0]);
	}
}
//All 3 of these functions only return the first found result I need to add a for loop to get all of them

//Displays the contents of each data array. I plan to improve this by combining each array into a single array of objects to reduce the ammount of code here by ~2/3.
function displayData(){
	console.log("Total email addresses found: " + emails.length +"\n");
	emails.forEach(function(elem){
		console.log("\t" + elem + ",\n");
	});
	console.log("Total phone numbers found: " + phones.length +"\n");
	phones.forEach(function(elem){
		console.log("\t" + elem + ",\n");
	});
	console.log("Total addresses found: " + places.length +"\n");
	places.forEach(function(elem){
		console.log("\t" + elem + ",\n");
	});
}

//takes thesuffix out of the email and makes it into a usuable web address
function stripEmail(email) {
	var words;
	var result;
	words = email.split('@');
	result = "http://www." + words[1];
	return result;
}

//Searches the web page for a contacts page
function findContactPage(url){
	var result = null;
	
	request(url, function(err, resp, html){
		if(!err){
			$ = cheerio.load(html);
			$("*").each(function(){						
				if($(this).attr("href") != undefined && $(this).attr("href").includes("contact")){		
					result = url + $(this).attr("href")		
					getWebData(result);
				}			
			});				
		}
	});		
}

//I need to improve error handling
getUserInput();