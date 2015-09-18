var express = require('express');
var app = express();

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));

app.get('/', function(request, response) {
  console.log('Node app is running on port', app.get('port'));
  response.send('<html><head><script>alert("hello world ");</script></head><body>Hello World!</body></html>');
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
