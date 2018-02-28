var os = require("os");
var ffmpeg = require("fluent-ffmpeg");
var path = require("path");
var proc = new ffmpeg({ source: "./audio.webm", nolog: true })
    .toFormat("mp3")
    .on("end", function() {
        console.log("file has been converted successfully");
    })
    .on("error", function(err) {
        console.log("an error happened: " + err.message);
    })
    .saveToFile(path.join(__dirname + "audio.mp3"));
