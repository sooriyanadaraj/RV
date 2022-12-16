var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

const uuidv1 = require('uuid');

var AWS = require("aws-sdk");
AWS.config.update({ region: 'ap-south-1' });

var ddb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });
var app = express();

app.listen(3000, () => console.log('Cars API listening on port 3000!'))
AWS.config.update({
  region: "ap-south-1",
  // endpoint: "http://localhost:8000"
});
var docClient = new AWS.DynamoDB.DocumentClient();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
// app.set('view engine', 'jade');
app.get('/', function (req, res) {
  res.send({ title: "Cars API Entry Point" })
})


app.post('/createTable', function (req, res) {

  var params = {
    AttributeDefinitions: [
      {
        AttributeName: 'ID',

        AttributeType: 'N'
      },
      {
        AttributeName: 'COLUMN_NAME',
        AttributeType: 'S'
      }
    ],
    KeySchema: [
      {
        AttributeName: 'ID',
        KeyType: 'HASH'
      },
      {
        AttributeName: 'COLUMN_NAME',
        KeyType: 'RANGE'
      }
    ],
    // GlobalSecondaryIndexes: [
    //   {
    //     IndexName: "COLUMN_NAME"

    //   }]
    // ,
    ProvisionedThroughput: {
      ReadCapacityUnits: 1,
      WriteCapacityUnits: 1
    },
    TableName: req.body.TableName,
    StreamSpecification: {
      StreamEnabled: false
    }
  };

  // Call DynamoDB to create the table
  ddb.createTable(params, function (err, data) {
    if (err) {
      console.log("Error", err);
    } else {
      console.log("Table Created");
      res.send(req.body.TableName + 'Table Created!',)
    }
  })
})

app.get('/listTable', function (req, res) {

  ddb.listTables({ Limit: 10 }, function (err, data) {
    if (err) {
      console.log("Error", err.code);
    } else {
      console.log("Table names are ", data.TableNames);
      let datas = data.TableNames
      res.send(data)
    }
  })
})



// GET API 
app.get('/list', function (req, res) {
  var params = {
    TableName: "SAMPLE_TWO"
  };
  console.log("Scanning sample_one table.");
  docClient.scan(params, onScan);
  function onScan(err, data) {
    if (err) {
      console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
    } else {
      res.send(data)
      // print all the Cars
      console.log("Scan succeeded.");

      if (typeof data.LastEvaluatedKey != "undefined") {
        console.log("Scanning for more...");
        params.ExclusiveStartKey = data.LastEvaluatedKey;
        docClient.scan(params, onScan);
      }
    }
  }
})

//POST API

app.post('/create', function (req, res) {
  // AWS.config.update(config.aws_remote_config);
  // const docClient = new AWS.DynamoDB.DocumentClient();
  const Item = { ...req.body };
  // Item.id = 12;
  var params = {
    TableName: "SAMPLE_TWO",
    Item: Item
  };

  console.log(params,'params data')

  // Call DynamoDB to add the item to the table
  docClient.put(params, function (err, data) {
    if (err) {
      res.send({
        success: false,
        message: err
      });
    } else {
      res.send({
        success: true,
        message: 'Added movie',
        movie: data
      });
    }
  });
})