'use strict';
var fs = require("fs");
var exec = require("child_process").exec;
fs.readdir("./public/js/", function(err, files){
    if(err) throw err;
    files.forEach(function(file){
        if(file.split('.')[1]=="js"){
            console.log(file);
            var str = "uglifyjs -c -m -o ./public/js/min/" + file + " ./public/js/" + file;
            console.log(str);
            exec(str, function(err, stdout, stderr){
                if(err) throw err;
                console.log(stdout);
                console.log(stderr);
            })
        }
    })
})
