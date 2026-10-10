import { describe, expect, it } from 'vitest';
import { updatePlanSchema } from '../schemas/adminPlanSchema';
import { UpdateSubscriptionPlanDTO } from './updateSubscriptionPlanDTO';

describe('UpdateSubscriptionPlanDTO', () => {
  it('mantém apenas campos informados e entrega objeto imutável', () => {
    const parsed = updatePlanSchema.parse({ name: 'Plano Anual', price: '299,90'.replace(',', '.') });
    const dto = UpdateSubscriptionPlanDTO.fromValidatedInput(parsed);

    expect(dto.fields).toEqual({ name: 'Plano Anual', price: 299.9 });
    expect(Object.isFrozen(dto.fields)).toBe(true);
  });
});
