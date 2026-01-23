import { env, logger } from '@app/utils';
import PgSimplifyInflectorPlugin from '@graphile-contrib/pg-simplify-inflector';
import { PostGraphileOptions } from 'postgraphile';

export const postGraphileOptions: PostGraphileOptions = {
    watchPg: false,// env.isDevelopment,
    subscriptions: true,
    retryOnInitFail: (error: Error, attempts: number) => {
        if (attempts > 10) {
            return false;
        }
        logger.warn(`Postgraphile server retryOnInitFailed: attempts: ${attempts} error: ${error.message}`);
        return true;
    },
    dynamicJson: true,
    setofFunctionsContainNulls: false,
    ignoreRBAC: false,
    showErrorStack: env.isDevelopment ? "json" : false,
    extendedErrors: env.isDevelopment ? ["hint", "detail", "errcode"] : ['errcode'],
    appendPlugins: [PgSimplifyInflectorPlugin],
    graphiql: env.isDevelopment,
    enhanceGraphiql: env.isDevelopment,
    allowExplain() {
        // TODO: customise condition!
        return true;
    },
    enableQueryBatching: true,
    disableQueryLog: env.isDevelopment, // our default logging has performance issues, but do make sure you have a logging system in place!
    legacyRelations: 'omit',
    ignoreIndexes: false,
    exportGqlSchemaPath: 'libs/gql/src/lib/schema.graphql',
    sortExport: true,
};
