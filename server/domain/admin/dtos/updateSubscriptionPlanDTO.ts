import type { UpdatePlanInput } from '../schemas/adminPlanSchema';
import type { UpdateSubscriptionPlanInput } from '../types/subscriptionPlan';

export class UpdateSubscriptionPlanDTO {
  private constructor(public readonly fields: Readonly<UpdateSubscriptionPlanInput>) {}

  static fromValidatedInput(input: UpdatePlanInput): UpdateSubscriptionPlanDTO {
    const fields: UpdateSubscriptionPlanInput = {};
    if (input.name !== undefined) fields.name = input.name;
    if (input.price !== undefined) fields.price = input.price;
    if (input.period !== undefined) fields.period = input.period;
    if (input.description !== undefined) fields.description = input.description;
    if (input.isActive !== undefined) fields.isActive = input.isActive;
    return new UpdateSubscriptionPlanDTO(Object.freeze(fields));
  }
}
