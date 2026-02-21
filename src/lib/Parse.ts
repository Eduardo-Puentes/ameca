import * as v from "valibot";

export class ParseError extends Error {
    constructor(message: string, public issues?: unknown) {
        super(message);
        this.name = "ParseError";
    }
}

import { safeParse, type BaseSchema, type InferOutput } from "valibot";

export function parseOrThrow<TSchema extends BaseSchema<any, any, any>>(
    schema: TSchema,
    data: unknown
): InferOutput<TSchema> {
    const result = safeParse(schema, data);

    if (!result.success) {
        throw new ParseError("Response validation failed", result.issues);
    }

    return result.output;
}