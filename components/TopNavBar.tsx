
import React from 'react';
import type { ActiveTab } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

const Tab: React.FC<{ label: string; active: boolean; onClick: () => void; disabled?: boolean }> = ({ label, active, onClick, disabled }) => {
  const { theme } = useTheme();
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-3 md:px-5 py-2 text-xs md:text-sm font-semibold transition-all duration-200 rounded-md whitespace-nowrap ${
        active 
          ? 'bg-orange-600 text-white shadow-md shadow-orange-500/20' 
          : `${theme.textSub} hover:${theme.textMain} hover:bg-white/5`
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {label}
    </button>
  );
};

export const TopNavBar: React.FC<{
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  isProMode: boolean;
}> = ({ activeTab, onTabChange, isProMode }) => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  return (
    <nav className="max-w-[1800px] mx-auto mb-6 flex justify-center">
      <div className={`flex items-center space-x-1 ${theme.navBg} border ${theme.border} p-1.5 rounded-xl shadow-lg overflow-x-auto thin-scrollbar backdrop-blur-md`}>
          <Tab label={t('tabCreate')} active={['create', 'interior', 'planning'].includes(activeTab)} onClick={() => onTabChange('create')} />
          <Tab label={t('tabIdea')} active={activeTab === 'idea'} onClick={() => onTabChange('idea')} />
          <Tab label={t('tabBlueprint')} active={activeTab === 'blueprint'} onClick={() => onTabChange('blueprint')} />
          <Tab label={t('tabCameraAngle')} active={activeTab === 'cameraAngle'} onClick={() => onTabChange('cameraAngle')} />
          <Tab label={t('tabEdit')} active={activeTab === 'edit'} onClick={() => onTabChange('edit')} />
          <Tab label={t('tabPlanTo3D')} active={activeTab === 'planTo3d'} onClick={() => onTabChange('planTo3d')} />
          <Tab label={t('tabCreatePrompt')} active={activeTab === 'prompt'} onClick={() => onTabChange('prompt')} />
          <Tab label={t('tabCreateVideo')} active={activeTab === 'video'} onClick={() => onTabChange('video')} />
          <Tab label={t('library')} active={activeTab === 'library'} onClick={() => onTabChange('library')} />
          <Tab label={t('tabUtilities')} active={activeTab === 'utilities'} onClick={() => onTabChange('utilities')} />
      </div>
    </nav>
  );
};