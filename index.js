const { ApolloServer } = require("apollo-server");
const {
  makeExecutableSchema,
  transformSchema,
  RenameTypes,
  RenameObjectFields
} = require("graphql-tools-fork");
const { pascalize, camelize } = require("humps");

const NODE = {
  id: "123",
  a_string: "Hello, world",
  a_list: [
    {
      a_item: {
        _linkType: "linked_item",
        a_string: "Hello, world"
      }
    }
  ]
};

const fakeRemoteSchema = makeExecutableSchema({
  typeDefs: `
    interface _Linkable {
      _linkType: String!
    }

    type linked_item implements _Linkable {
      _linkType: String!
      a_string: String!
    }

    type a_link {
      a_item: _Linkable
    }

    type node {
      id: ID!
      a_string: String!
      a_list: [a_link!]
    }

    type Query {
      node: node
    }
  `,
  resolvers: {
    _Linkable: {
      __resolveType(linkable, context, info) {
        return linkable._linkType;
      }
    },
    Query: {
      node: () => NODE
    }
  }
});

const schema = transformSchema(fakeRemoteSchema, [
  new RenameTypes(
    name => (name.startsWith("_") ? name : `P${pascalize(name)}`),
    {
      renameBuiltins: false,
      renameScalars: false
    }
  ),
  new RenameObjectFields((typeName, fieldName) => {
    if (typeName === "Query") return fieldName;

    // Remote uses leading underscores for special fields. Leave them alone.
    if (fieldName[0] === "_") return fieldName;

    // This issue appears to be with renaming `a_item`
    // if (fieldName === "a_item") return fieldName;

    return camelize(fieldName);
  })
]);

const runServer = async () => {
  const server = new ApolloServer({
    schema
  });
  server.listen().then(({ url }) => {
    console.log(`Running at ${url}`);
  });
};

try {
  runServer();
} catch (err) {
  console.error(err);
}
