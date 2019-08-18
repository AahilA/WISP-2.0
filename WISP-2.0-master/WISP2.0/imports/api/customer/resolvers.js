/* eslint-disable no-unused-vars */
import Answers from './answers';

export default {
  Query: {
    customers: () => Answers.find({}).fetch(),
  },

  Mutation: {
    sendAnswers(obj, {
      username, isComplete, template, answer,
    }, context) {
      Answers.update({
        username,
      }, {
        $push: { answers: { isComplete, template, answer } },
      }, {
        upsert: true,
      });
    },
  },
};
