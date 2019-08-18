/* eslint-disable no-unused-vars */
/* eslint-disable import/no-unresolved */
import merge from 'lodash/merge';
import AdminResolver from '../../api/admin/resolver';
import AdminsSchema from '../../api/admin/surveys.graphql';
import CustomerResolver from '../../api/customer/resolvers';
import CustomerSchema from '../../api/customer/answers.graphql';

// assawdajhhghjghjghjwd <-- RANDOM UPDATE TO UPDATE SCHEMA

const { ApolloServer } = require('apollo-server');
const { GraphQLScalarType } = require('graphql');
const { Kind } = require('graphql/language');

const dateResovler = {
  Date: new GraphQLScalarType({
    name: 'Date',
    description: 'Date custom scalar type',
    parseValue(value) {
      return new Date(); // value from the client
    },
    serialize(value) {
      return value.getTime(); // value sent to the client
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.INT) {
        return parseInt(ast.value, 10); // ast value is always in string format
      }
      return null;
    },
  }),
};

const typeDefs = [

  AdminsSchema,
  CustomerSchema,

];

const resolvers = merge(

  dateResovler,
  CustomerResolver,
  AdminResolver,

);


const server = new ApolloServer({
  typeDefs,
  resolvers,
});


server.listen().then(({ url }) => {
  // eslint-disable-next-line no-console
  console.log(`🚀 Server ready at ${url}`);
});
