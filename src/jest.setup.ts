import { Logger } from '@nestjs/common';

// Reduce test noise by silencing Nest logs globally during Jest runs.
beforeAll(() => {
  Logger.overrideLogger(false);
});
