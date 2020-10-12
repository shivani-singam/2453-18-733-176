const express=require('express');
const app=express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

const MongoClient = require('mongodb').MongoClient;

let server=require('./server');
let config=require('./config');
let middleware=require('./middleware');
const response=require('express');

const url='mongodb://127.0.0.1:27017';
const dbname="mini1";
let db

MongoClient.connect(url,(err,client)=>{
    if(err) return console.log(err);
    db=client.db(dbname);
    console.log(`connected database: ${url}`);
    console.log(`Database:${dbname}`);
});

app.get('/hospital', middleware.checkToken, (req,res)=>{
    console.log("getting things ready");
    const data=db.collection("hospital").find().toArray()
    .then(result => res.json(result));
});

app.get('/ventilator', middleware.checkToken, (req,res)=>{
    console.log("getting things ready");
    const data=db.collection("ventilator").find().toArray()
    .then(result=>(res.json(result)));
});

app.post('/searchventilatorbystatus', middleware.checkToken, (req,res) => {
    const status = req.query.status;
    console.log(status);
    const ventilator=db.collection('ventilator')
    .find({"status":status}).toArray().then(result=>res.json(result));
});

app.post('/searchventilatorbyname', middleware.checkToken, (req,res) => {
    const name=req.query.name;
    console.log(name);
    const ventilator=db.collection('ventilators')
    .find({'name':new RegExp(name, 'i')}).toArray().then(result=>res.json(result));
});

app.post('/searchhospital', middleware.checkToken, (req,res) => {
    const name=req.query.name;
    console.log(name);
    const ventilator=db.collection('hospital')
    .find({'name':new RegExp(name, 'i')}).toArray().then(result=>res.json(result));
});

app.post('/addvent',(req,res)=>{
    const hId=req.query.hId;
    const ventilatorId=req.query.ventilatorId;
    const status=req.query.status;
    const name=req.query.name;
    console.log("adding ventilator, please wait a moment");
    const item={"hId":hId, "ventilatorId":ventilatorId, "status":status, "name":name};
    db.collection("ventilator").insertOne(item, function(err, result){
        res.json("inserted successfully");
    });
});

app.put('/updateventilator', middleware.checkToken, (req,res) => {
    const ventilatorId= {ventilatorId: req.query.ventilatorId};
    console.log(ventilatorId);
    const newvalues={$set: {status:req.query.status}};
    console.log("updating ventilator details, please wait a moment");
    db.collection("ventilator").updateOne(ventilatorId, newvalues, function(err, result){
        res.json('updated one document');
        if(err) throw err;
    });
});

app.delete('/deletevent', middleware.checkToken, (req,res) => {
    const ventilatorId=req.query.ventilatorId;
    console.log(ventilatorId);
    const temp={"ventilatorId":ventilatorId};
    db.collection("ventilators").deleteOne(temp, function(err,obj){
        if(err) throw err;
        res.json("deleted one element");
    });
});

app.get('/searchventilators',(req,res)=>{
    const status=req.query.status;
    const name=req.query.name;
    console.log("searching ventilators, please wait a moment");
    const data=db.collection("ventilator").find({"name":name},{"status":status}).toArray().then(result=>res.send(result));
    res.send("no hospital found :(");
});

app.listen(9000,(req,res)=>{
    console.log("working well");
});