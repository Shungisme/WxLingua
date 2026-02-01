import { PipeTransform, Injectable, BadRequestException, ArgumentMetadata } from '@nestjs/common';
import { LANGUAGE_METADATA } from '../constants/language-metadata';

@Injectable()
export class LanguageValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type !== 'body') return value;

    const { languageCode, metadata: meta, word } = value;

    if (!languageCode) {
      // Allow class-validator to handle missing languageCode if it's there, 
      // but if we need it for metadata validation, we should check.
      // If this is an update or partial, we might skip.
      // For now, assume creation or full update.
      return value; 
    }

    if (meta && LANGUAGE_METADATA[languageCode]) {
      const schema = LANGUAGE_METADATA[languageCode];
      const result = schema.safeParse(meta);
      
      if (!result.success) {
        throw new BadRequestException({
          message: `Invalid metadata for language ${languageCode}`,
          errors: result.error.errors,
        });
      }
    }

    return value;
  }
}
