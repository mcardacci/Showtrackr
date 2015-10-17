var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var async = require('async');
var request = require('request');
var xml2js = require('xml2js');
var _ = require('lodash');

var app = express();

var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

// User and Show schemas using mongoose
var showSchema = new mongoose.Schema({
	_id: Number,
	name: String,
	airsDayOfWeek: String,
	airsTime: String,
	firstAired: Date,
	genre: [String],
	network: String,
	overview: String,
	rating: Number,
	ratingCount: Number,
	status: String,
	poster: String,
	subscribers: [{
		type: mongoose.Schema.Types.ObjectId, ref: 'User'
	}],
	episodes: [{
		season: Number,
		episodeNumber: Number,
		episodeName: String,
		firstAired: Date,
		overview: String
	}]
});

var userSchema = new mongoose.Schema({
	email: { type: String, unique: true },
	password: String
});

//before save actions
userSchema.pre('save', function(next) {
	var user = this;
	if (!user.isModified('password')) return next();
	bcrypt.genSalt(10, function(err, salt) {
		if (err) return next(err);
		bcrypt.hash(user.password, salt, function(err, hash) {
			user.password = hash;
			next();
		});
	});
});

userSchema.methods.comparePassword = function(candidatePassword, cb) {
	bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
		if (err) return cb(err);
		cb(null, isMatch);
	});
};

var User = mongoose.model('User', userSchema);
var Show = mongoose.model('Show', showSchema);

mongoose.connect('localhost');


//Express middlewares
app.set('port', process.env.PORT || 3000);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//APP ROUTES
app.get('/api/shows', function(req, res, next) {
	var query = Show.find();
	if (req.query.genre) {
		query.where({ genre: req.query.genre });
	} else if (req.query.alphabet) {
		query.where({ name: new RegExp('^' + '[' + req.query.alphabet + ']', 'i') });
	} else {
		query.limit(12);
	}
	query.exec(function(err, shows) {
		if (err) return next(err);
		res.send(shows);
	})
});

app.get('/api/shows/:id', function(req, res, next) {
	Show.findById(req.params.id, function(err, show) {
		if (err) return next(err);
		res.send(show);
	});
});

app.post('/api/shows', function(req, res, next) {
	var apiKey = '9EF1D1E7D28FDA0B';
	//xml2js parser is configured to normalize all tags to lowercase and disable conversion 
	//to arrays when there is only one child element
	var parser = xml2js.Parser({
		explicitArray: false,
		normalizeTags: true
	});
	var seriesName = req.body.showname
		.toLowerCase()
		.replace(/ /g, '_')
		.replace(/[^\w-]+/g, '');

	async.waterfall([
		function(callback) {
			//get the Show Id given the Show Name
			request.get('http://thetvdb.com/api/GetSeries.php?seriesname=' + seriesName, function(error, response, body) {
				if (error) return next(error);
				parser.parseString(body, function(err, result) {
					if (!result.data.series) {
						return res.send(404, { message: req.body.showgitName + ' was not found.' });
					}
					var seriesId = result.data.series.seriesid || result.data.series[0].seriesid;
					callback(err, seriesId);
				});
			});
		},
		// Get the Show information using the seriesId from the previous function
		function(seriesId, callback) {
			request.get('http://thetvdb.com/api/' + apiKey + '/series/' + seriesId + '/all/en.xml', function(error, response, body) {
				if (error) return next(error);
				parser.parseString(body, function(err, result) {
					var series = result.data.series;
					var episodes = result.data.episode;
					var show = new Show({
						_id: series.id,
            name: series.seriesname,
            airsDayOfWeek: series.airs_dayofweek,
            airsTime: series.airs_time,
            firstAired: series.firstaired,
            genre: series.genre.split('|').filter(Boolean),
            network: series.network,
            overview: series.overview,
            rating: series.rating,
            ratingCount: series.ratingcount,
            runtime: series.runtime,
            status: series.status,
            poster: series.poster,
            episodes: []
					});
					//for each show:
					_.each(episodes, function(episode) {
						show.episodes.push({
							season: episode.seasonnumber,
              episodeNumber: episode.episodenumber,
              episodeName: episode.episodename,
              firstAired: episode.firstaired,
              overview: episode.overview
						});
					});
					callback(err, show);
				});
			});
		},
		//Convert the poster image to Base64 and assign it to show.poster
		function(show, callback) {
			var url = 'http://thetvdb.com/banners/' + show.poster;
			request({ url: url, encoding: null }, function(error, response, body) {
				show.poster = 'data:' + response.headers['content-type'] + ';base64,' + body.toString('base64');
				callback(error, show);
			});
		}
		//pass the show object to the final callback function and save it to the database
	], function(err, show) {
		if (err) return next(err);
		show.save(function(err) {
			if (err) {
				//11000 is the duplicate key error bc we can't have duplicate _id fields in Mongo
				if (err.code === 11000) {
					//409 is an http status code
					return res.send(409, { message: show.name + ' already exists.' });
				}
				return next(err);
			}
			res.send(200);
		});
	});
});

//This is a hack for HTML5pushState on client-side. 
//It is a redirect route that prevents a 404.
//You must add this after all your other routes. 
//The '*' is a wild card that matches any route you type.
app.get('*', function(req, res) {
	res.redirect('/#' + req.originalUrl);
})

//When an error occurs a stack trace is output in the console and error message is returned
app.use(function(err, req, res, next) {
	console.error(err.stack);
	res.send(500, { message: err.message });
});

app.listen(app.get('port'), function() {
	console.log('Express server listeniing on port ' + app.get('port'));
});












