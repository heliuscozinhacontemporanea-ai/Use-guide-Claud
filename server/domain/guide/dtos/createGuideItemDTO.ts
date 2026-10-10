import { GuideCreateItemInput } from '../types/guideTypes';

export class CreateGuideItemDTO {
  private constructor(public readonly data: GuideCreateItemInput) {}

  static fromValidatedInput(data: GuideCreateItemInput): CreateGuideItemDTO {
    return new CreateGuideItemDTO(data);
  }
}
