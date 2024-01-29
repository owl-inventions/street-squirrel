import { Injectable, Logger, NestMiddleware } from '@nestjs/common';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');
  use(req: any, res: any, next: () => void) {
    const { ip, method } = req;
    const userAgent = req.get('user-agent') || '';
    const startAt = Date.now();

    res.on('close', () => {
      const { statusCode } = res;
      const contentLength = res.get('content-length');
      const path = req.originalUrl;

      this.logger.log(
        `${method} ${path} ${statusCode} ${contentLength} - ${userAgent} ${ip} - ${(
          (Date.now() - startAt) /
          1000
        ).toFixed(2)}s`,
      );
    });

    next();
  }
}
