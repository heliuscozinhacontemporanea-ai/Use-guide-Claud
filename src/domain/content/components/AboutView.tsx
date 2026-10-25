import { ChevronLeft, Palette, Shield, Terminal } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../../shared/utils/cn';
import { useAppVersion } from '../hooks/useAppVersion';
import { AboutGeneralTab } from './about/AboutGeneralTab';
import { AboutLicensesTab } from './about/AboutLicensesTab';
import { AboutTermsTab } from './about/AboutTermsTab';

interface AboutViewProps {
  onBack: () => void;
}

type TabType = 'general' | 'licenses' | 'terms';

export function AboutView({ onBack }: AboutViewProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const { appVersion } = useAppVersion();

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-center relative mb-6 pt-2 pr-2">
        <button
          type="button"
          onClick={onBack}
          aria-label={t('legal.about.back')}
          className="absolute left-0 p-2 text-white/70 hover:text-white active:scale-90 transition-all z-10"
        >
          <ChevronLeft size={28} />
        </button>
        <div className="text-center">
          <h2 className="text-2xl font-display font-black mb-1 text-orange-400 leading-tight">
            {t('legal.about.title')}
          </h2>
          <p className="text-[10px] text-white/50 font-black uppercase tracking-widest">
            Use Guide v{appVersion?.version || '1.0.0'}{' '}
            {appVersion?.revision ? `(${appVersion.revision})` : ''}
          </p>
        </div>
      </div>

      <div className="flex gap-1 p-1 bg-black/20 rounded-2xl border border-white/5 mb-4">
        {[
          { id: 'general', label: t('legal.about.general'), icon: Palette },
          { id: 'licenses', label: t('legal.about.licenses'), icon: Terminal },
          { id: 'terms', label: t('legal.about.terms'), icon: Shield },
        ].map((tab) => {
          const TabIcon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[8px] font-black uppercase tracking-wider transition-all duration-300',
                isActive
                  ? 'bg-white/10 text-white border border-white/10 shadow-md'
                  : 'text-white/50 hover:text-white/70 hover:bg-white/5'
              )}
            >
              <TabIcon size={10} className={cn(isActive ? 'text-orange-400' : 'opacity-60')} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto pr-1 space-y-4 no-scrollbar">
        <AnimatePresence mode="wait">
          {activeTab === 'general' && <AboutGeneralTab key="general" />}
          {activeTab === 'licenses' && <AboutLicensesTab key="licenses" />}
          {activeTab === 'terms' && <AboutTermsTab key="terms" />}
        </AnimatePresence>
      </div>
    </div>
  );
}
