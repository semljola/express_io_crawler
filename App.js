var http = require('http'),
fs = require('fs'),

index = fs.readFileSync(__dirname + '/index.html');

var Crawler = require("simplecrawler");

var result="";

// Send index.html to all requests
var app = http.createServer(function(req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end(index);

//Change to url
var crawler = Crawler.crawl("http://localhost/");
crawler.timeout = 5000;
crawler.interval = 1000;
crawler.downloadUnsupported = false;
crawler.acceptCookies = true;
crawler.maxConcurrency = 1;

var conditionID = crawler.addFetchCondition(function(parsedURL) {

  if(parsedURL.path.match(/\.swf$/i)) {
        // found flash
        result =  result + ' ' +parsedURL.path;
      }

      return !(parsedURL.path.match(/\.css$/i) || 
        parsedURL.path.match(/\.pdf$/i) ||
        parsedURL.path.match(/\.ico$/i) ||
        parsedURL.path.match(/\.jpg$/i) ||
        parsedURL.path.match(/\.png$/i) ||
        parsedURL.path.match(/\.gif$/i)); 
    }, function(err){console.log(err);});

crawler.on("fetchcomplete",function(queueItem){
    //io.socket.emit('finding', { message: 'fetchcomplete' });
  });

crawler.on("fetchdataerror",function(queueItem){
  console.log(crawler.queue.length);
});

crawler.start();

//end crawler


});

// Socket.io server listens to our app
var io = require('socket.io').listen(app);

// Send current time to all connected clients
function sendTime() {
  io.sockets.emit('time', { 'time': new Date().toJSON(), 'kalle':result });
}

// Send current time every 10 secs
setInterval(sendTime, 10000);

// Emit welcome message on connection
io.sockets.on('connection', function(socket) {
    // Welcome message before the crawler starts
    socket.emit('welcome', { message: 'Simple crawler starts...!' });
    socket.on('i am client', console.log);
  });

app.listen(3000);



