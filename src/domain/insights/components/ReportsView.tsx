import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  Eye,
  MessageSquare,
  Heart,
  MessageCircle,
  ChevronRight,
  ArrowLeft,
  Send,
  Star,
  Share2,
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../../shared/utils/cn';
import { getItemStatsUseCase } from '../application/usecases/getItemStatsUseCase';
import { getReviewsUseCase, respondToReviewUseCase } from '../../reviews';
import { GuideItem } from '../../guide';
import { VerifiedBadge } from '../../../ui/components/VerifiedBadge';
import { useUI } from '../../../shared/stores/useUIStore';
import { ErrorState } from '../../../ui/components/ErrorState';

interface InteractionHistory {
  date: string;
  [key: string]: any;
}

interface ReportData {
  views: number;
  whatsapp: number;
  favorites: number;
  shares: number;
  history: InteractionHistory[];
}

interface PartnerReview {
  id: string;
  itemId: string;
  userId?: string;
  userName?: string;
  rating?: number;
  comment?: string;
  createdAt?: any;
  partnerResponse?: string;
  respondedAt?: any;
}

interface ReportsViewProps {
  partnerId: string;
  items: GuideItem[];
  events: GuideItem[];
}

const PENDING_PREVIEW_COUNT = 3;

export function ReportsView({ items, events }: ReportsViewProps) {
  const { showToast } = useUI();
  const [selectedEntity, setSelectedEntity] = useState<{
    id: string;
    type: 'items' | 'events';
  } | null>(
    items.length === 1 && events.length === 0 && items[0]
      ? { id: items[0].id, type: 'items' }
      : events.length === 1 && items.length === 0 && events[0]
        ? { id: events[0].id, type: 'events' }
        : null
  );
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [reviews, setReviews] = useState<PartnerReview[]>([]);
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [showAllPending, setShowAllPending] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (selectedEntity) {
      loadReports(selectedEntity.id, selectedEntity.type);
    }
  }, [selectedEntity]);

  const loadReports = async (itemId: string, type: 'items' | 'events') => {
    setLoading(true);
    setLoadError(false);
    try {
      const realStats = await getItemStatsUseCase(itemId, type);

      const statsData = {
        views: realStats?.views || 0,
        whatsapp: realStats?.whatsapp_click || 0,
        favorites: realStats?.favorite || 0,
        shares: realStats?.share || 0,
        history: realStats?.history || [],
      };

      setReportData(statsData);

      const reviewsPage = await getReviewsUseCase(itemId, 50);
      setReviews(reviewsPage.items as PartnerReview[]);
    } catch (error) {
      console.error('[loadReports Error]:', error);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  const unansweredReviews = reviews.filter((r) => !r.partnerResponse);

  const handleReplyReview = async (reviewId: string) => {
    if (!replyText.trim()) return;
    try {
      await respondToReviewUseCase(reviewId, replyText);
      setReviews((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, partnerResponse: replyText } : r))
      );
      setReplyingTo(null);
      setReplyText('');
    } catch {
      showToast('Erro ao enviar resposta.', 'error');
    }
  };

  const allEntities = [
    ...items.map((i) => ({ ...i, type: 'items' as const })),
    ...events.map((e) => ({ ...e, type: 'events' as const })),
  ];

  if (allEntities.length === 0) {
    return (
      <div className="py-20 text-center glassmorphism rounded-[2rem] border border-white/5">
        <p className="text-[11px] text-white/50 font-medium tracking-wide">
          Nenhum registro encontrado para relatório
        </p>
      </div>
    );
  }

  if (!selectedEntity) {
    return (
      <div className="space-y-6">
        <h3 className="text-sm font-semibold text-white/50 tracking-wide px-4">
          Selecione um item ou evento para ver o relatório
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {allEntities.map((entity) => (
            <div
              key={entity.id}
              onClick={() => setSelectedEntity({ id: entity.id, type: entity.type })}
              className="glassmorphism rounded-3xl p-5 flex items-center gap-4 cursor-pointer hover:bg-white/5 hover:border-amber-500/30 transition-all border border-white/5"
            >
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white/5 relative">
                <img src={entity.image} alt="" className="w-full h-full object-cover" />
                <div
                  className={cn(
                    'absolute top-1 right-1 px-1.5 py-0.5 rounded text-[7px] font-bold tracking-widest',
                    entity.type === 'items' ? 'bg-teal-500 text-black' : 'bg-[#00D4FF] text-black'
                  )}
                >
                  {entity.type === 'items' ? 'Item' : 'Evento'}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 min-w-0">
                  <h4 className="text-sm font-bold text-white truncate">{entity.name}</h4>
                  {entity.type === 'items' &&
                    entity.isVerified &&
                    !entity.isVerificationSuspended && (
                      <VerifiedBadge size="sm" className="text-[14px] flex-shrink-0" />
                    )}
                </div>
                <p className="text-[10px] text-white/50 font-semibold tracking-wide">
                  {entity.location}
                </p>
              </div>
              <ChevronRight size={16} className="text-white/50" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const currentEntity = allEntities.find((e) => e.id === selectedEntity.id);

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <button
          onClick={() => (allEntities.length > 1 ? setSelectedEntity(null) : null)}
          aria-label="Ver Todos os itens e eventos"
          className={cn(
            'p-3 min-w-[44px] min-h-[44px] rounded-2xl bg-white/5 border border-white/10 text-white/50 hover:text-white transition-all flex items-center gap-2',
            allEntities.length === 1 && 'opacity-0 pointer-events-none'
          )}
        >
          <ArrowLeft size={18} />
          <span className="text-[10px] font-semibold tracking-wide">Ver Todos</span>
        </button>
        <div className="text-right">
          <div className="flex items-center justify-end gap-2 mb-1">
            <span
              className={cn(
                'px-2 py-0.5 rounded text-[8px] font-bold tracking-widest',
                selectedEntity.type === 'items'
                  ? 'bg-teal-500/20 text-teal-400'
                  : 'bg-[#00D4FF]/20 text-[#00D4FF]'
              )}
            >
              {selectedEntity.type === 'items' ? 'Estabelecimento' : 'Evento'}
            </span>
          </div>
          <h3 className="text-lg font-display font-black text-white tracking-tight flex items-center justify-end gap-1.5">
            {currentEntity?.name}
            {currentEntity?.type === 'items' &&
              currentEntity?.isVerified &&
              !currentEntity?.isVerificationSuspended && (
                <VerifiedBadge size="md" className="text-[18px] flex-shrink-0" />
              )}
          </h3>
          <p className="text-[10px] text-amber-500 font-semibold tracking-wide">
            Relatório de Insights
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : loadError && selectedEntity ? (
        <ErrorState
          message="Não foi possível carregar o relatório deste item."
          onRetry={() => loadReports(selectedEntity.id, selectedEntity.type)}
        />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="grid grid-cols-2 gap-4">
            {[
              {
                label: 'Visualizações',
                value: reportData?.views,
                icon: Eye,
                color: 'text-blue-400',
                bg: 'bg-blue-400/10',
              },
              {
                label: 'Cliques WhatsApp',
                value: reportData?.whatsapp,
                icon: MessageCircle,
                color: 'text-emerald-400',
                bg: 'bg-emerald-400/10',
              },
              {
                label: 'Favoritados',
                value: reportData?.favorites,
                icon: Heart,
                color: 'text-rose-400',
                bg: 'bg-rose-400/10',
              },
              {
                label: 'Compartilhados',
                value: reportData?.shares,
                icon: Share2,
                color: 'text-cyan-400',
                bg: 'bg-cyan-400/10',
              },
            ].map((stat, i) => (
              <div key={i} className="glassmorphism rounded-3xl p-6 border border-white/5">
                <div
                  className={cn(
                    'w-10 h-10 rounded-2xl flex items-center justify-center mb-4',
                    stat.bg,
                    stat.color
                  )}
                >
                  <stat.icon size={20} />
                </div>
                <div className="text-2xl font-display font-black text-white leading-none">
                  {stat.value?.toLocaleString()}
                </div>
                <div className="text-[10px] font-semibold tracking-wide text-white/50 mt-2">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          <div className="glassmorphism rounded-[2rem] p-8 border border-white/5 overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h4 className="text-sm font-semibold text-white tracking-wide">Fluxo de Visitas</h4>
                <p className="text-[10px] text-white/50 font-medium tracking-wide">
                  Últimos 7 dias
                </p>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reportData?.history || []}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.05)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: 700 }}
                    dy={10}
                  />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                    }}
                    itemStyle={{ color: '#fff', fontSize: '10px', fontWeight: 600 }}
                    labelStyle={{
                      color: 'rgba(255,255,255,0.5)',
                      fontSize: '9px',
                      fontWeight: 500,
                    }}
                  />
                  <Bar dataKey="views" radius={[6, 6, 0, 0]}>
                    {(reportData?.history || []).map((_: InteractionHistory, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index === 6 ? '#F59E0B' : 'rgba(245, 158, 11, 0.3)'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glassmorphism rounded-[2rem] p-8 border border-white/5">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h4 className="text-sm font-semibold text-white tracking-wide">
                  Avaliações Pendentes
                </h4>
                <p className="text-[10px] text-white/50 font-medium tracking-wide">
                  {unansweredReviews.length} aguardando resposta
                </p>
              </div>
              {unansweredReviews.length > PENDING_PREVIEW_COUNT && (
                <button
                  type="button"
                  onClick={() => setShowAllPending((prev) => !prev)}
                  aria-expanded={showAllPending}
                  className="px-4 py-2 min-h-[44px] rounded-xl bg-white/5 border border-white/10 text-[9px] font-semibold tracking-wide text-white/50 hover:text-white hover:bg-white/10 transition-all focus-visible:ring-2 focus-visible:ring-teal-400/50"
                >
                  {showAllPending ? 'Mostrar menos' : 'Ver todas'}
                </button>
              )}
            </div>

            <div className="space-y-4">
              {unansweredReviews.length > 0 ? (
                (showAllPending
                  ? unansweredReviews
                  : unansweredReviews.slice(0, PENDING_PREVIEW_COUNT)
                ).map((review) => (
                  <div
                    key={review.id}
                    className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 text-xs font-bold">
                          {review.userName?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-[11px] font-bold text-white mb-0.5">
                            {review.userName}
                          </div>
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={8}
                                className={cn(
                                  i < (review.rating ?? 0)
                                    ? 'text-amber-400 fill-amber-400'
                                    : 'text-white/20'
                                )}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="text-[9px] text-white/50 font-bold tracking-wide">
                        {review.createdAt?.toDate
                          ? review.createdAt.toDate().toLocaleDateString('pt-BR')
                          : ''}
                      </div>
                    </div>
                    <p className="text-xs text-white/60 leading-relaxed italic">
                      "{review.comment}"
                    </p>

                    {replyingTo === review.id ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-3"
                      >
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Escreva sua resposta..."
                          className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white h-24 resize-none"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleReplyReview(review.id)}
                            className="flex-1 min-h-[44px] bg-amber-500 text-black py-2.5 rounded-xl text-[9px] font-semibold tracking-wide flex items-center justify-center gap-2"
                          >
                            <Send size={12} /> Enviar Resposta
                          </button>
                          <button
                            onClick={() => {
                              setReplyingTo(null);
                              setReplyText('');
                            }}
                            className="px-4 py-2.5 min-h-[44px] rounded-xl bg-white/5 text-[9px] font-semibold tracking-wide text-white/50"
                          >
                            Cancelar
                          </button>
                        </div>
                      </motion.div>
                    ) : (
                      <button
                        onClick={() => setReplyingTo(review.id)}
                        className="text-[9px] font-bold tracking-wide text-amber-500 hover:text-amber-400 flex items-center gap-1.5 transition-colors min-h-[44px]"
                      >
                        <MessageSquare size={12} /> Responder Avaliação
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div className="py-10 text-center border border-dashed border-white/10 rounded-2xl">
                  <p className="text-[11px] text-white/50 font-medium tracking-wide">
                    Nenhuma avaliação pendente
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
