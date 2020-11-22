const { UserInputError, AuthenticationError } = require("apollo-server");
const Post = require("../../models/Post");
const checkAuth = require("../../util/checkAuth");
module.exports = {
  Query: {
    async getPosts() {
      try {
        const posts = await Post.find().sort({ createdAt: -1 });
        return posts;
      } catch (err) {
        console.log(err);
      }
    },

    async getPost(_, { postId }) {
      try {
        const post = await Post.findById(postId);
        if (post) return post;
        else {
          throw new UserInputError("Post Not Found");
        }
      } catch (err) {
        throw new UserInputError(err);
      }
    },
  },
  Mutation: {
    async createPost(_, { body }, context) {
      try {
        console.log("Inside CreatePost");
        const user = checkAuth(context);
        if (body.trim() === "") {
          throw new Error("body must not be empty");
        }
        const newPost = new Post({
          body: body,
          user: user.id,
          username: user.username,
          createdAt: new Date().toISOString(),
        });
        const post = await newPost.save();
        return newPost;
      } catch (err) {
        throw new Error(err);
      }
    },
    async deletePost(_, { postId }, context) {
      const user = checkAuth(context);
      try {
        const post = await Post.findById(postId);
        if (user.username === post.username) {
          post.delete();
          return "Post Deleted";
        } else throw new AuthenticationError("Action Not Allowed");
      } catch (err) {
        throw new Error(err);
      }
    },

    async likePost(_, { postId }, context) {
      const user = checkAuth(context);
      const post = await Post.findById(postId);
      console.log("hahah" + post._doc);
      if (post) {
        if (post.likes.find((like) => like.username == user.username)) {
          post.likes = post.likes.filter(
            (like) => like.username !== user.username
          );
        } else {
          //Not Likes , like Post
          post.likes.push({
            username: user.username,
            createdAt: new Date().toISOString(),
          });
        }
        await post.save();
        return post;
      } else {
        throw new UserInputError("Post not Found");
      }
    },
  },
};
