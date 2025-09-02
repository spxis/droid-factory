import { ApolloClient, InMemoryCache } from '@apollo/client';

const uri = import.meta.env.VITE_SWAPI_GRAPHQL_URL || 'https://swapi-graphql.netlify.app/graphql';

const client = new ApolloClient({
  uri,
  cache: new InMemoryCache(),
});

export { client };
