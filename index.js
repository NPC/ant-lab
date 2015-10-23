var express = require('express');
var app = express();
var config = require('./config.js');
var telegram = require('./lib/telegram');

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index');
});

app.get('/' + config.bot_invocation_path, function(request, response) {
  console.log('\n\n--=== Telegram Instagram Bot triggered at ' + new Date().toISOString() + ' ===--');
  telegram.runInstagramBot();
  response.render('pages/trigger'); // TODO: Render something useful? Pass response obj into .getAlphaTopic()
});

app.listen(app.get('port'), function() {
  console.log('Node app running on port', app.get('port'));
});


