var express = require('express');
var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
const { validate, ValidationError, Joi } = require('express-validation')
//var bodyParser = require('body-parser')


io.set('origins', '*:*');

app.use(express.json());       // to support JSON-encoded bodies
app.use(express.urlencoded()); // to support URL-encoded bodies
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.use(function(err, req, res, next) {
  if (err instanceof ValidationError) {
    return res.status(err.statusCode).json(err)
  }

  return res.status(500).json(err)
})


const msgSchema = Joi.object({
  msg: Joi.string().required(),
  uuid: Joi.string().required()
});

const msgSchemaAll = Joi.object({
  msg: Joi.string().required()
})

app.post('/makemessage', async (req,res,next )=>{
  try {

    const value = await msgSchema.validateAsync(req.body);
    var msg = req.body.msg;
    var uuid = req.body.uuid;
    io.to(uuid).emit('message',msg);
    res.json(value);
  }
  catch (err) {
    next(err);
  }
});

app.post('/makemessage-all', async (req,res, next )=>{
  try {
    const value = await msgSchemaAll.validateAsync(req.body);
    var msg = req.body.msg;
    io.emit('message',msg);
    res.json(value);
  }
  catch (err) {
    next(err);
  }
});

io.on('connection', function(socket){
  var id = socket.id;
  console.log("ID: " + id);
  io.to(id).emit("message", "Initialized");
})

http.listen(3001, () => {
  console.log('listening on *:3001');
});
