import type {
  AvailabilitySlot,
  BookableOffer,
  Booking,
  BookingDetails,
  BookingStatus,
} from '../../../domain/bookings';

/** Saída por allowlist (AGENTS.md §7.9 regra 4): nunca o documento inteiro. */
export function toBuyerBooking(booking: Booking) {
  return {
    id: booking.id,
    offerId: booking.offerId,
    slotId: booking.slotId,
    guideItemId: booking.guideItemId,
    kind: booking.kind,
    status: booking.status as BookingStatus,
    lines: booking.lines,
    participantsCount: booking.participantsCount,
    totalMinor: booking.totalMinor,
    expiresAt: booking.expiresAt,
    offer: {
      title: booking.offerSnapshot.title,
      startsAt: booking.offerSnapshot.startsAt,
      durationMinutes: booking.offerSnapshot.durationMinutes ?? null,
      meetingPoint: booking.offerSnapshot.meetingPoint ?? null,
      cancellationPolicy: booking.offerSnapshot.cancellationPolicy,
    },
    cancellation: booking.cancellation
      ? {
          by: booking.cancellation.by,
          refundPercent: booking.cancellation.refundPercent,
          refundAmountMinor: booking.cancellation.refundAmountMinor,
          at: booking.cancellation.at,
        }
      : null,
    rescheduledAt: booking.rescheduledAt ?? null,
    pickupAddress: booking.pickupAddress ?? null,
    checkIn: booking.checkIn
      ? {
          at: booking.checkIn.at,
          method: booking.checkIn.method,
          participantsPresent: booking.checkIn.participantsPresent,
        }
      : null,
    arrivedAt: booking.arrival?.at ?? null,
    providerAbsence: booking.providerAbsence
      ? {
          reportedAt: booking.providerAbsence.reportedAt,
          respondBy: booking.providerAbsence.respondBy,
          answer: booking.providerAbsence.answer ?? null,
          resolution: booking.providerAbsence.resolution ?? null,
        }
      : null,
    serviceConfirmation: booking.serviceConfirmation
      ? {
          askedAt: booking.serviceConfirmation.askedAt,
          answerBy: booking.serviceConfirmation.answerBy,
          answer: booking.serviceConfirmation.answer ?? null,
          resolution: booking.serviceConfirmation.resolution ?? null,
        }
      : null,
    createdAt: booking.createdAt,
  };
}

/** O parceiro vê também a taxa (para conferir o repasse), mas não o comprador além do ID. */
export function toSellerBooking(booking: Booking) {
  return {
    ...toBuyerBooking(booking),
    buyerId: booking.buyerId,
    platformFeeMinor: booking.platformFeeMinor,
  };
}

export function toBookingDetails(
  details: BookingDetails,
  viewerUid: string,
  viewerIsAdmin: boolean
) {
  const isSeller = details.booking.sellerPartnerId === viewerUid;
  return {
    ...(isSeller || viewerIsAdmin
      ? toSellerBooking(details.booking)
      : toBuyerBooking(details.booking)),
    participants: details.participants.map((participant) => ({
      name: participant.name,
      isLeadContact: participant.isLeadContact,
    })),
  };
}

export function toPartnerOffer(offer: BookableOffer) {
  const { ownerId: _owner, partnerId: _partner, ...rest } = offer;
  return rest;
}

export function toPartnerSlot(slot: AvailabilitySlot) {
  return {
    id: slot.id,
    startsAt: slot.startsAt,
    endsAt: slot.endsAt ?? null,
    capacityTotal: slot.capacityTotal,
    capacityReserved: slot.capacityReserved,
    capacitySold: slot.capacitySold,
    status: slot.status,
  };
}
