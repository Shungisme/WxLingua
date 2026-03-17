export class HandwritingCandidateDto {
  text: string;
  rank: number;
}

export class HandwritingRecognitionResponseDto {
  candidates: HandwritingCandidateDto[];
  language: string;
  processingMs: number;
}
