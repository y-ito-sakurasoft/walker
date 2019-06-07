var fs = require("fs");
var server = require("http").createServer(function (req, res) {
    var url = req.url;
    var tmp = url.split('.');
    var ext = tmp[tmp.length - 1];
    var path = '.' + url;
    console.log(path);
    switch(ext) {
        case 'js':
            res.writeHead(200, { "Content-Type": "text/javascript" });
            break;
        case 'png':
            res.writeHead(200, { "Content-Type": "image/png" });
            break;
        case 'jpeg':
            res.writeHead(200, { "Content-Type": "image/jpeg" });
            break;
        case 'jpg':
            res.writeHead(200, { "Content-Type": "image/jpeg" });
            break;
        case '/':
            res.writeHead(200, { "Content-Type": "text/html" });
            path = __dirname + '/index.html';
            break;
    }
    var output = fs.readFileSync(path);
    res.end(output);
}).listen(3000);
var io = require("socket.io").listen(server);

var users = {};

io.sockets.on("connection", function (socket) {

    socket.on("init", function () {
        io.to(socket.id).emit("init", users);
    });
    socket.on("connected", function (name) {
        users[socket.id] = {
            name: name,
            pos: [0.0, 0.0, 0.0],
            rot: [0.0, 0.0, 0.0],
            color: [Math.random(), Math.random(), Math.random()],
            roughness: Math.random(),
            metalness: Math.random(),
        };
        io.emit("message", name + " さんが入室しました");
        io.emit("connected", users[socket.id]);
    });

    socket.on("message", function (msg) {
        io.emit("message", msg);
    });

    socket.on("update", function (data) {
        if (users[socket.id]) {
            users[socket.id].pos = data.pos;
            users[socket.id].rot = data.rot;
        }
    });

    socket.on("disconnect", function () {
        if (users[socket.id]) {
            var name = users[socket.id].name;
            delete users[socket.id];
            io.emit("message", name + " さんが退室しました");
            io.emit("disconnect", name);
        }
    });
});

setInterval(() => {
    io.emit("update", users);
}, 17);