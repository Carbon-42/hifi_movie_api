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
app.post('/users/:Username/movies/:MovieID', (req, res) => {
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
app.get('/movies', (req, res) => {
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
// app.get('/movies/:title', (req, res) => {
// 	const title = req.params.title;
// 	const movie = movies.find( movie => movie.title === title);

// 	if (!movie) {
// 		const message = 'This movie is not in our database. Please try another.'
// 		res.status(400).send(message);
// 	}	else {
// 		res.status(200).json(movie);	
// 	}
// });

app.get('/movies/:title', (req, res) => {
	Movies.findOne({ Title: req.params.Title})
		.then((title) => {
			res.json(title);
			console.log(title);
		})
		.catch((err) => {
			console.error(err);
			res.status(500).send('Error: ' + err);
		});
});

// get data on all movies in choosen genre
app.get('/movies/:genrename', (req, res) => {
	Movies.find({ "Genre.name": req.params.genrename})
		.then((genre) => {
			res.json(genre);
		})
		.catch((err) => {
			console.error(err);
			res.status(500).send('Error ' + err);
		});

	// const genrename = req.params.genrename;
	// const genre = movies.filter( movie => movie.genre === genrename);

	// if (genre.length < 1) {
	// 	const message = 'This genre is not in our database. Please try another.'
	// 	res.status(400).send(message);
	// }	else {
	// 	res.status(200).json(genre);	
	// }
});

// get data on movies by choosen director
app.get('/movies/:directorName', (req, res) => {
	Movies.find({ "Director.name": req.params.directorName})
		.then((director) => {
			res.json(director);
		})
		.catch((err) => {
			console.error(err);
			res.status(500).send('Error ' + err);
		});
	
	// const directorName = req.params.directorName;
	// const director = movies.filter( movie => movie.director === directorName);

	// if (director.length < 1) {
	// 	const message = 'This Director is not in our database. Please try another.'
	// 	res.status(400).send(message);
	// }	else {
	// 	res.status(200).json(director);	
	// }
});

// // get all users
app.get('/users', (req, res) => {
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
app.get('/users/:Username', (req, res) => {
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
app.put('/users/:username', (req, res) => {
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
app.delete('/users/:Username/movies/:MovieID', (req, res) => {
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
app.delete('/users/:Username', (req, res) => {
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
