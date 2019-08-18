/* eslint-disable no-unused-vars */
import Surveys from './surveys';

export default {
  Query: {
    getSurveys: () => Surveys.find({}).fetch(),
  },
  Mutation: {
    pushSurvey(obj, { json }, context) {
      const surveyID = Surveys.insert({
        date: new Date(),
        finished: false,
        json,
      });
    },
    updateSurvey(obj, { _id, json, finished }, context) {
      const surveyAdd = Surveys.update(
        { _id },
        {
          $set: {
            json,
            finished,
          },
        },
      );
    },
  },
};
