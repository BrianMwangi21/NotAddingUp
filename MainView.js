// The constants
var Observable = require("FuseJS/Observable");
var FileSystem = require("FuseJS/FileSystem");
var path = FileSystem.dataDirectory + "/" + "mydata.json";
var r_date = new Date();

// Whole data Variables
var data = Observable();
var save_new_nau = Observable("");

// Single data variables
var single_data = Observable();
var single_data_counter = single_data.map( function(x) { return x.nau_counter } );
var single_data_context = single_data.map( function(x) { return x.nau_data } );
var single_data_date = single_data.map( function(x) { return x.nau_date } );

// Articles variables
var articles_global = Observable();

function gotodetailspage() {
	router.goto("detailsviewpage");

	// Clear the data already present
	articles_global.clear();

	// Remove the spaces in the single_data_context
	var modified_single_data = single_data_context.value.replace(/ /g,"+");

	// The load the data
	// API KEY = 1774d52102aa44cbad4501f1fe705ab2
	var url = 'https://newsapi.org/v2/everything?' +
          'q=' + modified_single_data + '&' +
          'from=2018-01-22&' +
          'sortBy=popularity&' +
          'apiKey=1774d52102aa44cbad4501f1fe705ab2';

    var req = new Request(url);

	fetch( req ).then(
		function(response) {
			var results = JSON.parse( JSON.stringify(response) );
			var bodyText = JSON.parse( results._bodyText );
			var articles_array = bodyText.articles;
			console.log( bodyText.totalResults );
			 
			// Loop through the data
			for( var o_data = 0; o_data < 21; ++o_data ) {
				articles_global.add( {
						'title' : articles_array[o_data].title,
						'description' : articles_array[o_data].description,
						'url' : articles_array[o_data].url,
						'timeauthor' : articles_array[o_data].author + " - " + articles_array[o_data].publishedAt
					}
				);
			}
		}
	).catch(
		function(error) {
			console.log("error : " + error);
		}
	);
}

// On-click the topic
function selectTopic(arg) {
	single_data.value = arg.data;
	gotodetailspage();
}

function (rg) {
	single_data.value = arg.data;
	gotodetailspage();
}

function readStringFromFile() {
	// Get the data from the file
	// First check if it exists
	if( !FileSystem.existsSync(path) ) {
		writeStringToFile("[]");
		console.log("new file created");
	}

	FileSystem.readTextFromFile(path).then(
		function(str) {
			var read_data = JSON.parse(str);
			console.log("read data, length: " + read_data.length);
			data.replaceAll(read_data);
		}
	);
}

function save() {
	writeStringToFile(JSON.stringify(data.toArray()));
	save_new_nau.value = "";
}

function writeStringToFile(str) {
	FileSystem.writeTextToFile(path, str).then(
		function() {
			console.log("saved data at : " + path);
		}
	).catch(
		function(e) {
			console.log("not saved: " + e);
		}
	);
}

function savenew() {
	// Get the value to store in the storage file
	var counter_to_store = data.length + 1;
	var data_to_store = save_new_nau.value;
	var date_to_store = r_date.toDateString() + " - " + r_date.getHours() + ":" + r_date.getMinutes() + ":" + r_date.getSeconds();

	// Save data in variable
	data.insertAt( 0, {
		'nau_counter' : counter_to_store,
		'nau_data' : data_to_store,
		'nau_date' : date_to_store
	} );

	save();
}

// Get data on initialize
readStringFromFile();

module.exports = {
	data : data,
	save_new_nau : save_new_nau,
	savenew : savenew,
	selectTopic : selectTopic,
	removeTopic : removeTopic,
	single_data_context : single_data_context,
	single_data_date : single_data_date,
	articles_global : articles_global,	  
};