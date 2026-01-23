import { IncomingMessage, ServerResponse } from 'node:http';

import { getPool } from '@app/database';
import { getDatabaseSchemas } from '@app/utils';
import postgraphile, { HttpRequestHandler } from 'postgraphile';

import { postGraphileOptions } from './graphile.config';

export function setupGraphQL(): HttpRequestHandler<IncomingMessage, ServerResponse<IncomingMessage>> {
    return postgraphile(getPool(), getDatabaseSchemas(), postGraphileOptions);
}
