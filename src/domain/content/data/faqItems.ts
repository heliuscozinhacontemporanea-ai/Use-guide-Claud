import { Compass, Wind, User, Award, AlertTriangle, Key } from 'lucide-react';
import { FAQItem } from '../types/content';

export const FAQ_DATA: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'general',
    question: 'O que é o aplicativo Use Guide?',
    answer:
      'O Use Guide é um guia de viagem de luxo focado na curadoria exclusiva das vilas paradisíacas de Jericoacoara, Preá e Barrinha de Baixo. Ele reúne os melhores hotéis boutique, restaurantes contemporâneos, passeios de buggy e cartões postais com a sofisticação da estética Glassmorphism.',
    icon: Compass,
  },
  {
    id: 'faq-2',
    category: 'kitesurf',
    question: 'Como funcionam as condições de vento ao vivo?',
    answer:
      'A nossa aba de Condições apresenta leituras em tempo real obtidas de sensores meteorológicos das praias do Preá e Jeri. Mostramos a velocidade em nós (knots), rajadas e a direção favorável para velejo, funcionando como suporte essencial para kitesurfistas.',
    icon: Wind,
  },
  {
    id: 'faq-3',
    category: 'account',
    question: 'Como posso favoritar e avaliar atrações?',
    answer:
      'Basta criar uma conta gratuita e realizar o login. Qualquer card de hotel, restaurante ou ponto turístico terá um ícone de coração para favoritar e um campo de resenhas para você dar notas de 1 a 5 estrelas contando sua recomendação.',
    icon: User,
  },
  {
    id: 'faq-4',
    category: 'partner',
    question: 'O que é o Programa de Parceiros Use Guide?',
    answer:
      'É um programa de fomento turístico onde hotéis, restaurantes e guias autônomos locais recebem o selo dourado de verificação após passar por nossa curadoria, garantindo maior destaque e segurança para os viajantes exigentes.',
    icon: Award,
  },
  {
    id: 'faq-5',
    category: 'general',
    question: 'Como funciona a Central de Emergência?',
    answer:
      'Ao clicar no botão vermelho "Central de Emergência", você tem acesso imediato a telefones úteis de Jericoacoara e Jijoca, incluindo pronto-atendimento 24h, policiamento de turismo, resgate de dunas e Corpo de Bombeiros com discagem instantânea.',
    icon: AlertTriangle,
  },
  {
    id: 'faq-6',
    category: 'account',
    question: 'Esqueci minha senha, como faço para recuperar?',
    answer:
      'Na tela de login, clique no link "Esqueci minha senha". Digite seu e-mail cadastrado e enviaremos um link de redefinição seguro diretamente para sua caixa de entrada através do Firebase Auth.',
    icon: Key,
  },
];
