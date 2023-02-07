const express = require('express'),
	morgan = require('morgan'),
	fs = require('fs'), 
	path = require('path'),
	bodyParser = require('body-parser'),
	uuid = require('uuid')

const app = express();
app.use(bodyParser.json());

// create a write stream (in append mode)
// a ‘log.txt’ file is created in root directory
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})

// setup the logger
app.use(morgan('combined', {stream: accessLogStream}));
app.use(express.static('public'));

// get Welcome message
app.get('/', (req, res) => {
	res.send('Welcome to HIFI MOVIE API!');
});

// get list of all movies
app.get('/movies', (req, res) => {
	res.status(200).json(movies);
});

// get data on choosen movie
app.get('/movies/:title', (req, res) => {
	const title = req.params.title;
	const movie = movies.find( movie => movie.title === title);

	if (!movie) {
		const message = 'This movie is not in our database. Please try another.'
		res.status(400).send(message);
	}	else {
		res.status(200).json(movie);	
	}
});

// get data on all movies in choosen genre
app.get('/movies/genres/:genrename', (req, res) => {
	const genrename = req.params.genrename;
	const genre = movies.filter( movie => movie.genre === genrename);

	if (genre.length < 1) {
		const message = 'This genre is not in our database. Please try another.'
		res.status(400).send(message);
	}	else {
		res.status(200).json(genre);	
	}
});

// get data on movies by choosen director
app.get('/movies/directors/:directorName', (req, res) => {
	const directorName = req.params.directorName;
	const director = movies.filter( movie => movie.director === directorName);

	if (director.length < 1) {
		const message = 'This Director is not in our database. Please try another.'
		res.status(400).send(message);
	}	else {
		res.status(200).json(director);	
	}
});

// add new user
app.post('/users', (req, res) => {
	const newUser = req.body;

	if (newUser.name) {
		newUser.id = uuid.v4();
		users.push(newUser);
		res.status(201).json(newUser);
	} else {
		const message = 'Missing "name" in request body';
	  	res.status(400).send(message);
	}})

// update username by id
app.put('/users/:id/:name', (req, res) => {
    const userid = users.find((userid) => { return userid.id === req.params.id} );

	if (userid) {
        userid.name = req.params.name;
        res.status(200).send('Your username has been updated to ' + userid.name);
		console.log(userid)
    } else {
        res.status(400).send('no such user')
    }
})

// add to favorite movies list
app.post('/users/:id/:movietitle', (req, res) => {
	const movietitle = req.params.movietitle;
	const userid = users.find((userid) => { return userid.id === req.params.id} );

    if (userid) {
        userid.favoriteMovies.push(movietitle);
        res.status(200).json(movietitle + ' has been added to ' + userid.name + "'s" + ' favorite movies! Here is your current list: '  + userid.favoriteMovies);
    } else {
        res.status(400).send('no such user');
    }
})

// remove from favorite movies list
app.delete('/users/:id/:movietitle', (req, res) => {
	const userid = users.find((userid) => { return userid.id === req.params.id} );

    if (userid) {
		const movietitle = req.params.movietitle;
		const listTitle = userid.favoriteMovies.includes(movietitle);

		if (listTitle) {
			userid.favoriteMovies = userid.favoriteMovies.filter( title => title !== movietitle);
			res.status(200).json(movietitle + ' has been removed from ' + userid.name + "'s" + ' favorite movies! Here is your current list: '  + userid.favoriteMovies);
		} else {
			res.status(400).send(movietitle + ' is not in ' + userid.name + "'s" + ' list of favorite movies. Here is your current list: '  + userid.favoriteMovie);
		}
    } else {
        res.status(400).send('no such user')
    }
})

// remove user
app.delete('/users/:id', (req, res) => {
	const userid = users.find((userid) => { return userid.id === req.params.id});

	if (userid) {
		users = users.filter((user) => { return user.id !== req.params.id});
		res.status(201).send(userid.name + "'s account has been deleted.");
	} else {
		res.status(400).send('User not found. Please try again.');
	}
})

let users = [
	{
		id: '001',
		name: 'Brad',
		favoriteMovies: []
	},
	{
		id: '002',
		name: 'Christopher',
		favoriteMovies: ['Die Hard', 'Strange']
	},
	{
		id: '003',
		name: 'Danielle',
		favoriteMovies: []
	},
];

let movies = [
	{
		title: 'High Fidelity',
		genre: 'Comedy',
		staring: 'John Cusack',
		director: 'Stephen Frears',
	},
	{
		title: 'Amélie',
		genre: 'Drama',
		staring: 'Audrey Tautou',
		director: 'Jean-Pierre Jeunet',
	},
	{
		title: 'The Life Aquatic with Steve Zissou',
		genre: 'Comedy',
		staring: 'Bill Murray',
		director: 'Wes Anderson',
	},
	{
		title: 'The Fellowship of the Ring',
		genre: 'Adventure',
		staring: 'Elijah Wood, Viggo Mortensen, Ian McKellan',
		director: 'Peter Jackson',
	},
	{
		title: 'Guardians of the Galaxy',
		genre: 'Action',
		staring: 'Chris Pratt, Zoe Zaldana',
		director: 'James Gunn',
	},
	{
		title: 'The Matrix',
		genre: 'Action',
		staring: 'Keanu Reeves, Carrie-Anne Moss',
		director: 'Lana Wachowski, Lilly Wachowski',
	},
	{
		title: 'Newsies',
		genre: 'Musical',
		staring: 'Christan Bale',
		director: 'Kenny Ortega',
	},
	{
		title: 'Reservoir Dogs',
		genre: 'Crime',
		staring: 'Harvey Keitel, Tim Roth',
		director: 'Quentin Tarantino',
	},
	{
		title: 'The Sandlot',
		genre: 'Family',
		staring: 'Tom Guiry, James Earl Jones',
		director: 'David Mickey Evans',
	},
	{
		title: 'The Three Caballeros',
		genre: 'Family',
		staring: 'Aurora Miranda, Clarence Nash',
		director: 'Norman Ferguson, Harold Young',
	},	  
];

app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).send('Something broke!');
});

app.listen(8080, () => {
	  console.log('Your app is listening on port 8080.');
});
