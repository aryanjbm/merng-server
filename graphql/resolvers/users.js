const Post = require("../../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");
const { SECRET_KEY } = require("../../config");
const { UserInputError } = require("apollo-server");
const {
  validateRegisterInput,
  validateLoginInput,
} = require("../../util/validators");

module.exports = {
  Mutation: {
    async register(
      _,
      { registerInput: { username, password, confirmPassword, email } },
      context,
      info
    ) {
      //TODO:Validate User Data
      console.log(username, email, password, confirmPassword);
      const { errors, valid } = validateRegisterInput(
        username,
        email,
        password,
        confirmPassword
      );
      if (!valid) {
        throw new UserInputError("Errors", { errors });
      }
      const user = await User.findOne({ username });
      if (user) {
        throw new UserInputError("UserName is taken", {
          errors: {
            username: "This Username is taken",
          },
        });
      }

      password = await bcrypt.hash(password, 2);
      const newUser = new User({
        email,
        username,
        password,
        createdAt: new Date().toISOString(),
      });
      const res = await newUser.save();
      const token = generateToken(res);

      return {
        ...res._doc,
        id: res._id,
        token,
      };
    },

    async login(_, { username, password }) {
      const { errors, valid } = validateLoginInput(username, password);
      if (!valid) throw new UserInputError("Errors", { errors });
      const user = await User.findOne({ username });
      if (!user) {
        errors.general = "User Not Found";
        throw new UserInputError("User Not Found", { errors });
      }
      console.log("here" + password);
      console.log("here" + user.password);
      const match = await bcrypt.compare(password, user.password);
      console.log("here" + match);
      if (!match) {
        console.log("password is wrong");
        errors.general = "Invalid Credential";
        throw new UserInputError("Invalid Credential", { errors });
      }

      const token = generateToken(user);

      return {
        ...user._doc,
        id: user._id,
        token,
      };
    },
  },
};

function generateToken(user) {
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
    },
    SECRET_KEY,
    { expiresIn: "1h" }
  );
  return token;
}
