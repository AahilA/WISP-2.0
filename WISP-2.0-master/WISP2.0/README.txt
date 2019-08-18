WISP 2.0
by Haomiao Liu on Frontend and Aahil Awatramani on Backend and Frontend Integration.

STACK:

Survey Framwork: SurveyJS
Frontend Framwork: react
Style sheet: CSS
JavaScript Rules: AirBNB
Backend: Apollo (Uses GraphQL)
Database: MongoDB
Front and backend Integration: Meteor


ALL FUNCTIONALITY IS IMPLEMENTED IN  THE Import Folder.

API Folders:
Api folder consists of folder groups for different collections.
They consist of a resolver, a schema for the database and a call to create a said 
database.
Resolvers are the main piece, it handles manipulation of data in the database.
They are written in what essentially is GraphQL however all functions on the database
are strictly MongoDB functions.

Schema's are the designing of the database. It is the same as a GraphQL Schema however
Meteor enforces the use of Schemas in order to identify variable names and assignments.
IMPORTANT NOTES: 
1) ANY CHANGE MADE TO THE SCHEMA MUST BE FOLLOWED UP BY ANY UPDATE IN THE 
REGISTER API FILE. THIS IS BECAUSE METEOR HAS A BUG WHICH DOESN'T AUTOMATICALLY LOOK
FOR UPDATES IN THE SCHEMA. 
2) You must have a root Type Query and you can only have one. Make all your query
functions within it. Same rules for a root Type Mutation however it is not compulsary
to have a Type Mutation.
3) If you are using a user created Type as an input you must create a new input type 
version of the user created type and use that in the section for the formal parameters.
4) On creation of your own primitive datatypes consult scalar types from Apollo 
Documentation.

WISP 2.0 has two Api Folders. One for handling admin side and one for handling the
customer side.

Startup Folder:
Startup folder is for the hosting of the website.
It has a client and server side.

The client side connects the html page to the react code, wraps the website in a
Apollo Provider component in order to make calls from the frontend to the backend think
of it like a licence for the frontend to start sending queries and mutations to the 
backend. ApolloClient is used to setup the GraphQL playground on localhost:4000, which
will be the address the frontend at localhost:3000 will send queries and mutations to.

The server side constists of registering the api's resolvers and type definations
(Schemas) to the ApolloServer. Import the resolvers and schemas from the api folder 
and merge them into one. DONT load them in one by one this causes errors. 

UI Backend:
Essentially react code that build the website. Simple react stuff.

Getting data from the backend works according to the following protocol:
1) Creating a gql'' request and storing it in a constantoutside the main class. 
The request is identical in format to regular GraphQL syntax.
2) Group the requests with the compose wrapper and export them to the main App using the 
graphql wrapper within the compose wrapper.
3) Then the data will exist in the this.props.nameOfRequest and can be used to access 
only what was requested.

IMPORTANT NOTE: Create a if(this.props.nameOfRequest.loading) return; implemetation
before accessing any data, since it takes a couple a of ms to get the data from the 
backend and until then the object will be empty.

UI FrontEnd: