import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  RecognizeHandwritingDto,
  HandwritingStrokeDto,
} from '../../../core/dtos/dictionary/recognize-handwriting.dto';
import {
  HandwritingCandidateDto,
  HandwritingRecognitionResponseDto,
} from '../../../core/dtos/dictionary/recognize-handwriting-response.dto';

type GoogleHandwritingResponse = [
  string,
  Array<[string, string[], ...unknown[]]>?,
];

@Injectable()
export class HandwritingService {
  private readonly logger = new Logger(HandwritingService.name);

  constructor(private readonly configService: ConfigService) {}

  async recognize(
    dto: RecognizeHandwritingDto,
  ): Promise<HandwritingRecognitionResponseDto> {
    this.validateStrokes(dto.strokes);

    const startedAt = Date.now();
    const timeoutMs = this.configService.get<number>(
      'GOOGLE_INPUT_TOOLS_TIMEOUT_MS',
      5000,
    );
    const maxRetries = this.configService.get<number>(
      'GOOGLE_INPUT_TOOLS_MAX_RETRIES',
      2,
    );

    const response = await this.postToGoogle(dto, timeoutMs, maxRetries);
    const candidates = this.parseCandidates(response, dto.maxCandidates || 5);

    return {
      candidates,
      language: dto.language || 'zh-TW',
      processingMs: Date.now() - startedAt,
    };
  }

  private validateStrokes(strokes: HandwritingStrokeDto[]): void {
    for (const stroke of strokes) {
      const pointCount = stroke.x.length;
      if (pointCount !== stroke.y.length || pointCount !== stroke.t.length) {
        throw new BadRequestException(
          'Each stroke must have equal x, y, and t lengths',
        );
      }
    }
  }

  private async postToGoogle(
    dto: RecognizeHandwritingDto,
    timeoutMs: number,
    maxRetries: number,
  ): Promise<GoogleHandwritingResponse> {
    const baseUrl = this.configService.get<string>(
      'GOOGLE_INPUT_TOOLS_API_URL',
      'https://inputtools.google.com/request',
    );

    const itc =
      dto.language === 'zh-CN' ? 'zh-hans-t-i0-handwrit' : 'zh-t-i0-handwrit';
    const url = new URL(baseUrl);
    url.searchParams.set('itc', itc);
    url.searchParams.set('app', 'demopage');

    const body = {
      requests: [
        {
          language: dto.language || 'zh-TW',
          max_num_results: dto.maxCandidates || 5,
          writing_guide: {
            writing_area_width: dto.width || 320,
            writing_area_height: dto.height || 320,
          },
          ink: dto.strokes.map((stroke) => [stroke.x, stroke.y, stroke.t]),
        },
      ],
    };

    let lastError: unknown;
    for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const response = await fetch(url.toString(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (!response.ok) {
          throw new BadGatewayException(
            `Google handwriting API returned status ${response.status}`,
          );
        }

        const data: unknown = await response.json();
        if (!Array.isArray(data) || typeof data[0] !== 'string') {
          throw new BadGatewayException(
            'Invalid response format from handwriting provider',
          );
        }

        return data as GoogleHandwritingResponse;
      } catch (error) {
        clearTimeout(timeout);
        lastError = error;
        if (attempt === maxRetries) {
          break;
        }
      }
    }

    this.logger.warn('Handwriting provider unavailable after retries');
    throw new ServiceUnavailableException(
      'Handwriting recognition is temporarily unavailable. Please try again.',
      {
        cause: lastError as Error,
      },
    );
  }

  private parseCandidates(
    response: GoogleHandwritingResponse,
    maxCandidates: number,
  ): HandwritingCandidateDto[] {
    if (response[0] !== 'SUCCESS') {
      throw new BadGatewayException(
        'Handwriting provider returned non-success status',
      );
    }

    const requestResults = response[1];
    if (!requestResults || requestResults.length === 0) {
      return [];
    }

    const firstResult = requestResults[0];
    const texts = Array.isArray(firstResult?.[1]) ? firstResult[1] : [];

    return texts
      .filter(
        (text): text is string => typeof text === 'string' && text.length > 0,
      )
      .slice(0, maxCandidates)
      .map((text, index) => ({
        text,
        rank: index + 1,
      }));
  }
}
