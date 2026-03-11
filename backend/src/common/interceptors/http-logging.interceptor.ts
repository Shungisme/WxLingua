import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Request, Response } from 'express';
import { AppLogger } from '../logger/app-logger.service';

/** Maximum characters to include when serialising request/response bodies. */
const MAX_BODY_LENGTH = 2000;

function truncate(value: unknown): string {
  if (value === undefined || value === null) return '';
  const str =
    typeof value === 'string' ? value : JSON.stringify(value, null, 0);
  return str.length > MAX_BODY_LENGTH
    ? str.slice(0, MAX_BODY_LENGTH) +
        `… (+${str.length - MAX_BODY_LENGTH} chars)`
    : str;
}

/**
 * HttpLoggingInterceptor – logs every incoming request and outgoing response,
 * including method, path, status code, processing time, request payload,
 * query params, and response body.
 *
 * Register globally via APP_INTERCEPTOR in AppModule.
 */
@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: AppLogger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request>();
    const { method, originalUrl, ip, body, query, params } = req;
    const userAgent = req.headers['user-agent'] ?? '-';
    const startTime = Date.now();

    // Build inbound log lines
    const inboundLines: string[] = [
      `→ ${method} ${originalUrl} | IP: ${ip} | UA: ${userAgent}`,
    ];

    const hasQuery = query && Object.keys(query).length > 0;
    const hasParams = params && Object.keys(params).length > 0;
    const hasBody =
      body &&
      Object.keys(body).length > 0 &&
      ['POST', 'PUT', 'PATCH'].includes(method);

    if (hasQuery) inboundLines.push(`  query : ${truncate(query)}`);
    if (hasParams) inboundLines.push(`  params: ${truncate(params)}`);
    if (hasBody) inboundLines.push(`  body  : ${truncate(body)}`);

    this.logger.http(inboundLines.join('\n'), 'HTTP');

    return next.handle().pipe(
      tap({
        next: (responseBody: unknown) => {
          const res = context.switchToHttp().getResponse<Response>();
          const duration = Date.now() - startTime;
          const outboundLines: string[] = [
            `← ${method} ${originalUrl} ${res.statusCode} (${duration}ms)`,
          ];
          if (responseBody !== undefined && responseBody !== null) {
            outboundLines.push(`  data  : ${truncate(responseBody)}`);
          }
          this.logger.http(outboundLines.join('\n'), 'HTTP');
        },
        error: (err: { status?: number; message?: string }) => {
          const res = context.switchToHttp().getResponse<Response>();
          const duration = Date.now() - startTime;
          const status = err?.status ?? res.statusCode ?? 500;
          this.logger.warn(
            `← ${method} ${originalUrl} ${status} (${duration}ms) ERROR: ${err?.message ?? 'Unknown'}`,
            'HTTP',
          );
        },
      }),
    );
  }
}
