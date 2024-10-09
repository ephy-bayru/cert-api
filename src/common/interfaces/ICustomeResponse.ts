/**
 * Represents a standardized API response structure.
 * @template T - The type of the main data payload.
 */
export interface CustomResponse<T> {
  /**
   * The HTTP status code of the response.
   */
  statusCode: number;

  /**
   * A human-readable message describing the result of the operation.
   */
  message: string;

  /**
   * The main data payload of the response.
   */
  data: T;

  /**
   * ISO 8601 formatted timestamp of when the response was generated.
   */
  timestamp: string;

  /**
   * Optional metadata about the response, such as pagination info.
   */
  meta?: {
    [key: string]: any;
  };

  /**
   * Optional array of error details, useful for validation errors.
   */
  errors?: Array<{
    field?: string;
    message: string;
  }>;

  /**
   * Optional field for any additional information.
   */
  additionalInfo?: any;
}
