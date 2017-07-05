var config = require('./config.js'),
    serverInstance = require('./server'),
    i,
    servers = config.servers;

console.log(servers.length);
for (i = 0; i < servers.length; i++) {
    require('child_process').spawn('sh', ['spawnSingleServer.sh', servers[i].port], {stdio: 'inherit'});
    //serverInstance.createServer(servers[i].port);
}
