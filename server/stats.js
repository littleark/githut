var http=require("http");
var MongoClient = require('mongodb').MongoClient;

MongoClient.connect("mongodb://localhost:27017/github", function(err, db) {
  // Create a collection
  //db.createCollection('languages', function(err, collection) {
    // Insert the docs
      var languages={};
      var group={};
      db.collection('languages').find({},{},{}).toArray(function(err,docs){

        //console.log(docs)

        docs.forEach(function(doc){

          for(var key in doc) {
            if(typeof doc[key] == "number" && key!="undefined") {
              if(!languages[key]) {
                languages[key]=0;
              }
              languages[key]+=doc[key];
            }
          }
        });

        group={
          _id:{
            year: { $year: "$date" },
            month: { $month: "$date" },
            day: { $dayOfMonth: "$date" }
          },
          min_date: {$min: '$date'},
          max_date: {$max: '$date'}
        };
        for(var key in languages) {

          group["sum_"+key]={$sum:"$"+key}
          //group["avg_"+key]={$avg:"$"+key}

        }

        console.log(group)
        calculateStats();
      });

      function calculateStats() {
        var cursor = db.collection('languages').aggregate(
          [
              {
                $match: {
                  //"DataAnalisi":/12\/2010/i,
                  //"Prov":12
                }
              },
              { 
                $group:group
              },
              { $sort: {max_date:-1} }
          ],
          {
            allowDiskUsage: true, 
            cursor: {batchSize: 1000}
          }
        );

        var records=[],
            final_records=[];

        // Use cursor as stream
        cursor.on('data', function(data) {
          
          records.push(data);
          //data.forEach(function(d){

            //console.log(d);
          //})

        });

        cursor.on('end', function() {
          
          //console.log(records);

          generateCSV(records);

          db.close();
        });
      }

  //}); //create
});

function generateCSV(records) {

  var json2csv = require('json2csv');

  //console.log(records);
  var header_array=[];
  for(var key in records[0]) {
    if(key!="_id"){
      header_array.push(key)
    }
  }

  //console.log(header_array)

  var json2csv = require('json2csv');

  json2csv({data: records, fields: header_array}, function(err, csv) {
    if (err) console.log(err);
    //console.log(csv);
    console.log("CSV READY")
    http.createServer(function (request, response) {
        var sendCSVandClose=function(csv){
          //console.log(json)
          response.writeHead(200, { 'Content-Type': 'text/html',"Access-Control-Allow-Origin": "*" });
          response.write(csv);
          response.end("\n", 'utf-8');
        };
        sendCSVandClose(csv);
    }).listen(8133);
    console.log("listening on 8133...")
  });


}