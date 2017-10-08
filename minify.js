"use strict";
const fs = require("fs");
const exec = require("child_process").exec;

fs.readdir("./public/js/", (err, files) => {
    if(err) {
        throw err;
    }
    files.forEach((file) => {
        if(file.split(".")[1]==="js"){
            console.log(file);
            const str = `uglifyjs -c -m -o ./public/js/min/${ file } ./public/js/${ file}`;

            console.log(str);
            exec(str, (err, stdout, stderr) => {
                if(err) {
                    throw err;
                }
                console.log(stdout);
                console.log(stderr);
            });
        }
    });
});
