import { env, logger } from '@app/utils';
import { ASTVisitor, GraphQLError, ValidationContext } from 'graphql';
import type { PostGraphilePlugin } from 'postgraphile';

import { validateQuery } from '../validation/query-validation';

/**
 * Query Validation Plugin (PostGraphile v4)
 *
 * Enforces depth & cost limits using GraphQL validation rules.
 */
export const QueryValidationPlugin: PostGraphilePlugin = {
    /**
     * Add custom validation rules
     */
    'postgraphile:validationRules'(rules) {
        return [
            ...rules,
            function QueryComplexityRule(context: ValidationContext): ASTVisitor {
                let validated = false;

                return {
                    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
                    Document() {
                        if (validated) return;
                        validated = true;

                        const document = context.getDocument();

                        // Skip introspection queries (GraphiQL / tooling)
                        const isIntrospection = document.definitions.every(def => {
                            if (def.kind !== 'OperationDefinition') return true;

                            return def.selectionSet.selections.every(
                                selection => selection.kind === 'Field' && selection.name.value.startsWith('__')
                            );
                        });

                        if (isIntrospection) {
                            return; // allow GraphiQL schema loading
                        }

                        const maxDepth = env.GRAPHQL_DEPTH_LIMIT;
                        const maxCost = env.GRAPHQL_COST_LIMIT;

                        const validation = validateQuery(document, {
                            maxDepth,
                            maxCost,
                        });

                        if (!validation.valid) {
                            logger.warn(
                                {
                                    depth: validation.depth,
                                    cost: validation.cost,
                                    maxDepth,
                                    maxCost,
                                    errors: validation.errors,
                                },
                                'GraphQL query rejected due to complexity'
                            );

                            for (const message of validation.errors) {
                                context.reportError(
                                    new GraphQLError(
                                        message,
                                        undefined, // nodes
                                        undefined, // source
                                        undefined, // positions
                                        undefined, // path
                                        undefined, // originalError
                                        {
                                            code: 'QUERY_COMPLEXITY_EXCEEDED',
                                            depth: validation.depth,
                                            cost: validation.cost,
                                            maxDepth,
                                            maxCost,
                                        }
                                    )
                                );
                            }
                        }
                    },
                };
            },
        ];
    },
};

export default QueryValidationPlugin;
