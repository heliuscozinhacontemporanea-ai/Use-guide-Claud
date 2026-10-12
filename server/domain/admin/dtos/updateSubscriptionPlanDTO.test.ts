import { describe, expect, it } from 'vitest';
import { updatePlanSchema } from '../schemas/adminPlanSchema';
import { UpdateSubscriptionPlanDTO } from './updateSubscriptionPlanDTO';

describe('UpdateSubscriptionPlanDTO', () => {
  it('mantém apenas campos informados e entrega objeto imutável', () => {
    const parsed = updatePlanSchema.parse({ name: 'Plano Anual', priceMinor: 29990 });
    const dto = UpdateSubscriptionPlanDTO.fromValidatedInput(parsed);

    expect(dto.fields).toEqual({ name: 'Plano Anual', priceMinor: 29990 });
    expect(Object.isFrozen(dto.fields)).toBe(true);
  });
});
