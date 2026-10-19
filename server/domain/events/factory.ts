import { FirestoreEventAdapter } from './adapters/firestoreEventAdapter';
import { EventOccurrencesService } from './services/eventOccurrencesService';
import { EventsService } from './services/eventsService';

const firestoreEventAdapter = new FirestoreEventAdapter();
export const eventsService = new EventsService(firestoreEventAdapter);
export const eventOccurrencesService = new EventOccurrencesService(firestoreEventAdapter);
