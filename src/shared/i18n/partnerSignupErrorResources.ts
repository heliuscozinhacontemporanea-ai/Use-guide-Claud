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

export const partnerSignupErrorsEn: PartnerSignupErrorsTranslation = {
  contactInText:
    'Remove phone numbers, emails, links, @ handles and Pix keys from the text. You talk to customers after the purchase, through the order.',
  requiredNote: 'Fields marked * are required.',
  categoryRequired: 'Choose a category.',
  producerNameRequired: "Enter the producer's name.",
  nameRequired: 'Enter the business name.',
  descriptionRequired: 'Write a description.',
  descriptionTooLong: 'The description can be up to 400 characters.',
  phoneRequired: 'Enter the phone or WhatsApp number.',
  stateRequired: 'Choose the state.',
  cityRequired: 'Enter the city.',
  bookingRequired: 'Enter the booking link.',
  mapsRequired: 'Enter the Google Maps link.',
  regionRequired: 'Enter the area or neighborhood.',
  durationRequired: 'Enter the duration.',
  meetingPointRequired: 'Enter the meeting point.',
  routesRequired: 'Add at least one route with a start and an end.',
  vehiclesRequired: 'Choose at least one vehicle.',
  capacityRequired: 'Enter how many passengers fit.',
  rentalWhatRequired: 'Choose what you rent out.',
  minHoursRequired: 'Enter the minimum period.',
  breakfastRequired: 'Say whether you serve breakfast.',
  breakfastIncludedRequired: 'Say whether breakfast is included.',
  breakfastPriceRequired: 'Enter the breakfast price.',
  subcategoryRequired: 'Enter the subcategory.',
  accessRequired: 'Choose whether access is paid or free.',
  accessPriceRequired: 'Enter the price per person.',
  checkTimesRequired: 'Enter the check-in and check-out times.',
  childrenRequired: 'Say whether children are welcome.',
  petsRequired: 'Say whether pets are allowed.',
  petsCostRequired: 'Say whether you charge for pets.',
  photosRequired: 'Add at least one photo.',
  firstNameRequired: 'Enter your name.',
  emailInvalid: 'Enter a valid email.',
  passwordWeak: 'The password needs 8 to 20 characters, with uppercase, lowercase and a number.',
  passwordMismatch: "The passwords don't match.",
  termsRequired: 'Accept the terms to continue.',
};

export const partnerSignupErrorsFr: PartnerSignupErrorsTranslation = {
  contactInText:
    'Retirez téléphone, e-mail, liens, @ et clé Pix du texte. Le contact avec le client se fait après l’achat, via la commande.',
  requiredNote: 'Les champs marqués * sont obligatoires.',
  categoryRequired: 'Choisissez une catégorie.',
  producerNameRequired: 'Indiquez le nom du producteur.',
  nameRequired: "Indiquez le nom de l'établissement.",
  descriptionRequired: 'Rédigez une description.',
  descriptionTooLong: "La description peut compter jusqu'à 400 caractères.",
  phoneRequired: 'Indiquez le téléphone ou WhatsApp.',
  stateRequired: "Choisissez l'État.",
  cityRequired: 'Indiquez la ville.',
  bookingRequired: 'Indiquez le lien de réservation.',
  mapsRequired: 'Indiquez le lien Google Maps.',
  regionRequired: 'Indiquez la zone ou le quartier.',
  durationRequired: 'Indiquez la durée.',
  meetingPointRequired: 'Indiquez le point de rendez-vous.',
  routesRequired: 'Ajoutez au moins un trajet avec départ et arrivée.',
  vehiclesRequired: 'Choisissez au moins un véhicule.',
  capacityRequired: 'Indiquez le nombre de passagers.',
  rentalWhatRequired: 'Choisissez ce que vous louez.',
  minHoursRequired: 'Indiquez la durée minimale.',
  breakfastRequired: 'Indiquez si vous servez le petit-déjeuner.',
  breakfastIncludedRequired: 'Indiquez si le petit-déjeuner est inclus.',
  breakfastPriceRequired: 'Indiquez le prix du petit-déjeuner.',
  subcategoryRequired: 'Indiquez la sous-catégorie.',
  accessRequired: "Indiquez si l'accès est payant ou gratuit.",
  accessPriceRequired: 'Indiquez le prix par personne.',
  checkTimesRequired: "Indiquez les heures d'arrivée et de départ.",
  childrenRequired: 'Indiquez si les enfants sont acceptés.',
  petsRequired: 'Indiquez si les animaux sont acceptés.',
  petsCostRequired: 'Indiquez si les animaux sont payants.',
  photosRequired: 'Ajoutez au moins une photo.',
  firstNameRequired: 'Indiquez votre prénom.',
  emailInvalid: 'Indiquez un e-mail valide.',
  passwordWeak:
    'Le mot de passe doit avoir de 8 à 20 caractères, avec majuscule, minuscule et chiffre.',
  passwordMismatch: 'Les mots de passe ne correspondent pas.',
  termsRequired: 'Acceptez les conditions pour continuer.',
};
