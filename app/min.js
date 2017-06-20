var fs = require("fs"),
async = require("async"),
uglifyJs = require("uglify-js"),
CleanCSS = require("clean-css");
function minify(req, res){
  var files = req.query.files.split(",");
  var ext = files[0].split(".")[1];
  if(ext=='js'){
    jsMinify(files, res);
  } else{
    cssMinify(files, res);
  }
}
function jsMinify(files, res){
  var fileContents = "";
  async.eachSeries(files, function(filename, callback){
    fs.readFile("./public/js/"+filename, function(err, content){
      if(err){
        console.log(err);
        res.end();
        return;
      }
      fileContents+=content;
      callback(err)
    });
  }, function(err){
    var result = uglifyJs.minify(fileContents);
    console.log(result.error);
    res.writeHead(200, {'Content-Type': 'text/javascript'});
    res.end(result.code);
  });
}
function cssMinify(files, res){
  var fileContents = "";
  async.eachSeries(files, function(filename, callback){
    fs.readFile("./public/css/"+filename, function(err, content){
      if(err){
        console.log(err);
        res.end();
        return;
      }
      fileContents+=content;
      callback(err);
    });
  }, function(err){
    var options = {
      level: 2
    };
    var result = new CleanCSS(options).minify(fileContents).styles;
    res.writeHead(200, {"Content-Type": "text/css"});
    res.end(result);
  });
}
module.exports = {
  minify: minify
}
