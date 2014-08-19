var config = require("./config.js");
var request = require('request');
var fs      = require('fs');
var zlib = require('zlib');
var JSONStream = require("JSONStream");
var es = require('event-stream');
var moment=require("moment");
//http://data.githubarchive.org/2012-04-{01..31}-{0..23}.json.gz
var DATA_PATH="data/"

var mongo=require('mongodb'),
	Db=mongo.Db,
	Server=mongo.Server;

var db=new Db(config.db,new Server(config.host,config.port,{auto_reconnect:true}),{safe:false});

var year="2014",
	month="08",
	day="15",
	hour="0";

var dates=[];


//console.log(dates)

var events=[];


var languages=[];

//year+'-'+month+'-'+day+'-'+hour

function getStream(collections) {



	if(!dates.length) {
		console.log("DONE");
		process.exit(0);
	}

	var date=dates.shift();
	var real_date=new Date(moment(date,"YYYY-MM-DD-H").format());
	var e={
		date:real_date,
		date_str:date,
		total:0
	};

	var language={
		date:real_date,
		date_str:date,
		total:0
	};

	console.log('http://data.githubarchive.org/'+date+'.json.gz')
	

	var stream=request('http://data.githubarchive.org/'+date+'.json.gz')
			.pipe(zlib.createGunzip())
			.pipe(es.split("\n"))
			.pipe(es.mapSync(function (data) {

	    		try {
	    			var d=JSON.parse(data);

	    			//console.log(d)

		    		if(!e[d.type]) {
		    			e[d.type]=0;
		    		}
		    		e[d.type]++;
		    		e.total++;
		    		//if(!(e.total%100))	{
		    		//	console.log(e.total,e.date);	
		    		//}

		    		if(!language[d.repository.language]) {
		    			language[d.repository.language]=0;
		    		}
		    		language[d.repository.language]++;
		    		language.total++;

	    		} catch(e) {
	    			console.error(e);
	    		}
	    		
	    		
	    		//json+=data;
	    		return data
	  		}));
			
	stream.on('end', function() {
		
		
	  	//console.log('there will be no more data.');

	  	console.log(e.date,e.total,language.total)

	  	//console.log(e);
	  	//console.log(language)

	  	//events.push(e);
	  	//languages.push(language);	
	  	
	  	//console.log(events.length)
	  	//console.log(languages.length)
	  	
	  	collections.events.insert(e,function(err,records){
	  		collections.languages.insert(language,function(err,records){
	  			getStream(collections);		
	  		});
	  	});

	  	
	});
	//console.log(json)
}
db.open(function(err,client){
	console.log("mongodb initialized")
	client.collection("events", function(err, collection_events) {
		console.log("events collection init");

		collection_events.find({},{"date":1,"date_str":1},{"limit":1,"sort":[['date',-1]]}).toArray(function(err,docs){
			console.log(docs);

			var date=moment(moment().add(-2,"months").format("YYYY-MM-DD"));
			if(docs.length) {
				date=moment(docs[0]["date"]).add(1,"hours");
			}
			while(date < moment().add(-8,"hours")) {
				dates.push(date.format("YYYY-MM-DD-H"));
				date.add(1,"hours");
			}

			console.log(dates)

			client.collection("languages", function(err, collection_languages) {
				console.log("languages collection init");
				getStream({
					"events":collection_events,
					"languages":collection_languages
				});			
			})
		})
	});
});
