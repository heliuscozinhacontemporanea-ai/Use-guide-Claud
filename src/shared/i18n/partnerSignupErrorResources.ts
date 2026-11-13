// Mensagens de validação do cadastro de parceiro: os schemas devolvem a chave (§12.5).
export interface PartnerSignupErrorsTranslation {
  requiredNote: string;
  categoryRequired: string;
  producerNameRequired: string;
  nameRequired: string;
  descriptionRequired: string;
  descriptionTooLong: string;
  phoneRequired: string;
  stateRequired: string;
  cityRequired: string;
  bookingRequired: string;
  mapsRequired: string;
  regionRequired: string;
  durationRequired: string;
  meetingPointRequired: string;
  routesRequired: string;
  vehiclesRequired: string;
  capacityRequired: string;
  rentalWhatRequired: string;
  minHoursRequired: string;
  breakfastRequired: string;
  breakfastIncludedRequired: string;
  breakfastPriceRequired: string;
  subcategoryRequired: string;
  accessRequired: string;
  accessPriceRequired: string;
  checkTimesRequired: string;
  childrenRequired: string;
  petsRequired: string;
  petsCostRequired: string;
  photosRequired: string;
  firstNameRequired: string;
  emailInvalid: string;
  passwordWeak: string;
  passwordMismatch: string;
  termsRequired: string;
  contactInText: string;
}

export const partnerSignupErrorsPtBR: PartnerSignupErrorsTranslation = {
  contactInText:
    'Tire telefone, e-mail, links, @ e chave Pix do texto. O contato com o cliente acontece depois da compra, pelo pedido.',
  requiredNote: 'Campos com * são obrigatórios.',
  categoryRequired: 'Escolha uma categoria.',
  producerNameRequired: 'Informe o nome do produtor.',
  nameRequired: 'Informe o nome do estabelecimento.',
  descriptionRequired: 'Escreva uma descrição.',
  descriptionTooLong: 'A descrição pode ter até 400 caracteres.',
  phoneRequired: 'Informe o telefone ou WhatsApp.',
  stateRequired: 'Escolha o estado.',
  cityRequired: 'Informe a cidade.',
  bookingRequired: 'Informe o link de reserva.',
  mapsRequired: 'Informe o link do Google Maps.',
  regionRequired: 'Informe a região ou o bairro.',
  durationRequired: 'Informe a duração.',
  meetingPointRequired: 'Informe o ponto de encontro.',
  routesRequired: 'Adicione ao menos um trecho com origem e destino.',
  vehiclesRequired: 'Escolha ao menos um veículo.',
  capacityRequired: 'Informe quantos passageiros cabem.',
  rentalWhatRequired: 'Escolha o que é alugado.',
  minHoursRequired: 'Informe o período mínimo.',
  breakfastRequired: 'Responda se serve café da manhã.',
  breakfastIncludedRequired: 'Responda se o café está incluso.',
  breakfastPriceRequired: 'Informe o preço do café da manhã.',
  subcategoryRequired: 'Informe a subcategoria.',
  accessRequired: 'Escolha se o acesso é pago ou gratuito.',
  accessPriceRequired: 'Informe o preço por pessoa.',
  checkTimesRequired: 'Informe os horários de check-in e check-out.',
  childrenRequired: 'Responda se aceita crianças.',
  petsRequired: 'Responda se aceita pets.',
  petsCostRequired: 'Responda se cobra pelos pets.',
  photosRequired: 'Adicione ao menos uma foto.',
  firstNameRequired: 'Informe seu nome.',
  emailInvalid: 'Informe um e-mail válido.',
  passwordWeak: 'A senha precisa de 8 a 20 caracteres, com maiúscula, minúscula e número.',
  passwordMismatch: 'As senhas não coincidem.',
  termsRequired: 'Aceite os termos para continuar.',
};
