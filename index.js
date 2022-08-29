var colors = require('colors');
var moment = require('moment');
const ips = [];
function mainconsole_info(text)
{
  console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] [Server/INFO] ${text}`)
}
function mainconsole_warn(text)
{
  console.warn(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] [Server/WARN] ${text}`.yellow)
}
function mainconsole_error(text)
{
  console.error(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] [Server/ERROR] ${text}`.red)
}

mainconsole_info("IMPORTING EXPRESS...")
var express = require('express');
mainconsole_info("IMPORTING CONFIG...")
var config = require('./config.json')
var version = require('./version.json')
mainconsole_info("LOADING EXPRESS...")
var app = express();
mainconsole_info("LOADING FS...")
const fs = require('fs')
mainconsole_info("IMPORTING RATE LIMITER...")
const rateLimit = require('express-rate-limit');
const { emitWarning } = require('process');
mainconsole_info("LOADING RATE LIMITER...")
const limiter = rateLimit({
	windowMs: config.cooldown * 60 * 1000, // 1 minutes (Follow from config.)
	max: config.maxrequest, // Limit each IP to 500000 requests per `window` (here, per 1 minutes) (Follow from config)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: async (request, response) => {
    if (ips.includes(request.ip)){
      // nothing
    } else {
      ips.push(request.ip);
    }
		request.destroy();
	},
})
mainconsole_info(`____  __ __  ____       __ __   ___   _____ ______  ____  ____     ___  ____  `);
mainconsole_info('|    \|  |  ||    \     |  |  | /   \ / ___/|      ||    ||    \   /  _]|    \ ');
mainconsole_info('|  o  )  |  ||  o  )    |  |  ||     (   \_ |      | |  | |  _  | /  [_ |  D  )');
mainconsole_info('|   _/|  _  ||   _/     |  _  ||  O  |\__  ||_|  |_| |  | |  |  ||    _]|    / ');
mainconsole_info('|  |  |  |  ||  |       |  |  ||     |/  \ |  |  |   |  | |  |  ||   [_ |    \ ');
mainconsole_info(`|  |  |  |  ||  |       |  |  ||     |\    |  |  |   |  | |  |  ||     ||  .  \\`)
mainconsole_info('|__|  |__|__||__|       |__|__| \___/  \___|  |__|  |____||__|__||_____||__|\_|');
mainconsole_info(`                                                                               `);
mainconsole_info("PHP HOSTINGER FOR NODEJS (EXPRESS) Read more at https://github.com/FuseJustDev/PHP-HOSTINGER")
mainconsole_info("PHP HOSTINGER NOW RUNNING WITH VERSION 1.0 BETA 3!")
mainconsole_info("For update, reading changelog.txt!")
mainconsole_info("Checking Config....")
  if (fs.existsSync(config['php-path'])) {
    mainconsole_info(config['php-path'] + " IS EXIST, PASS!");
  }
  else{
    mainconsole_warn("WARNING: PHP PATH in not found, make sure you did edit path in config.json.")
    mainconsole_error("Checking config for php-path is FAILED! (UNLOADING...)")
    process.exit();
  }
  var command = `${config['php-path']} -v`
  let phpversion;
  const exec = require('child_process').exec

  exec(command, (err, stdout, stderr) => phpversion = stdout)
// must specify options hash even if no options provided!
const http = require('https');
mainconsole_info("CHECKING VERSION FROM GITHUB REPO...");
const file = fs.createWriteStream("cache.json");
const request = http.get("https://raw.githubusercontent.com/FuseJustDev/PHP-HOSTINGER/main/version.json", function(response) {
   response.pipe(file);
   file.on("finish", () => {
    file.close();
    var cachever = require("./cache.json");
    if (cachever.VERSION == version.VERSION){
      mainconsole_info('This server is up-to-date')
    }
    else{
      mainconsole_warn('This server is NOT up-to-date, please update from lastest github repo.')
    }
   });
});
mainconsole_info("ENABLEING USER INPUT...")
var stdin = process.openStdin();
stdin.addListener("data", function(d) {
let input = d.toString().trim();
if (input === 'stop'){
  mainconsole_info("Unloading server...");
  process.exit();
}
else if (input === 'blockipslist'){
  let amountips = 0;
  ips.forEach(element => {
    amountips++;
  });
  mainconsole_info(`List of block ip due to spam packet or dos\n${ips}\nAmount of IP: ${amountips}`)
} else if (input === 'version'){

mainconsole_info(`\nPHP HOSTINGER VERSION: ${version.VERSION}\nPHP INFO: ${phpversion}`)
} else if (input === "status"){
  var os = require('os-utils');


os.cpuUsage(function(v){
  mainconsole_info( 'CPU Usage (%): ' + v );
  mainconsole_info("Memory: " + os.freemem() + "MB of " + os.totalmem() + "MB");
});
if (config['anti-redirect-ip'] == true){
  var http = require('http');
var start = new Date();
http.get({host: `${config.domain}`, port: 80}, function(res) {
  let time = new Date() - start;
  mainconsole_info(`Request took: ${time} ms`);
});
} else{
  var http = require('http');
  var start = new Date();
  http.get({host: `localhost`, port: 80}, function(res) {
    let time = new Date() - start;
    mainconsole_info(`Request took: ${time} ms`);
  });
}
}else if (input === 'help'){
  mainconsole_info('\nstop - stop the server\nblockipslist - check a blacklist ip are blocked from spam or dos attack\nversion - check version of server and php\nstatus - check server status');
}else
mainconsole_warn(`Command: ${input} been not found!`)
});
mainconsole_info("LOADING PHP-EXPRESS MODEL...")
var phpExpress = require('php-express')({

  // assumes php is in your PATH
  binPath: config['php-path']
});
app.use(limiter)
app.use((req, res, next) => {
  if (config['anti-redirect-ip'] === true){
    if (config.domain === req.get('host')){
      next();
    } else {
      req.destroy();
    }
  } else
next();
})
// set view engine to php-express
app.set('views', './index');
app.engine('php', phpExpress.engine);
app.set('view engine', 'php');

// routing all .php file to php-express
app.all(/.+\.php$/, phpExpress.router);
app.use(express.static(__dirname + `${config.indexfolder}`));

// Writing EXPRESS Code here!

app.get('/', (req, res) => {
    res.redirect('/' + config['default-index']);
});

app.get('*', function(req, res) {
  res.status(404);
  res.sendfile(config['default-404'], {root: __dirname + config.indexfolder});
});

var server = app.listen(80, function () {
  var host = server.address().address;
  var port = server.address().port;
  mainconsole_info('PHPExpress app listening at http://localhost', host, port);
});
