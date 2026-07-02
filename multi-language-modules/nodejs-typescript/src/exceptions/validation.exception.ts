import { AppException } from './app.exception';

export class ValidationException extends AppException {
  constructor(message = 'Validation failed') {
    super(message, 422, 'VALIDATION_ERROR');
  }
}
