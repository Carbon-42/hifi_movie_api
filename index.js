const express = require('express'),
	morgan = require('morgan'),
	fs = require('fs'), 
	path = require('path');

const app = express();

// create a write stream (in append mode)
// a ‘log.txt’ file is created in root directory
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})

// setup the logger
app.use(morgan('combined', {stream: accessLogStream}));
app.use(express.static('public'));

app.get('/movies', (req, res) => {
	res.json(topTenMovies);
});

app.get('/', (req, res) => {
	res.send('Welcome to HIFI MOVIE API!');
});

let topTenMovies = [
	{
		title: 'High Fidelity',
		staring: 'John Cusack',
		director: 'Stephen Frears',
	},
	{
		title: 'Amélie',
		staring: 'Audrey Tautou',
		director: 'Jean-Pierre Jeunet',
	},
	{
		title: 'The Life Aquatic with Steve Zissou',
		staring: 'Bill Murray',
		director: 'Wes Anderson',
	},
	{
		title: 'The Fellowship of the Ring',
		staring: 'Elijah Wood, Viggo Mortensen, Ian McKellan',
		director: 'Peter Jackson',
	},
	{
		title: 'Guardians of the Galaxy',
		staring: 'Chris Pratt, Zoe Zaldana',
		director: 'James Gunn',
	},
	{
		title: 'The Matrix',
		staring: 'Keanu Reeves, Carrie-Anne Moss',
		director: 'Lana Wachowski, Lilly Wachowski',
	},
	{
		title: 'Newsies',
		staring: 'Christan Bale',
		director: 'Kenny Ortega',
	},
	{
		title: 'Reservoir Dogs',
		staring: 'Harvey Keitel, Tim Roth',
		director: 'Quentin Tarantino',
	},
	{
		title: 'The Sandlot',
		staring: 'Tom Guiry, James Earl Jones',
		director: 'David Mickey Evans',
	},
	{
		title: 'The Three Caballeros',
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
