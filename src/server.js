var args = process.argv.splice(2);
var http = require('http');
var port = args[0];
var randomErrorResponse = function(res){
    res.statusCode = 500;
    res.writeHead(500, {'Content-Type' : 'text/plain'});
    res.end('Server error');
};
    var server = http.createServer(function (req, res) {
        var respond = function(){
            if (req.url == '/running'){
                res.writeHead(200, {'Content-Type' : 'text/plain'});
                res.end('Up and running');
                return;
            }
            var randomError = Math.random();
            console.log("randomError? " + randomError);
            if (randomError > 0.8){
                randomErrorResponse(res);
                return;
            }
            if (req.headers['balancer'] !== '1') {
                res.statusCode = 403;
                res.writeHead(403, {'Content-Type' : 'text/plain'});
                res.end(req.headers.balancer + ' Forbidden');
            } else {
                res.writeHead(200, {'Content-Type' : 'text/plain'});
                res.end('Port: ' + port + ' Data: 1234');
            }
        };
        var answer = Math.random();
        console.log("answer? " + answer);
        if (answer <= 0.8){
            respond();
        }
    });
    // Listen to a specified port
    //server.listen(ports.register('server'));
    server.listen(port);




