import {
  PipeTransform,
  Injectable,
  BadRequestException,
  ArgumentMetadata,
} from '@nestjs/common';
import {
  LANGUAGE_METADATA,
  SupportedLanguageCode,
} from 'src/shared/types/language-metadata.type';

@Injectable()
export class LanguageValidationPipe implements PipeTransform {
  transform(value: unknown, metadata: ArgumentMetadata): unknown {
    if (metadata.type !== 'body') return value;
    if (!value || typeof value !== 'object') return value;

    const payload = value as {
      languageCode?: string;
      metadata?: unknown;
    };
    const { languageCode, metadata: languageMeta } = payload;

    if (!languageCode) {
      return value;
    }

    if (languageMeta && languageCode in LANGUAGE_METADATA) {
      const schema = LANGUAGE_METADATA[languageCode as SupportedLanguageCode];
      const result = schema.safeParse(languageMeta);

      if (!result.success) {
        throw new BadRequestException({
          message: `Invalid metadata for language ${languageCode}`,
          errors: result.error.issues,
        });
      }
    }

    return value;
  }
}
