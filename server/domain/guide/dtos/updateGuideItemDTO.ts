import { GuideUpdateItemInput } from '../types/guideTypes';

export class UpdateGuideItemDTO {
  private constructor(public readonly data: GuideUpdateItemInput) {}

  static fromValidatedInput(data: GuideUpdateItemInput): UpdateGuideItemDTO {
    return new UpdateGuideItemDTO(data);
  }
}
