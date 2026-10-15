import { Plus, Trash2 } from 'lucide-react';
import { ChipGroup, TextField } from './DetailFields';
import { type DetailsSectionProps, useDetailsForm } from './useDetailsForm';

const TRANSFER_VEHICLE_OPTIONS = [
  'Carro',
  'Caminhonete 4x4',
  'Van',
  'Micro-ônibus',
  'Jardineira',
  'Buggy',
] as const;

const MAX_ROUTES = 30;

/** Campos da inscrição de translado: trechos, veículos e capacidade (decisão D9). */
export function TransferDetails(props: DetailsSectionProps) {
  const { formData, getFieldError, updateFieldValue, toggleInList } = useDetailsForm(props);
  const routes = formData.transferRoutes;

  const setRoute = (index: number, field: 'from' | 'to', value: string) => {
    updateFieldValue(
      'transferRoutes',
      routes.map((route, i) => (i === index ? { ...route, [field]: value } : route))
    );
  };

  return (
    <div className="space-y-8">
      <fieldset className="space-y-4">
        <legend className="text-[10px] font-black uppercase tracking-widest text-indigo-400 block ml-1">
          Trechos atendidos <span className="text-red-500">*</span>
        </legend>
        {routes.map((route, index) => (
          <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-end">
            <TextField
              id={`transfer-from-${index}`}
              label="Origem"
              value={route.from}
              maxLength={100}
              onChange={(value) => setRoute(index, 'from', value)}
              placeholder="Ex: Aeroporto de Fortaleza"
            />
            <TextField
              id={`transfer-to-${index}`}
              label="Destino"
              value={route.to}
              maxLength={100}
              onChange={(value) => setRoute(index, 'to', value)}
              placeholder="Ex: Jericoacoara"
            />
            <button
              type="button"
              aria-label={`Remover trecho ${index + 1}`}
              onClick={() =>
                updateFieldValue(
                  'transferRoutes',
                  routes.filter((_, i) => i !== index)
                )
              }
              className="w-11 h-11 mb-1 flex items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 focus-visible:ring-2 focus-visible:ring-teal-400/50"
            >
              <Trash2 size={14} aria-hidden="true" />
            </button>
          </div>
        ))}
        {routes.length < MAX_ROUTES && (
          <button
            type="button"
            onClick={() => updateFieldValue('transferRoutes', [...routes, { from: '', to: '' }])}
            className="min-h-[44px] px-4 rounded-xl bg-indigo-500/10 text-indigo-300 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-500/20 focus-visible:ring-2 focus-visible:ring-teal-400/50"
          >
            <Plus size={14} aria-hidden="true" /> Adicionar trecho
          </button>
        )}
        {getFieldError('transferRoutes') && (
          <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest ml-1">
            {getFieldError('transferRoutes')}
          </p>
        )}
      </fieldset>

      <ChipGroup
        label="Veículos"
        options={TRANSFER_VEHICLE_OPTIONS}
        selected={formData.transferVehicles}
        onToggle={(value) => toggleInList('transferVehicles', value)}
        required
        error={getFieldError('transferVehicles')}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField
          id="transfer-max-passengers"
          label="Passageiros por veículo (máximo)"
          inputMode="numeric"
          value={formData.maxPassengers}
          onChange={(value) => updateFieldValue('maxPassengers', value.replace(/\D/g, ''))}
          placeholder="Ex: 4"
          required
          error={getFieldError('maxPassengers')}
        />
        <TextField
          id="transfer-luggage"
          label="Bagagem"
          value={formData.luggageInfo}
          maxLength={500}
          onChange={(value) => updateFieldValue('luggageInfo', value)}
          placeholder="Ex: 1 mala grande e 1 de mão por pessoa"
        />
      </div>
    </div>
  );
}
