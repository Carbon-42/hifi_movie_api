const mongoose = require("mongoose"),
    bcrypt = require('bcrypt');

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
    username: {type: String, required: true},
    password: {type: String, required: true},
    email: {type: String, required: true},
    birthday: Date,
    favoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Movie" }]
});

userSchema.statics.hashPassword = (password) => {
    return bcrypt.hashSync(password, 10);
};

userSchema.methods.validatePassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

//assigns schemas to model variables
let Movie = mongoose.model("Movie", movieSchema);
let User = mongoose.model("User", userSchema);

// exports models
module.exports.Movie = Movie;
module.exports.User = User;
