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

const { check, validationResult } = require('express-validator');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

const cors = require('cors');
let allowedOrigins = ['http://localhost:8080', 'https://hifi-movie-api.onrender.com/', 'https://hifimovies.netlify.app'];

app.use(cors({
	orign: (origin, callback) => {
		if(!origin) return callback(null, true);
		if(allowedOrigins.indexOf(origin) === -1) {
			//if a specific origin isn't found on the list of allowed origins
			let message = "The CORS policy for this application doesn't allow access from origin" + origin;
			return callback(new Error(message ), false);
		}
		return callback(null, true);
	}
}));

let auth = require('./auth')(app);
const passport = require('passport');
require('./passport.js');

mongoose.set('strictQuery', false);
// mongoose.connect('mongodb://localhost:27017/hifiDB', { useNewUrlParser: true, useUnifiedTopology: true});
mongoose.connect(process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true});

// create a write stream (in append mode)
// a ‘log.txt’ file is created in root directory
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})

// setup the logger
app.use(morgan('combined', {stream: accessLogStream}));
app.use(express.static('public'));


//CREATE FUNCTIONS

// add new user
app.post('/users',
	// Validation logic here for request
	//you can either use a chain of methods like .not().isEmpty()
	// which means "opposite of isEmpty" in plain english "is not empty"
	//or use .isLength({min: 5}) which means minimum value of 5 characters are only allowed
	[
		check('username', 'username is required').isLength({min: 5}),
		check('username', 'username contains non alphanumeric characters - not allowed.').isAlphanumeric(), 
		check('password', 'password is required').not().isEmpty(),
		check('email', 'email does not appear to be valid').isEmail()
	], (req, res) => {
		
		//check the validation objet for errors
		let errors = validationResult(req);

		if(!errors.isEmpty()) {
			return res.status(422).json({ errors: errors.array() });
		}
	
	let hashPassword = Users.hashPassword(req.body.password);

	Users.findOne({ username: req.body.username})
	.then((user) => {
		if (user) {
			return res.status(400).send(req.body.username + " already exists");
		} else {
			Users.create({
				username: req.body.username,
				password: hashPassword, 
				email: req.body.email,
				birthday: req.body.birthday
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

//add new movie to database
app.post('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
	Movies.findOne({ title: req.body.title})
	.then((title) => {
		if (title) {
			return res.status(400).send(req.body.title + " already exists");
		} else {
			Movies.create({
				title: req.body.title,
				description: req.body.description, 
				genre: {
					name: req.body.genreName,
					description: req.body.genreDescription,
				},
				director: {
					name: req.body.directorName,
					bio: req.body.directorBio,
				},
				image: req.body.imagePath,
				featured: req.body.featured
			})
			.then((title) => {res.status(201).json(title)})
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
app.post('/users/:username/movies/:movieID', passport.authenticate('jwt', { session: false }), (req, res) => {
	Users.findOneAndUpdate({ username: req.params.username},
		{$push:
			{ favoriteMovies: req.params.movieID }
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
app.get('/movies/:title', passport.authenticate('jwt', { session: false }), (req, res) => {
	Movies.findOne({title: req.params.title})
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
	Movies.find({ 'genre.name': req.params.genreName})
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
	Movies.find({ "director.name": req.params.directorName})
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
app.get('/users/:username', passport.authenticate('jwt', { session: false }), (req, res) => {
	Users.findOne({ username: req.params.username})
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
app.put('/users/:username', 
	[
		check('username', 'username is required').isLength({min: 5}),
		check('username', 'username contains non alphanumeric characters - not allowed.').isAlphanumeric(), 
		check('password', 'password is required').not().isEmpty(),
		check('email', 'email does not appear to be valid').isEmail()
	],
	passport.authenticate('jwt', { session: false }), (req, res) => {
		//check the validation object for errors
		let errors = validationResult(req);

		if(!errors.isEmpty()) {
			return res.status(422).json({ errors: errors.array() })
		}
	
	let hashPassword = Users.hashPassword(req.body.password);

	Users.findOneAndUpdate({ username: req.params.username}, 
		{ $set: 
			{
			username: req.body.username,
			password: hashPassword,
			email: req.body.email,
			birthday: req.body.birthday
			}
		},
		{new: true}, // this line makes sure that the updated document is returned
		(err, updatedUser) => {
			if(err) {
				console.error(err);
				res.status(500).send('Error: ' + err);
			} else {
				res.json(updatedUser);
				console.log(updatedUser);
			}
		});
});


//DELETE FUNCTIONS

// remove from favorite movies list
app.delete('/users/:username/movies/:movieID', passport.authenticate('jwt', { session: false }), (req, res) => {
	Users.findOneAndUpdate({ username: req.params.username},
		{$pull:
			{ favoriteMovies: req.params.movieID }
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
app.delete('/users/:username', passport.authenticate('jwt', { session: false }), (req, res) => {
	Users.findOneAndRemove({username: req.params.username})
		.then((user) => {
			if (!user) {
				res.status(400).send(req.params.username + ' was not found');
			} else {
				res.status(200).send(req.params.username + ' was deleted.');
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

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
	  console.log('Listening on Port ' + port);
});