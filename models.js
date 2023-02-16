const mongoose = require("mongoose");

//creates movie Schema
let movieSchema = mongoose.Schema({
    Title: {type: String, required: true},
    Genre: {
        Name: String,
        Description: String,
    },
    Director: {
        Name: String,
        Bio: String
    },
    Actors: [String],
    ImagePath: String,
    Featured: Boolean
});

//creates user Schema
let userSchema = mongoose.Schema({
    Username: {type: String, required: true},
    Password: {type: String, required: true},
    Email: {type: String, required: true},
    Birthday: Date,
    FavoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Movie" }]
});

//assigns schemas to model variables
let Movie = mongoose.model("Movie", movieSchema);
let User = mongoose.model("User", userSchema);

// exports models
module.exports.Movie = Movie;
module.exports.User = User;
