import { describe, expect, it } from 'vitest';
import { toPrivateUserProfileDto } from './userDto';

describe('toPrivateUserProfileDto', () => {
  it('devolve o idioma salvo quando é suportado', () => {
    expect(toPrivateUserProfileDto({ preferredLocale: 'fr' }, 'u1').preferredLocale).toBe('fr');
  });

  it('devolve null quando a pessoa nunca escolheu ou o valor não é suportado', () => {
    expect(toPrivateUserProfileDto({}, 'u1').preferredLocale).toBeNull();
    expect(toPrivateUserProfileDto({ preferredLocale: 'es' }, 'u1').preferredLocale).toBeNull();
  });
});
