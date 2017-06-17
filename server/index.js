var server = require("./server");

var PORT = process.env.PORT;
console.log(`SERVER LISTENING ON PORT ${PORT}`);
server.listen(PORT);
