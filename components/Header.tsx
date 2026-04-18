
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Icon } from './icons';

declare global {
  interface AIStudio {
    openSelectKey: () => Promise<void>;
    hasSelectedApiKey: () => Promise<boolean>;
  }

  interface Window {
    aistudio?: AIStudio;
  }
}

const HeaderControls: React.FC = () => {
    const { language, setLanguage, t } = useLanguage();

    const handleSelectKey = async () => {
        if (window.aistudio?.openSelectKey) {
            await window.aistudio.openSelectKey();
        } else {
            alert(t('alertApiKeyUtilUnavailable'));
        }
    };

    return (
        <div className="absolute top-4 right-4 md:top-6 md:right-6 z-20 flex items-center gap-2">
            <button
                onClick={handleSelectKey}
                className="flex items-center gap-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 px-3 py-1.5 text-xs md:text-sm font-bold rounded-lg transition-colors duration-200 border border-slate-700 backdrop-blur-md"
                title={t('selectApiKey')}
            >
                <Icon name="key" className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">API KEY</span>
                <span className="sm:hidden">KEY</span>
            </button>

            <div className="flex space-x-1 bg-slate-800/80 backdrop-blur-md border border-slate-700/50 p-1 rounded-lg">
                <button
                    onClick={() => setLanguage('vi')}
                    aria-label="Switch to Vietnamese"
                    className={`px-3 py-1 text-sm font-bold rounded-md transition-colors duration-200 ${
                        language === 'vi' ? 'bg-red-600 text-white shadow-md shadow-red-500/20' : 'text-slate-300 hover:bg-slate-700'
                    }`}
                >
                    VN
                </button>
                <button
                    onClick={() => setLanguage('en')}
                    aria-label="Switch to English"
                    className={`px-3 py-1 text-sm font-bold rounded-md transition-colors duration-200 ${
                        language === 'en' ? 'bg-orange-600 text-white shadow-md shadow-orange-500/20' : 'text-slate-300 hover:bg-slate-700'
                    }`}
                >
                    EN
                </button>
            </div>
        </div>
    );
};

interface HeaderProps {
    onBack?: () => void;
    isProMode?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onBack, isProMode }) => {
  const { t } = useLanguage();
  return (
    <header className="flex flex-col items-center mb-8 text-center relative">
      {onBack && (
        <button
            onClick={onBack}
            className="absolute top-4 left-4 md:top-6 md:left-6 z-20 p-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 hover:border-slate-500"
            title={t('navHome')}
        >
            <Icon name="arrow-uturn-left" className="w-6 h-6" />
        </button>
      )}
      <HeaderControls />
      <h1 className="text-4xl sm:text-5xl font-bold tracking-wide text-slate-100" style={{ textShadow: '0 0 20px rgba(99, 102, 241, 0.5), 0 0 5px rgba(255, 255, 255, 0.5)' }}>
        {t('appTitle')}
      </h1>
      <p className="text-slate-400 mt-2 text-sm">{t('developedBy')}</p>
    </header>
  );
}
