import React, { useState } from 'react';
import { Eye, CheckCircle2, Camera, Upload, X, User, Mail, Lock, EyeOff } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import { cn } from '../../../../shared/utils/cn';
import { useUI } from '../../../../shared/stores/useUIStore';

interface Step5MediaProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  errors?: { [key: string]: string };
  setErrors?: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
  currentUser: any;
  categories: { id: string; label: string }[];
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  hideReview?: boolean;
}

export function Step5Media({
  formData: propFormData,
  setFormData,
  errors: propErrors = {},
  currentUser,
  categories,
  setCurrentStep,
  fileInputRef,
  hideReview = false,
}: Step5MediaProps) {
  const [showPassword, setShowPassword] = useState(false);
  const { showToast } = useUI();
  const formContext = useFormContext();

  const formData = formContext ? formContext.watch() : propFormData;
  const rhfErrors = formContext ? formContext.formState.errors : {};

  const getFieldError = (field: string) => {
    return propErrors[field] || rhfErrors[field]?.message?.toString();
  };

  const updateFieldValue = (field: string, value: any) => {
    if (formContext) {
      formContext.setValue(field, value, { shouldValidate: true });
    }
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-10 py-4">
      {!hideReview && currentUser && (
        <div className="p-5 rounded-[2rem] bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
            <CheckCircle2 size={24} />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
              Sessão Ativa
            </p>
            <h4 className="text-sm font-bold text-white">Logado como {currentUser.email}</h4>
            <p className="text-[10px] text-white/50 mt-0.5">
              Sua nova pousada será vinculada à sua conta atual.
            </p>
          </div>
        </div>
      )}

      {/* Section: Review */}
      {!hideReview && (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-white/5 border border-white/10 text-indigo-400">
              <Eye size={18} />
            </span>
            <h3 className="text-sm font-black text-white uppercase tracking-widest">
              Revisão de Dados
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {/* Step 1 Review */}
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="group w-full p-5 rounded-3xl bg-white/5 border border-white/10 text-left hover:bg-white/10 transition-all active:scale-[0.99]"
            >
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
                  01. Identidade
                </span>
                <span className="text-[9px] font-bold text-white/50 uppercase group-hover:text-indigo-400 transition-colors">
                  Clique para editar
                </span>
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-black text-white uppercase">
                  {formData.businessName || 'Nome não preenchido'}
                </h4>
                <p className="text-[10px] text-white/50 uppercase font-black">
                  {categories.find((c) => c.id === formData.category)?.label}
                </p>
                <p className="text-xs text-white/60 line-clamp-2 mt-2 leading-relaxed">
                  {formData.description}
                </p>
              </div>
            </button>

            {/* Step 2 Review */}
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="group w-full p-5 rounded-3xl bg-white/5 border border-white/10 text-left hover:bg-white/10 transition-all active:scale-[0.99]"
            >
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
                  02. Contato e Local
                </span>
                <span className="text-[9px] font-bold text-white/50 uppercase group-hover:text-indigo-400 transition-colors">
                  Clique para editar
                </span>
              </div>
              <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                <div className="space-y-1">
                  <p className="text-[9px] text-white/50 uppercase font-black">WhatsApp</p>
                  <p className="text-xs text-white font-bold">{formData.phone}</p>
                </div>
                {formData.instagram && (
                  <div className="space-y-1">
                    <p className="text-[9px] text-white/50 uppercase font-black">Instagram</p>
                    <p className="text-xs text-white font-bold">{formData.instagram}</p>
                  </div>
                )}
                {formData.website && (
                  <div className="space-y-1">
                    <p className="text-[9px] text-white/50 uppercase font-black">Site</p>
                    <p className="text-xs text-white font-bold truncate">{formData.website}</p>
                  </div>
                )}
                {formData.bookingLinks && (
                  <div className="space-y-1">
                    <p className="text-[9px] text-white/50 uppercase font-black">Reserva</p>
                    <p className="text-xs text-white font-bold truncate">{formData.bookingLinks}</p>
                  </div>
                )}
                <div className="space-y-1">
                  <p className="text-[9px] text-white/50 uppercase font-black">Google Maps</p>
                  <p className="text-xs text-white font-bold truncate">{formData.googleMaps}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] text-white/50 uppercase font-black">Localização</p>
                  <p className="text-xs text-white font-bold truncate">
                    {formData.region}
                    {formData.address ? `, ${formData.address}` : ''}
                  </p>
                </div>
              </div>
            </button>

            {/* Step 3 Review */}
            {(formData.category === 'hotel' ||
              formData.category === 'restaurant' ||
              formData.category === 'sight') && (
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="group w-full p-5 rounded-3xl bg-white/5 border border-white/10 text-left hover:bg-white/10 transition-all active:scale-[0.99]"
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
                    03. Comodidades
                  </span>
                  <span className="text-[9px] font-bold text-white/50 uppercase group-hover:text-indigo-400 transition-colors">
                    Clique para editar
                  </span>
                </div>
                <div className="space-y-4">
                  {formData.category === 'hotel' ? (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-[9px] text-white/50 uppercase font-black">
                            Café da Manhã
                          </p>
                          <p className="text-xs text-white font-bold">
                            {formData.servesBreakfast
                              ? `Servido (${formData.breakfastIncluded ? 'Incluso' : `R$ ${formData.breakfastPrice}`})`
                              : 'Não servido'}
                          </p>
                          {formData.servesBreakfast &&
                            (formData.breakfastTypes || []).length > 0 && (
                              <p className="text-[9px] text-white/50 italic leading-tight">
                                {(formData.breakfastTypes || []).join(', ')}
                              </p>
                            )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-[9px] text-white/50 uppercase font-black">
                            Amenidades
                          </p>
                          <p className="text-xs text-white font-bold">
                            {(formData.amenities || []).length} selecionadas
                          </p>
                        </div>
                      </div>
                      {(formData.amenities || []).length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {(formData.amenities || []).slice(0, 8).map((amenity: string) => (
                            <span
                              key={amenity}
                              className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[8px] text-white/50 uppercase font-black tracking-tight"
                            >
                              {amenity}
                            </span>
                          ))}
                          {(formData.amenities || []).length > 8 && (
                            <span className="text-[8px] text-indigo-400 uppercase font-black">
                              + {(formData.amenities || []).length - 8}
                            </span>
                          )}
                        </div>
                      )}
                    </>
                  ) : formData.category === 'restaurant' ? (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-[9px] text-white/50 uppercase font-black">
                            Subcategoria / Culinária
                          </p>
                          <p className="text-xs text-white font-bold truncate">
                            {formData.subcategory} • {formData.cuisineType}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[9px] text-white/50 uppercase font-black">
                            Refeições / Comodidades
                          </p>
                          <p className="text-xs text-white font-bold">
                            {(formData.mealTypes || []).length} Ref. •{' '}
                            {(formData.additionalServices || []).length} Serv. •{' '}
                            {(formData.amenitiesRestaurant || []).length} Comod.
                          </p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {(formData.mealTypes || []).length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {(formData.mealTypes || []).map((type: string) => (
                              <span
                                key={type}
                                className="px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/10 text-[8px] text-indigo-400 uppercase font-black tracking-tight"
                              >
                                {type}
                              </span>
                            ))}
                          </div>
                        )}
                        {(formData.additionalServices || []).length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {(formData.additionalServices || []).map((service: string) => (
                              <span
                                key={service}
                                className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/10 text-[8px] text-emerald-400 uppercase font-black tracking-tight"
                              >
                                {service}
                              </span>
                            ))}
                          </div>
                        )}
                        {(formData.amenitiesRestaurant || []).length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {(formData.amenitiesRestaurant || []).map((amenity: string) => (
                              <span
                                key={amenity}
                                className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[8px] text-white/50 uppercase font-black tracking-tight"
                              >
                                {amenity}
                              </span>
                            ))}
                          </div>
                        )}
                        {(formData.menuLink || formData.menuFile) && (
                          <div className="space-y-1">
                            <p className="text-[9px] text-white/50 uppercase font-black">
                              Cardápio Digital
                            </p>
                            <p className="text-xs text-indigo-400 truncate">
                              {formData.menuLink ||
                                (formData.menuFile ? `Arquivo: ${formData.menuFile.name}` : '')}
                            </p>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-[9px] text-white/50 uppercase font-black">
                            Acesso / Atividades
                          </p>
                          <p className="text-xs text-white font-bold truncate">
                            {formData.sightAccessType === 'pago'
                              ? `Pago (R$ ${formData.sightPrice})`
                              : 'Gratuito'}{' '}
                            • {(formData.sightActivities || []).length} Ativ.
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[9px] text-white/50 uppercase font-black">
                            Serviços / Estrutura
                          </p>
                          <p className="text-xs text-white font-bold">
                            {(formData.sightServices || []).length} Serv. •{' '}
                            {(formData.sightAmenities || []).length} Comod.
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {(formData.sightServices || []).map((service: string) => (
                          <span
                            key={service}
                            className="px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/10 text-[8px] text-indigo-400 uppercase font-black tracking-tight"
                          >
                            {service}
                          </span>
                        ))}
                        {(formData.sightActivities || []).map((activity: string) => (
                          <span
                            key={activity}
                            className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/10 text-[8px] text-emerald-400 uppercase font-black tracking-tight"
                          >
                            {activity}
                          </span>
                        ))}
                        {(formData.sightAmenities || []).map((amenity: string) => (
                          <span
                            key={amenity}
                            className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[8px] text-white/50 uppercase font-black tracking-tight"
                          >
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </button>
            )}

            {/* Step 4 Review */}
            {(formData.category === 'hotel' ||
              formData.category === 'restaurant' ||
              formData.category === 'sight') && (
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="group w-full p-5 rounded-3xl bg-white/5 border border-white/10 text-left hover:bg-white/10 transition-all active:scale-[0.99]"
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
                    04. Operação
                  </span>
                  <span className="text-[9px] font-bold text-white/50 uppercase group-hover:text-indigo-400 transition-colors">
                    Clique para editar
                  </span>
                </div>
                <div className="space-y-5">
                  {formData.category === 'hotel' ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-[9px] text-white/50 uppercase font-black">
                          Check-in / Out
                        </p>
                        <p className="text-xs text-white font-bold leading-tight">
                          In: {formData.checkInFrom} - {formData.checkInTo}
                          <br />
                          Out: {formData.checkOutFrom} - {formData.checkOutTo}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] text-white/50 uppercase font-black">
                          Crianças e Pets
                        </p>
                        <p className="text-xs text-white font-bold leading-tight uppercase">
                          Crianças: {formData.childrenAllowed ? 'Sim' : 'Não'}
                          <br />
                          Pets: {formData.petsPolicy}{' '}
                          {formData.petsExtraCost ? `(${formData.petsExtraCost})` : ''}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-1">
                        <p className="text-[9px] text-white/50 uppercase font-black">
                          Horários de Funcionamento
                        </p>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                          {[
                            'domingo',
                            'segunda',
                            'terça',
                            'quarta',
                            'quinta',
                            'sexta',
                            'sábado',
                          ].map((day) => {
                            const hours = (formData.operatingHours?.[day] || {
                              open: '08:00',
                              close: '22:00',
                              closed: false,
                            }) as any;
                            return (
                              <div
                                key={day}
                                className="flex justify-between items-center bg-white/5 px-2 py-0.5 rounded"
                              >
                                <span className="text-[8px] text-white/50 uppercase font-black">
                                  {day.slice(0, 3)}
                                </span>
                                <span className="text-[8px] text-white font-bold">
                                  {hours.closed ? 'FECHADO' : `${hours.open} - ${hours.close}`}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                  {(formData.languages || []).length > 0 && (
                    <div className="space-y-1">
                      <p className="text-[9px] text-white/50 uppercase font-black">
                        Idiomas Atendidos
                      </p>
                      <p className="text-xs text-white/60 font-bold uppercase tracking-tight">
                        {(formData.languages || []).join(' • ')}
                      </p>
                    </div>
                  )}
                </div>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Section: Photos */}
      {formData.category !== 'event' && (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-white/5 border border-white/10 text-indigo-400">
              <Camera size={18} />
            </span>
            <h3 className="text-sm font-black text-white uppercase tracking-widest">
              Fotos do Estabelecimento <span className="text-red-500">*</span>
            </h3>
          </div>

          <div className="space-y-4">
            <div
              onClick={() => (formData.images || []).length < 5 && fileInputRef.current?.click()}
              className={cn(
                'relative group cursor-pointer border-2 border-dashed rounded-[2rem] p-10 flex flex-col items-center justify-center gap-4 transition-all overflow-hidden',
                (formData.images || []).length >= 5
                  ? 'border-white/5 bg-white/5 opacity-50 cursor-not-allowed'
                  : 'border-white/10 hover:border-indigo-500/50 hover:bg-indigo-500/5'
              )}
            >
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                <Upload size={24} />
              </div>
              <div className="text-center">
                <p className="text-sm font-black text-white uppercase tracking-tight">
                  Adicionar Fotos <span className="text-red-500">*</span>
                </p>
                <p className="text-[10px] text-white/50 uppercase font-black mt-1">
                  Até 5 imagens • Máx. 3MB por arquivo
                </p>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || []) as File[];
                  const currentImages = formData.images || [];
                  if (currentImages.length + files.length > 5) {
                    showToast('Você pode selecionar no máximo 5 fotos.', 'error');
                    return;
                  }

                  const newImages = files
                    .filter((file) => {
                      if (file.size > 3 * 1024 * 1024) {
                        showToast(`Arquivo ${file.name} excede 3MB.`, 'error');
                        return false;
                      }
                      return true;
                    })
                    .map((file) => ({
                      file,
                      id: Math.random().toString(36).substr(2, 9),
                      preview: URL.createObjectURL(file),
                    }));

                  updateFieldValue('images', [...currentImages, ...newImages]);
                }}
              />
            </div>
            {getFieldError('images') && (
              <p className="text-xs text-red-400 font-medium ml-1">{getFieldError('images')}</p>
            )}

            {/* Previews */}
            {(formData.images || []).length > 0 && (
              <div className="grid grid-cols-5 gap-2">
                {(formData.images || []).map((img: any) => (
                  <div
                    key={img.id}
                    className="relative aspect-square rounded-xl overflow-hidden border border-white/10"
                  >
                    <img src={img.preview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        updateFieldValue(
                          'images',
                          (formData.images || []).filter((i: any) => i.id !== img.id)
                        );
                        URL.revokeObjectURL(img.preview);
                      }}
                      className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white hover:bg-red-500 transition-colors"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Section: Partner Account */}
      {!currentUser && (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-white/5 border border-white/10 text-indigo-400">
              <User size={18} />
            </span>
            <h3 className="text-sm font-black text-white uppercase tracking-widest">
              Conta de Parceiro
            </h3>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">
                  Nome
                </label>
                <input
                  type="text"
                  value={formData.firstName || ''}
                  onChange={(e) => updateFieldValue('firstName', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-sans font-medium"
                />
                {getFieldError('firstName') && (
                  <p className="text-xs text-red-400 font-medium ml-1">
                    {getFieldError('firstName')}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">
                  Sobrenome
                </label>
                <input
                  type="text"
                  value={formData.lastName || ''}
                  onChange={(e) => updateFieldValue('lastName', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-sans font-medium"
                />
                {getFieldError('lastName') && (
                  <p className="text-xs text-red-400 font-medium ml-1">
                    {getFieldError('lastName')}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">
                E-mail para acesso
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => updateFieldValue('email', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                />
              </div>
              {getFieldError('email') && (
                <p className="text-xs text-red-400 font-medium ml-1">{getFieldError('email')}</p>
              )}
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">
                  Crie uma senha
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password || ''}
                    onChange={(e) => updateFieldValue('password', e.target.value)}
                    placeholder="8-20 caracteres (A, a, 1)"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-12 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-mono tracking-widest"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {getFieldError('password') && (
                  <p className="text-xs text-red-400 font-medium ml-1">
                    {getFieldError('password')}
                  </p>
                )}

                {/* Password Requirements Indicators */}
                <div className="grid grid-cols-2 gap-2 mt-2 px-1">
                  {[
                    {
                      label: '8-20 Carácteres',
                      met:
                        (formData.password || '').length >= 8 &&
                        (formData.password || '').length <= 20,
                    },
                    { label: 'Letra Maiúscula', met: /[A-Z]/.test(formData.password || '') },
                    { label: 'Letra Minúscula', met: /[a-z]/.test(formData.password || '') },
                    { label: 'Número', met: /\d/.test(formData.password || '') },
                  ].map((req, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div
                        className={cn(
                          'w-1.5 h-1.5 rounded-full transition-all duration-300',
                          req.met
                            ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]'
                            : 'bg-white/10'
                        )}
                      />
                      <span
                        className={cn(
                          'text-[9px] font-bold uppercase tracking-tight transition-colors duration-300',
                          req.met ? 'text-emerald-400' : 'text-white/50'
                        )}
                      >
                        {req.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">
                  Confirmar Senha
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.confirmPassword || ''}
                    onChange={(e) => updateFieldValue('confirmPassword', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-12 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-mono tracking-widest"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {getFieldError('confirmPassword') && (
                  <p className="text-xs text-red-400 font-medium ml-1">
                    {getFieldError('confirmPassword')}
                  </p>
                )}
                {formData.password &&
                  formData.confirmPassword &&
                  formData.password !== formData.confirmPassword && (
                    <p className="text-[9px] text-red-400 font-bold uppercase tracking-widest ml-1">
                      As senhas não coincidem
                    </p>
                  )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section: Terms */}
      <div className="pt-4">
        <button
          type="button"
          onClick={() => updateFieldValue('termsAccepted', !formData.termsAccepted)}
          className={cn(
            'w-full flex items-start gap-4 p-5 rounded-2xl border transition-all text-left',
            formData.termsAccepted
              ? 'bg-indigo-500/10 border-indigo-500/50'
              : 'bg-white/5 border-white/10 active:scale-[0.98]'
          )}
        >
          <div
            className={cn(
              'mt-1 w-5 h-5 rounded-md border-2 shrink-0 flex items-center justify-center transition-all',
              formData.termsAccepted ? 'bg-indigo-500 border-indigo-500' : 'border-white/20'
            )}
          >
            {formData.termsAccepted && (
              <CheckCircle2 size={12} className="text-white" strokeWidth={4} />
            )}
          </div>
          <div className="space-y-1">
            <p className="text-xs font-black text-white uppercase tracking-tight">
              Aceito os Termos de Parceria
            </p>
            <p className="text-[10px] text-white/50 leading-relaxed">
              Confirmo que todas as informações prestadas são verdadeiras e estou de acordo com os
              critérios de seleção do Use Guide.
            </p>
          </div>
        </button>
        {getFieldError('termsAccepted') && (
          <p className="text-xs text-red-400 font-medium ml-1 mt-1">
            {getFieldError('termsAccepted')}
          </p>
        )}
      </div>
    </div>
  );
}
