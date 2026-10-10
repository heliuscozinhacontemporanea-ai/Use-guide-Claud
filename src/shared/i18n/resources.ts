export interface TranslationResource {
  common: {
    language: string;
    locales: {
      ptBR: string;
      en: string;
      fr: string;
    };
  };
  header: {
    openMenu: string;
    closeMenu: string;
    profileAlt: string;
    openSearch: string;
    managementPanel: string;
    myPanel: string;
    openManagementPanel: string;
    openMyPanel: string;
    pageTitles: {
      events: string;
      tours: string;
      accommodations: string;
      restaurants: string;
      attractions: string;
      practicalGuide: string;
    };
  };
  menu: {
    mainTitle: string;
    subtitle: string;
    closeMenu: string;
    changeProfilePhoto: string;
    userFallback: string;
    signInOrRegister: string;
    account: string;
    favorites: string;
    emailPassword: string;
    orUse: string;
    continueGoogle: string;
    managementPanel: string;
    myPanel: string;
    servicesInfo: string;
    partnerProgram: string;
    emergencyCenter: string;
    support: string;
    aboutApp: string;
    logout: string;
  };
  navigation: {
    explore: string;
    events: string;
    tours: string;
    accommodations: string;
    restaurants: string;
    attractions: string;
    tips: string;
  };
  errors: {
    media: {
      IMAGE_TOO_LARGE: string;
      INVALID_IMAGE: string;
      UPLOAD_FAILED: string;
      STORAGE_UNAVAILABLE: string;
    };
  };
}
const ptBR: TranslationResource = {
  common: {
    language: 'Idioma',
    locales: {
      ptBR: 'Português (Brasil)',
      en: 'English',
      fr: 'Français',
    },
  },
  header: {
    openMenu: 'Abrir menu',
    closeMenu: 'Fechar menu',
    profileAlt: 'Perfil',
    openSearch: 'Abrir busca',
    managementPanel: 'Painel de Gestão',
    myPanel: 'Meu Painel',
    openManagementPanel: 'Abrir painel de gestão',
    openMyPanel: 'Abrir meu painel',
    pageTitles: {
      events: 'Eventos & Experiências',
      tours: 'Aventura & Passeios',
      accommodations: 'Melhores Hospedagens',
      restaurants: 'Sabores Locais',
      attractions: 'Atrações',
      practicalGuide: 'Guia Prático',
    },
  },
  menu: {
    mainTitle: 'Menu Principal',
    subtitle: 'Gerencie sua experiência',
    closeMenu: 'Fechar menu',
    changeProfilePhoto: 'Alterar foto de perfil',
    userFallback: 'Usuário',
    signInOrRegister: 'Entrar ou cadastre-se',
    account: 'Conta',
    favorites: 'Meus Favoritos',
    emailPassword: 'E-mail e Senha',
    orUse: 'Ou use',
    continueGoogle: 'Continuar com Google',
    managementPanel: 'Painel de Gestão',
    myPanel: 'Meu Painel',
    servicesInfo: 'Serviços & Info',
    partnerProgram: 'Programa de Parceiros',
    emergencyCenter: 'Central de Emergência',
    support: 'Suporte / Ajuda',
    aboutApp: 'Sobre o App',
    logout: 'Sair',
  },
  navigation: {
    explore: 'Explorar',
    events: 'Eventos',
    tours: 'Passeios',
    accommodations: 'Hospedagens',
    restaurants: 'Restaurantes',
    attractions: 'Atrações',
    tips: 'Dicas',
  },
  errors: {
    media: {
      IMAGE_TOO_LARGE: 'A imagem passa de 6 MB. Escolha uma imagem menor.',
      INVALID_IMAGE: 'Formato não suportado. Envie uma imagem JPEG, PNG ou WebP.',
      UPLOAD_FAILED: 'Não foi possível enviar a imagem. Tente novamente.',
      STORAGE_UNAVAILABLE: 'O armazenamento está indisponível no momento. Tente novamente em instantes.',
    },
  },
};
const en: TranslationResource = {
  common: {
    language: 'Language',
    locales: {
      ptBR: 'Português (Brasil)',
      en: 'English',
      fr: 'Français',
    },
  },
  header: {
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    profileAlt: 'Profile',
    openSearch: 'Open search',
    managementPanel: 'Management Panel',
    myPanel: 'My Panel',
    openManagementPanel: 'Open management panel',
    openMyPanel: 'Open my panel',
    pageTitles: {
      events: 'Events & Experiences',
      tours: 'Adventure & Tours',
      accommodations: 'Best Accommodations',
      restaurants: 'Local Flavors',
      attractions: 'Attractions',
      practicalGuide: 'Practical Guide',
    },
  },
  menu: {
    mainTitle: 'Main Menu',
    subtitle: 'Manage your experience',
    closeMenu: 'Close menu',
    changeProfilePhoto: 'Change profile photo',
    userFallback: 'User',
    signInOrRegister: 'Sign in or register',
    account: 'Account',
    favorites: 'My Favorites',
    emailPassword: 'Email & Password',
    orUse: 'Or use',
    continueGoogle: 'Continue with Google',
    managementPanel: 'Management Panel',
    myPanel: 'My Panel',
    servicesInfo: 'Services & Info',
    partnerProgram: 'Partner Program',
    emergencyCenter: 'Emergency Center',
    support: 'Support / Help',
    aboutApp: 'About the App',
    logout: 'Sign out',
  },
  navigation: {
    explore: 'Explore',
    events: 'Events',
    tours: 'Tours',
    accommodations: 'Accommodations',
    restaurants: 'Restaurants',
    attractions: 'Attractions',
    tips: 'Tips',
  },
  errors: {
    media: {
      IMAGE_TOO_LARGE: 'The image is larger than 6 MB. Choose a smaller image.',
      INVALID_IMAGE: 'Unsupported format. Upload a JPEG, PNG or WebP image.',
      UPLOAD_FAILED: 'The image could not be uploaded. Please try again.',
      STORAGE_UNAVAILABLE: 'Storage is unavailable right now. Please try again shortly.',
    },
  },
};
const fr: TranslationResource = {
  common: {
    language: 'Langue',
    locales: {
      ptBR: 'Português (Brasil)',
      en: 'English',
      fr: 'Français',
    },
  },
  header: {
    openMenu: 'Ouvrir le menu',
    closeMenu: 'Fermer le menu',
    profileAlt: 'Profil',
    openSearch: 'Ouvrir la recherche',
    managementPanel: 'Panneau de gestion',
    myPanel: 'Mon espace',
    openManagementPanel: 'Ouvrir le panneau de gestion',
    openMyPanel: 'Ouvrir mon espace',
    pageTitles: {
      events: 'Événements & Expériences',
      tours: 'Aventure & Excursions',
      accommodations: 'Meilleurs Hébergements',
      restaurants: 'Saveurs Locales',
      attractions: 'Attractions',
      practicalGuide: 'Guide Pratique',
    },
  },
  menu: {
    mainTitle: 'Menu principal',
    subtitle: 'Gérez votre expérience',
    closeMenu: 'Fermer le menu',
    changeProfilePhoto: 'Changer la photo de profil',
    userFallback: 'Utilisateur',
    signInOrRegister: 'Connexion ou inscription',
    account: 'Compte',
    favorites: 'Mes favoris',
    emailPassword: 'E-mail et mot de passe',
    orUse: 'Ou utiliser',
    continueGoogle: 'Continuer avec Google',
    managementPanel: 'Panneau de gestion',
    myPanel: 'Mon espace',
    servicesInfo: 'Services et infos',
    partnerProgram: 'Programme partenaires',
    emergencyCenter: 'Centre d’urgence',
    support: 'Support / Aide',
    aboutApp: 'À propos de l’app',
    logout: 'Se déconnecter',
  },
  navigation: {
    explore: 'Explorer',
    events: 'Événements',
    tours: 'Excursions',
    accommodations: 'Hébergements',
    restaurants: 'Restaurants',
    attractions: 'Attractions',
    tips: 'Conseils',
  },
  errors: {
    media: {
      IMAGE_TOO_LARGE: "L'image dépasse 6 Mo. Choisissez une image plus légère.",
      INVALID_IMAGE: 'Format non pris en charge. Envoyez une image JPEG, PNG ou WebP.',
      UPLOAD_FAILED: "Impossible d'envoyer l'image. Veuillez réessayer.",
      STORAGE_UNAVAILABLE: 'Le stockage est indisponible pour le moment. Réessayez dans un instant.',
    },
  },
};
export const resources = {
  'pt-BR': {
    translation: ptBR,
  },
  en: {
    translation: en,
  },
  fr: {
    translation: fr,
  },
} as const;
