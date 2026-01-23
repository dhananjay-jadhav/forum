import axios from 'axios';

describe('GraphQL API', () => {
    describe('Query.query', () => {
        it('should return the root query', async () => {
            const res = await axios.post('/graphql', {
                query: `
                    {
                        query {
                            query{
                                nodeId
                            }
                        }
                    }
                `,
            });

            expect(res.status).toBe(200);
            expect(res.data.errors).toBeUndefined();
            expect(res.data.data.query.query).toHaveProperty('nodeId');
        });
    });

    describe('Introspection', () => {
        it('should return schema types', async () => {
            const res = await axios.post('/graphql', {
                query: `
                    query {
                        __schema {
                            types {
                                name
                            }
                        }
                    }
                `,
            });

            expect(res.status).toBe(200);
            expect(res.data.errors).toBeUndefined();
            expect(res.data.data.__schema.types).toBeInstanceOf(Array);

            const typeNames = res.data.data.__schema.types.map((t: { name: string }) => t.name);
            expect(typeNames).toContain('Query');
            expect(typeNames).toContain('Node');
        });

        it('should return Node interface fields', async () => {
            const res = await axios.post('/graphql', {
                query: `
                    query {
                        __type(name: "Node") {
                            kind
                            name
                            fields {
                                name
                                type {
                                    name
                                    kind
                                }
                            }
                        }
                    }
                `,
            });

            expect(res.status).toBe(200);
            expect(res.data.errors).toBeUndefined();
            expect(res.data.data.__type).toEqual({
                kind: 'INTERFACE',
                name: 'Node',
                fields: [
                    {
                        name: 'nodeId',
                        type: {
                            name: null,
                            kind: 'NON_NULL',
                        },
                    },
                ],
            });
        });
    });
});
