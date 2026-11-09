import type React from 'react';
import { useTranslation } from 'react-i18next';
import type { FormState } from '../../types/partsForm';
import { HotelDetails } from './details/HotelDetails';
import { RentalDetails } from './details/RentalDetails';
import { RestaurantDetails } from './details/RestaurantDetails';
import { SightDetails } from './details/SightDetails';
import { TourDetails } from './details/TourDetails';
import { TransferDetails } from './details/TransferDetails';
import type { DetailsSectionProps, FormStateSetter } from './details/useDetailsForm';

interface Step3DetailsProps {
  formData: FormState;
  setFormData: FormStateSetter;
  errors: { [key: string]: string };
  setErrors: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
  categories: { id: string; label: string }[];
}

const DETAILS_BY_CATEGORY: Record<string, (props: DetailsSectionProps) => React.ReactElement> = {
  hotel: HotelDetails,
  restaurant: RestaurantDetails,
  sight: SightDetails,
  tour: TourDetails,
  transfer: TransferDetails,
  rental: RentalDetails,
};

/** Passo 3 da inscrição e do editor: campos próprios de cada categoria. */
export function Step3Details({ categories, ...props }: Step3DetailsProps) {
  const { t } = useTranslation();
  const Details = DETAILS_BY_CATEGORY[props.formData.category];
  const label = props.formData.category
    ? t(`partnerSignup.categories.${props.formData.category}`, {
        defaultValue: categories.find((c) => c.id === props.formData.category)?.label ?? '',
      })
    : '';

  return (
    <div className="space-y-5">
      <h3 className="px-1 text-[17px] font-semibold text-ink">
        {label ? `${t('partnerSignup.detailsTitle')} · ${label}` : t('partnerSignup.detailsTitle')}
      </h3>
      {Details ? <Details {...props} /> : null}
    </div>
  );
}
