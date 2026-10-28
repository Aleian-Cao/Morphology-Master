const uuid = require("uuid");
console.log("uuid.v6:", uuid.v6);
if(uuid.v6) console.log("value:", uuid.v6({ clockseq: -2 }));
