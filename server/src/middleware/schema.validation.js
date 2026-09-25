import ApiError from '../utils/api.error.js';

export default function validateSchema(schema, source = 'body') {
  return (req, res, next) => {
    const data = req[source];

    const result = schema.safeParse(data);

    if (!result.success) {
      throw new ApiError(
        {
          statusCode: 400,
          message: result.error.issues[0]?.message || 'Invalid request data',
          code: 'VALIDATION_ERROR',
        },
        result.error.issues.map((i) => ({
          field: i.path.join('.'),
          message: i.message,
        }))
      );
    }

    if (source === 'query') {
      Object.defineProperty(req, 'query', {
        value: result.data,
        writable: true,
        configurable: true,
      });
    } else {
      req[source] = result.data;
    }

    next();
  };
}
