import type React from 'react';
import { Sparkles } from 'lucide-react';
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
  const Details = DETAILS_BY_CATEGORY[props.formData.category];
  const label = categories.find((c) => c.id === props.formData.category)?.label;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <span className="p-2 rounded-xl bg-white/5 border border-white/10 text-indigo-400">
          <Sparkles size={18} aria-hidden="true" />
        </span>
        <h3 className="text-sm font-black text-white uppercase tracking-widest">
          {label ? `Detalhes · ${label}` : 'Serviços e Comodidades'}
        </h3>
      </div>
      {Details ? <Details {...props} /> : null}
    </div>
  );
}
