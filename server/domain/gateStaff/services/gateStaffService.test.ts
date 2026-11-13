import { describe, expect, it } from 'vitest';
import { GateStaffError } from '../errors/gateStaffError';
import type { GateStaffStorePort } from '../ports/gateStaffStorePort';
import type { GateStaffMember } from '../types/gateStaffTypes';
import { GateStaffService } from './gateStaffService';

const EVENT = { type: 'event' as const, id: 'ev1' };
const ANA = { uid: 'ana', username: 'ana.souza', displayName: 'Ana Souza' };

function setup() {
  const members = new Map<string, GateStaffMember>();
  let clock = Date.parse('2026-12-20T20:00:00.000Z');
  const store: GateStaffStorePort = {
    async invite(input, limit) {
      const open = [...members.values()].filter(
        (member) =>
          member.scope.id === input.scope.id &&
          (member.status === 'invited' || member.status === 'active')
      );
      if (open.some((member) => member.staffUid === input.staffUid)) {
        throw new GateStaffError('GATE_STAFF_ALREADY_INVITED', 'já');
      }
      if (open.length >= limit) throw new GateStaffError('GATE_STAFF_LIMIT', 'limite');
      const member = { id: `m${members.size + 1}`, ...input };
      members.set(member.id, member);
      return member;
    },
    get: async (id) => members.get(id) ?? null,
    async transition(id, from, patch) {
      const current = members.get(id);
      if (!current) throw new GateStaffError('GATE_STAFF_NOT_FOUND', 'x');
      if (!from.includes(current.status)) throw new GateStaffError('GATE_STAFF_WRONG_STATUS', 'x');
      const next = { ...current, ...patch };
      members.set(id, next);
      return next;
    },
    listByOwner: async (ownerId) =>
      [...members.values()].filter((member) => member.ownerId === ownerId),
    listByStaff: async (uid) => [...members.values()].filter((member) => member.staffUid === uid),
    findInScope: async (scope, uid) =>
      [...members.values()].filter(
        (member) =>
          member.scope.type === scope.type &&
          member.scope.id === scope.id &&
          member.staffUid === uid
      ),
    anonymizeStaff: async () => 0,
  };
  return {
    service: new GateStaffService(store, () => clock),
    tick: (minutes: number) => {
      clock += minutes * 60_000;
    },
  };
}

describe('equipe da portaria (C1)', () => {
  it('só entra na equipe depois de aceitar; o dono não se convida nem convida duas vezes', async () => {
    const { service } = setup();
    await expect(service.invite('dono', EVENT, { ...ANA, uid: 'dono' })).rejects.toMatchObject({
      code: 'GATE_STAFF_SELF',
    });
    const invite = await service.invite('dono', EVENT, ANA);
    expect(await service.isActive(EVENT, 'ana')).toBe(false);
    await expect(service.invite('dono', EVENT, ANA)).rejects.toMatchObject({
      code: 'GATE_STAFF_ALREADY_INVITED',
    });
    await service.respond('ana', invite.id, true);
    expect(await service.isActive(EVENT, 'ana')).toBe(true);
    expect(await service.isActive({ type: 'event', id: 'outro' }, 'ana')).toBe(false);
    expect(await service.isActive({ type: 'place', id: 'ev1' }, 'ana')).toBe(false);
  });

  it('outra conta não responde, não remove e não sai no lugar de ninguém (IDOR)', async () => {
    const { service } = setup();
    const invite = await service.invite('dono', EVENT, ANA);
    const notFound = { code: 'GATE_STAFF_NOT_FOUND' };
    await expect(service.respond('intruso', invite.id, true)).rejects.toMatchObject(notFound);
    await expect(service.remove('outro-dono', invite.id)).rejects.toMatchObject(notFound);
    await service.respond('ana', invite.id, true);
    await expect(service.leave('intruso', invite.id)).rejects.toMatchObject(notFound);
    expect(await service.isActive(EVENT, 'ana')).toBe(true);
  });

  it('remoção vale na hora; o que foi lido sem internet antes dela continua valendo', async () => {
    const { service, tick } = setup();
    const invite = await service.invite('dono', EVENT, ANA);
    tick(10);
    await service.respond('ana', invite.id, true);
    tick(30);
    await service.remove('dono', invite.id);
    expect(await service.isActive(EVENT, 'ana')).toBe(false);
    expect(await service.wasActiveAt(EVENT, 'ana', '2026-12-20T20:05:00.000Z')).toBe(false);
    expect(await service.wasActiveAt(EVENT, 'ana', '2026-12-20T20:20:00.000Z')).toBe(true);
    expect(await service.wasActiveAt(EVENT, 'ana', '2026-12-20T20:41:00.000Z')).toBe(false);
    expect(await service.listForOwner('dono')).toEqual([]);
    // Depois de removida, pode ser convidada de novo.
    await service.invite('dono', EVENT, ANA);
  });

  it('recusa, saída e o limite de 20 pessoas', async () => {
    const { service } = setup();
    const first = await service.invite('dono', EVENT, ANA);
    await service.respond('ana', first.id, false);
    expect(await service.listForStaff('ana')).toEqual([]);
    const again = await service.invite('dono', EVENT, ANA);
    await service.respond('ana', again.id, true);
    await service.leave('ana', again.id);
    expect(await service.isActive(EVENT, 'ana')).toBe(false);
    for (let i = 0; i < 20; i += 1) {
      await service.invite('dono', EVENT, { uid: `p${i}`, username: null, displayName: null });
    }
    await expect(service.invite('dono', EVENT, ANA)).rejects.toMatchObject({
      code: 'GATE_STAFF_LIMIT',
    });
  });
});
