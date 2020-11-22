const postResolvers = require("./posts");
const userResolvers = require("./users");
const commentsResolvers = require("./comments");
const comments = require("./comments");

module.exports = {
  Post: {
    commentCount: (parent) => {
      return parent.comments.length;
    },
    likeCount: (parent) => {
      return parent.likes.length;
    },
  },
  Query: {
    ...postResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...postResolvers.Mutation,
    ...commentsResolvers.Mutation,
  },
};
