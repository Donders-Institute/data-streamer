module.exports = {
    client: {
        service: {
            name: "project-database-graphql",
            url: "http://dccn-pl001.dccn.nl:5060/v1/graphql",
            headers: {
                "X-Hasura-Admin-Secret": "somepassword"
            }
        }
    }
};
