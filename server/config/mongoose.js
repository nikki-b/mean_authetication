var mongoose = require("mongoose");
var fs = require("fs");

// connect to mongodb
var db = "user_auth" 
mongoose.connect("mongodb://localhost/"+db);

// load all models
var models_path = __dirname + "/../models";
fs.readdirSync(models_path).forEach(function(file){
	if(file.indexOf(".js")>0){
		require(models_path + "/" + file);
	}
});