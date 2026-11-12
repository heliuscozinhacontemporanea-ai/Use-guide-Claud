import { FirestoreGateStaffStore } from './adapters/firestoreGateStaffStore';
import { GateStaffService } from './services/gateStaffService';

let service: GateStaffService | null = null;

/** Composição interna (lazy): nada abre conexão na importação (§2.2). */
export function getGateStaffService(): GateStaffService {
  service ??= new GateStaffService(new FirestoreGateStaffStore());
  return service;
}
