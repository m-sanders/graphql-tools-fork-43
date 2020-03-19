# Reproduction of graphql-tools-fork #43

In summary, when both renaming types fields and renaming object fields graphql-tools-fork fails to resolve data correctly.

[Link](https://github.com/yaacovCR/graphql-tools-fork/issues/43)

## Running

```
nvm use
npm install
npm run dev
```

Visit: http://localhost:4000

## Failure case

### Query

```
query {
  node {
    id
    aString
    aList {
      aItem {
        _linkType
        ... on PLinkedItem {
          aString
        }
      }
    }
  }
}
```

### Result

```
{
  "data": {
    "node": {
      "id": "123",
      "aString": "Hello, world",
      // This gets lost in the tranform even when it is returned
      "aList": null
    }
  }
}
```
