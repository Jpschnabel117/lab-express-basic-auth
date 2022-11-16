const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the user model to whatever makes sense in this case
const userSchema = new Schema({
  username: {
    type: String,
    unique: true,
    match: [/^[a-zA-Z0-9]+$/, "please use a valid username"],
    trim: true,
  },
  password: String,
});

const User = model("User", userSchema);

module.exports = User;
