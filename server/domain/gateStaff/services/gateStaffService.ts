import { GateStaffError } from '../errors/gateStaffError';
import type { GateStaffStorePort } from '../ports/gateStaffStorePort';
import { GATE_STAFF_LIMIT, type GateScope, type GateStaffMember } from '../types/gateStaffTypes';

/**
 * Equipe da portaria (C1): o dono convida pelo @, a pessoa aceita e passa a liberar entradas só
 * daquele evento ou atração. O dono remove quando quiser; a pessoa também pode sair. A posse do
 * evento ou da atração é conferida por quem chama, antes do convite.
 */
export class GateStaffService {
  constructor(
    private readonly store: GateStaffStorePort,
    private readonly now: () => number = () => Date.now()
  ) {}

  private nowIso(): string {
    return new Date(this.now()).toISOString();
  }

  async invite(
    ownerId: string,
    scope: GateScope,
    staff: { uid: string; username: string | null; displayName: string | null }
  ): Promise<GateStaffMember> {
    if (staff.uid === ownerId) {
      throw new GateStaffError('GATE_STAFF_SELF', 'Você já opera a sua própria portaria.');
    }
    return this.store.invite(
      {
        scope,
        ownerId,
        staffUid: staff.uid,
        staff: { username: staff.username, displayName: staff.displayName },
        status: 'invited',
        createdAt: this.nowIso(),
        acceptedAt: null,
        endedAt: null,
      },
      GATE_STAFF_LIMIT
    );
  }

  /** Só a pessoa convidada responde; de outra conta, o convite não existe (§7.10). */
  async respond(staffUid: string, id: string, accept: boolean): Promise<GateStaffMember> {
    await this.ownedBy(id, 'staffUid', staffUid);
    return this.store.transition(
      id,
      ['invited'],
      accept
        ? { status: 'active', acceptedAt: this.nowIso() }
        : { status: 'declined', endedAt: this.nowIso() }
    );
  }

  /** O dono tira a pessoa (ou cancela o convite); vale na leitura seguinte. */
  async remove(ownerId: string, id: string): Promise<GateStaffMember> {
    await this.ownedBy(id, 'ownerId', ownerId);
    return this.store.transition(id, ['invited', 'active'], {
      status: 'removed',
      endedAt: this.nowIso(),
    });
  }

  async leave(staffUid: string, id: string): Promise<GateStaffMember> {
    await this.ownedBy(id, 'staffUid', staffUid);
    return this.store.transition(id, ['active'], { status: 'left', endedAt: this.nowIso() });
  }

  /** Equipe do dono: quem está ativo ou foi convidado; recusas e saídas não aparecem. */
  async listForOwner(ownerId: string): Promise<GateStaffMember[]> {
    return (await this.store.listByOwner(ownerId))
      .filter((member) => member.status === 'invited' || member.status === 'active')
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  async listForStaff(staffUid: string): Promise<GateStaffMember[]> {
    return (await this.store.listByStaff(staffUid))
      .filter((member) => member.status === 'invited' || member.status === 'active')
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  /** A pessoa está na equipe ativa deste evento ou atração agora. */
  async isActive(scope: GateScope, staffUid: string): Promise<boolean> {
    if (!staffUid) return false;
    return (await this.store.findInScope(scope, staffUid)).some(
      (member) => member.status === 'active'
    );
  }

  /**
   * A pessoa fazia parte da equipe naquele instante: serve para as entradas lidas sem internet e
   * enviadas depois. Só vale o que foi lido entre o aceite e a remoção ou a saída.
   */
  async wasActiveAt(scope: GateScope, staffUid: string, atIso: string): Promise<boolean> {
    if (!staffUid) return false;
    return (await this.store.findInScope(scope, staffUid)).some(
      (member) =>
        member.acceptedAt !== null &&
        member.acceptedAt <= atIso &&
        (member.status === 'active' || (member.endedAt !== null && atIso <= member.endedAt))
    );
  }

  anonymizeStaff(uid: string): Promise<number> {
    return this.store.anonymizeStaff(uid);
  }

  private async ownedBy(id: string, field: 'ownerId' | 'staffUid', uid: string) {
    const member = await this.store.get(id);
    if (member?.[field] !== uid) {
      throw new GateStaffError('GATE_STAFF_NOT_FOUND', 'Convite não encontrado.');
    }
    return member;
  }
}
