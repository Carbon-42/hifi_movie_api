const express = require('express'),
	morgan = require('morgan'),
	fs = require('fs'), 
	path = require('path'),
	bodyParser = require('body-parser'),
	uuid = require('uuid'),
	mongoose = require('mongoose'),
	Models = require('./models.js')
	Movies = Models.Movie;
	Users = Models.User;
	app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

let auth = require('./auth')(app);
const passport = require('passport');
require('./passport.js');

mongoose.set('strictQuery', false);
mongoose.connect('mongodb://localhost:27017/hifiDB', { useNewUrlParser: true, useUnifiedTopology: true});

// create a write stream (in append mode)
// a ‘log.txt’ file is created in root directory
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})

// setup the logger
app.use(morgan('combined', {stream: accessLogStream}));
app.use(express.static('public'));


//CREATE FUNCTIONS

// add new user
app.post('/users', (req, res) => {
	Users.findOne({ Username: req.body.Username})
	.then((user) => {
		if (user) {
			return res.status(400).send(req.body.Username + " already exists");
		} else {
			Users.create({
				Username: req.body.Username,
				Password: req.body.Password, 
				Email: req.body.Email,
				Birthday: req.body.Birthday
			})
			.then((user) => {res.status(201).json(user)})
			.catch((error) => {
				console.error(error);
				res.status(500).send("Error: " + error);
			})
		}
	})
	.catch((error) => {
		console.error(error);
		res.status(500).send("Error " + error);
	});
});

// add to favorite movies list
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
	Users.findOneAndUpdate({ Username: req.params.Username},
		{$push:
			{ FavoriteMovies: req.params.MovieID }
		},
	{new: true}, //this line makes sure that the updated document is returned
	(err, updatedUser) => {
		if (err) {
			console.error(err);
			res.status(500).send('Error ' + err);
		}	else {
			res.json(updatedUser);
		}
	});
});

//READ FUNCTIONS

// get Welcome message
app.get('/', (req, res) => {
	res.send('Welcome to HIFI MOVIE API!');
});

// get list of all movies
app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
	Movies.find()
		.then((Movies) => {
			res.status(201).json(Movies);
		})
		.catch((err) => {
			console.error(err);
			res.status(500).send('Error: ' + err);
		});
});

// get data on choosen movie
app.get('/movies/:Title', passport.authenticate('jwt', { session: false }), (req, res) => {
	Movies.findOne({Title: req.params.Title})
		.then((title) => {
			res.json(title);
		})
		.catch((err) => {
			console.error(err);
			res.status(500).send('Error: ' + err);
		});
});

// get data on all movies in choosen genre
app.get('/movies/genres/:genreName', passport.authenticate('jwt', { session: false }), (req, res) => {
	Movies.find({ 'Genre.Name': req.params.genreName})
		.then((movie) => {
			res.json(movie);
		})
		.catch((err) => {
			console.error(err);
			res.status(500).send('Error ' + err);
		});
});

// get data on movies by choosen director
app.get('/movies/directors/:directorName', passport.authenticate('jwt', { session: false }), (req, res) => {
	Movies.find({ "Director.Name": req.params.directorName})
		.then((director) => {
			res.json(director);
		})
		.catch((err) => {
			console.error(err);
			res.status(500).send('Error ' + err);
		});
});

// // get all users
app.get('/users', passport.authenticate('jwt', { session: false }), (req, res) => {
	Users.find()
		.then((users) => {
			res.status(201).json(users);
		})
		.catch((err) => {
			console.error(err);
			res.status(500).send('Error: ' + err);
		});
});

// // get user by username
app.get('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
	Users.findOne({ Username: req.params.Username})
		.then((user) => {
			res.json(user);
		})
		.catch((err) => {
			console.error(err);
			res.status(500).send('Error: ' + err);
		});
});


//UPDATE FUNCTIONS

// update a user's info, by username
app.put('/users/:username', passport.authenticate('jwt', { session: false }), (req, res) => {
	Users.findOneAndUpdate({ Username: req.params.username}, 
		{ $set: 
			{
			Username: req.body.Username,
			Password: req.body.Password,
			Email: req.body.Email,
			Birthday: req.body.Birthday
			}
		},
		{new: true}, // this line makes sure that the updated document is returned
		(err, updatedUser) => {
			if(err) {
				console.error(err);
				res.status(500).send('Error: ' + err);
			} else {
				res.json(updatedUser);
			}
		});
});


//DELETE FUNCTIONS

// remove from favorite movies list
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
	Users.findOneAndUpdate({ Username: req.params.Username},
		{$pull:
			{ FavoriteMovies: req.params.MovieID }
		},
	{new: true}, //this line makes sure that the updated document is returned
	(err, updatedUser) => {
		if (err) {
			console.error(err);
			res.status(500).send('Error ' + err);
		}	else {
			res.json(updatedUser);
		}
	});
});

// remove user
app.delete('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
	Users.findOneAndRemove({Username: req.params.Username})
		.then((user) => {
			if (!user) {
				res.status(400).send(req.params.Username + ' was not found');
			} else {
				res.status(200).send(req.params.Username + ' was deleted.');
			}
	})
	.catch((err) => {
		console.error(err);
		res.status(500).send('Error ' + err);
	});
});

//END OF ENDPOINTS LIST


app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).send('Something broke!');
});

app.listen(8080, () => {
	  console.log('Your app is listening on port 8080.');
});
