import { useEffect, useState } from 'react';
import { subscribeToGuideManagementCatalogUseCase } from '../../guide';
import type { PartnerContentRecord } from '../types/partnerContent';

export interface UsePartnerContentCatalogProps {
  userId?: string | null;
  activeTab: 'items' | 'events' | 'reports';
}

export function usePartnerContentCatalog({ userId, activeTab }: UsePartnerContentCatalogProps) {
  const [itemsList, setItemsList] = useState<PartnerContentRecord[]>([]);
  const [eventsList, setEventsList] = useState<PartnerContentRecord[]>([]);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setItemsList([]);
      setEventsList([]);
      setItemsLoading(false);
      setEventsLoading(false);
      setError(null);
      return;
    }

    setItemsLoading(true);
    setEventsLoading(true);
    setError(null);

    const unsubscribe = subscribeToGuideManagementCatalogUseCase(
      userId,
      ({ items, events }) => {
        const mappedItems: PartnerContentRecord[] = items.map((item) => ({
          id: item.id,
          contentType: item.contentType,
          name: item.name,
          description: item.description,
          category: item.category,
          image: item.image,
          images: item.images,
          location: item.location,
          googleMapsType: item.googleMapsType,
          mapLink: item.mapLink,
          instagramLink: item.instagramLink,
          websiteLink: item.websiteLink,
          bookingLink: item.bookingLink,
          phone: item.phone,
          googleMapsLink: item.googleMapsLink,
          address: item.address,
          tags: item.tags,
          ownerId: item.ownerId,
          partnerId: item.partnerId,
          isVerified: item.isVerified,
          verifiedUntil: item.verifiedUntil,
          isVerificationSuspended: item.isVerificationSuspended,
          verificationType: item.verificationType,
          operationalInfo: item.operationalInfo,
          isActive: item.isActive,
          date: item.date,
          endDate: item.endDate,
          eventCategory: item.eventCategory,
          customCategory: item.customCategory,
        }));

        const mappedEvents: PartnerContentRecord[] = events.map((event) => ({
          id: event.id,
          contentType: event.contentType,
          name: event.name,
          description: event.description,
          category: event.category,
          image: event.image,
          images: event.images,
          location: event.location,
          googleMapsType: event.googleMapsType,
          mapLink: event.mapLink,
          instagramLink: event.instagramLink,
          websiteLink: event.websiteLink,
          bookingLink: event.bookingLink,
          phone: event.phone,
          googleMapsLink: event.googleMapsLink,
          address: event.address,
          tags: event.tags,
          ownerId: event.ownerId,
          partnerId: event.partnerId,
          isVerified: event.isVerified,
          verifiedUntil: event.verifiedUntil,
          isVerificationSuspended: event.isVerificationSuspended,
          verificationType: event.verificationType,
          operationalInfo: event.operationalInfo,
          isActive: event.isActive,
          date: event.date,
          endDate: event.endDate,
          eventCategory: event.eventCategory,
          customCategory: event.customCategory,
        }));

        setItemsList(mappedItems);
        setEventsList(mappedEvents);
        setItemsLoading(false);
        setEventsLoading(false);
      },
      (err) => {
        console.error('[usePartnerContentCatalog]', err);
        setError('Não foi possível carregar os itens e eventos.');
        setItemsLoading(false);
        setEventsLoading(false);
      }
    );

    return unsubscribe;
  }, [userId]);

  const dataLoading =
    activeTab === 'items'
      ? itemsLoading
      : activeTab === 'events'
        ? eventsLoading
        : itemsLoading || eventsLoading;

  const currentList = activeTab === 'items' ? itemsList : eventsList;

  return {
    itemsList,
    eventsList,
    itemsLoading,
    eventsLoading,
    dataLoading,
    currentList,
    error,
  };
}
