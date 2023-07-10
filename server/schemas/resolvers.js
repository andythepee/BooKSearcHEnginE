const { User } = require("../models");
const { AuthenticationError } = require("apollo-server-express");
const { signToken } = require("../utils/auth");

const resolvers = {
  Query: {
    me: async (_parent, _args, context) => {
      if (context.user) {
        return User.findOne({ _id: context.user._id });
      }
      throw new AuthenticationError("You need to be logged in!");
    },
  },
  Mutation: {
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError("No user with this email found!");
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError("Incorrect password!");
      }

      const token = signToken(user);
      return { token, user };
    },

    addUser: async (parent, { username, email, password }) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user);

      return { token, user };
    },

    saveBook: async (parent, book, context) => {
      if (context.user) {
        return User.findOneAndUpdate(
          { _id: context.user._id },
          {
            $addToSet: { savedBooks: book },
          },
          {
            new: true,
            runValidators: true,
          }
        );
      }
      // Execute this mutation to throw an error if not logged in
      throw new AuthenticationError("You need to be logged in!");
    },

    // Remove the book from the user's savedBooks array
    removeBook: async (parent, { bookId }, context) => {
      if (context.user) {
        return User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId: bookId } } },
          { new: true }
        );
      }
      throw new AuthenticationError("You need to be logged in!");
    },
  },
};

module.exports = resolvers;
// const { User, Book } = require("../models");
// const { AuthenticationError } = require("apollo-server-express");
// const { signToken } = require("../utils/auth");

// const resolvers = {
//   Query: {
//     me: async (_parent, _args, context) => {
//       if (context.user) {
//         return User.findOne({ _id: context.user._id }).populate("savedBooks");
//       }
//       throw new AuthenticationError("You need to be logged in!");
//     },
//   },
//   Mutation: {
//     login: async (_parent, { email, password }) => {
//       const user = await User.findOne({ email });

//       if (!user) {
//         throw new AuthenticationError("No user with this email found!");
//       }

//       const correctPw = await user.isCorrectPassword(password);

//       if (!correctPw) {
//         throw new AuthenticationError("Incorrect password!");
//       }

//       const token = signToken(user);
//       return { token, user };
//     },

//     addUser: async (_parent, { username, email, password }) => {
//       const user = await User.create({ username, email, password });
//       const token = signToken(user);

//       return { token, user };
//     },

//     saveBook: async (_parent, { input }, context) => {
//       if (context.user) {
//         const updatedUser = await User.findOneAndUpdate(
//           { _id: context.user._id },
//           { $addToSet: { savedBooks: input } },
//           { new: true }
//         ).populate("savedBooks");

//         return updatedUser;
//       }
//       throw new AuthenticationError("You need to be logged in!");
//     },

//     removeBook: async (_parent, { bookId }, context) => {
//       if (context.user) {
//         const updatedUser = await User.findOneAndUpdate(
//           { _id: context.user._id },
//           { $pull: { savedBooks: { bookId: bookId } } },
//           { new: true }
//         ).populate("savedBooks");

//         return updatedUser;
//       }
//       throw new AuthenticationError("You need to be logged in!");
//     },

//     logout: async (_parent, _args, context) => {
//       if (context.user) {
//         context.req.logout();
//         return { message: "Logout successful." };
//       }
//       throw new AuthenticationError("You need to be logged in!");
//     },
//   },
// };

// module.exports = resolvers;
