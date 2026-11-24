import { describe, expect, it } from 'vitest';
import * as frontend from '../../../src/shared/constants/useGuideOwner';
import { isUseGuideOwner, USE_GUIDE_OWNER_ID } from './useGuideOwner';

describe('dono Use Guide', () => {
  it('frontend e backend usam o mesmo dono reservado', () => {
    expect(frontend.USE_GUIDE_OWNER_ID).toBe(USE_GUIDE_OWNER_ID);
  });

  it('reconhece só o dono reservado', () => {
    expect(isUseGuideOwner(USE_GUIDE_OWNER_ID)).toBe(true);
    expect(isUseGuideOwner('uid-do-parceiro')).toBe(false);
    expect(isUseGuideOwner(undefined)).toBe(false);
    expect(frontend.isUseGuideOwner(USE_GUIDE_OWNER_ID)).toBe(true);
  });
});
