module.exports = {
  client: {
    service: {
      name: "project-database-hasura",
      url: "http://dccn-dk001.dccn.nl:5060/v1/graphql",
      headers: {
        ["X-Hasura-Admin-Secret"]: "Pr0j3ctdatabase!"
      }
    }
  }
};
