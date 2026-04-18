
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { Icon } from './icons';
import type { ActiveTab } from '../types';

interface UserGuideProps {
    activeTab: ActiveTab;
}

export const UserGuide: React.FC<UserGuideProps> = ({ activeTab }) => {
    const { t } = useLanguage();
    const { theme } = useTheme();

    const getGuideContent = () => {
        switch (activeTab) {
            case 'create': return t('userGuide.create');
            case 'idea': return t('userGuide.idea');
            case 'blueprint': return t('userGuide.blueprint');
            case 'interior': return t('userGuide.interior');
            case 'planning': return t('userGuide.planning');
            case 'cameraAngle': return t('userGuide.cameraAngle');
            case 'edit': return t('userGuide.edit');
            case 'planTo3d': return t('userGuide.planTo3d');
            case 'video': return t('userGuide.video');
            case 'prompt': return t('userGuide.prompt');
            case 'utilities': return t('userGuide.utilities');
            case 'library': return t('userGuide.library');
            case 'canva': return t('userGuide.canva');
            default: return null;
        }
    };

    const content = getGuideContent();
    if (!content) return null;

    return (
        <div className={`mt-12 p-6 rounded-2xl border ${theme.border} ${theme.panelBg} shadow-sm`}>
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                    <Icon name="sparkles" className="w-5 h-5 text-orange-500" />
                </div>
                <h3 className={`text-lg font-bold ${theme.textMain}`}>
                    {t('userGuide.title')}
                </h3>
            </div>
            <p className={`text-sm leading-relaxed whitespace-pre-line ${theme.textSub}`}>
                {content}
            </p>
        </div>
    );
};
