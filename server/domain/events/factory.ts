import { FirestoreEventAdapter } from './adapters/firestoreEventAdapter';
import { EventsService } from './services/eventsService';

const firestoreEventAdapter = new FirestoreEventAdapter();
export const eventsService = new EventsService(firestoreEventAdapter);
