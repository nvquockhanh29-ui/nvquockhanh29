
import React from 'react';
import { Icon } from './icons';
import { SocialLinks } from './SocialLinks';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { CreateFreePanel } from './panels/CreateFreePanel';
import { CreateApiPanel } from './panels/CreateApiPanel';
import { InteriorPanel } from './panels/InteriorPanel';
import { PlanningPanel } from './panels/PlanningPanel';
import { IdeaPanel } from './panels/IdeaPanel';
import { BlueprintPanel } from './panels/BlueprintPanel';
import { CameraAnglePanel, EditPanel, PlanTo3dPanel, VideoPanel, CanvaPanel, PromptGenPanel } from './panels/SecondaryPanels';
import type { ActiveTab } from '../types';

export const ControlPanel: React.FC<any> = (props) => {
    const { activeTab, handleGeneration, isLoading, sourceImage, sourceImage2, editSubMode, canvaObjects, aiModel, onTabChange } = props;
    const { t } = useLanguage();
    const { theme } = useTheme();

    const isCreationTab = ['create', 'idea', 'blueprint', 'interior', 'planning'].includes(activeTab);

    const renderPanel = () => {
        switch (activeTab) {
            case 'create':
                if (aiModel === 'gemini-3-pro-image-preview') {
                    return <CreateApiPanel {...props} />;
                }
                return <CreateFreePanel {...props} />;
            case 'idea':
                return <IdeaPanel {...props} />;
            case 'blueprint':
                return <BlueprintPanel {...props} />;
            case 'interior':
                return <InteriorPanel {...props} />;
            case 'planning':
                return <PlanningPanel {...props} />;
            case 'cameraAngle': return <CameraAnglePanel {...props} />;
            case 'edit': return <EditPanel {...props} />;
            case 'planTo3d': return <PlanTo3dPanel {...props} />;
            case 'canva': return <CanvaPanel {...props} />;
            case 'prompt': return <PromptGenPanel {...props} />;
            case 'video': return <VideoPanel {...props} />;
            default: return null;
        }
    }
    
    const isGenerationDisabled = () => {
        if (isLoading) return true;
        
        // Handle Canva Mix
        if (activeTab === 'edit' && editSubMode === 'canva') {
            return !sourceImage || !canvaObjects || canvaObjects.length === 0;
        }

        if (activeTab === 'canva') {
            return !sourceImage || !canvaObjects || canvaObjects.length === 0;
        }

        if (activeTab === 'prompt') {
            return !sourceImage;
        }

        if (activeTab === 'idea') return false;

        if (!['create', 'interior', 'planning'].includes(activeTab) && !sourceImage) return true;

        // Standard merge modes
        if (activeTab === 'edit' && ['mergeHouse', 'mergeMaterial', 'mergeFurniture'].includes(editSubMode) && !sourceImage2) {
            return true;
        }

        return false;
    }

    const getButtonText = () => {
        switch(activeTab) {
            case 'video': return t('createVideo');
            case 'prompt': return t('createPrompt');
            default: return t('createImage');
        }
    }

    const getButtonIcon = () => {
        switch(activeTab) {
            case 'video': return 'video-camera';
            case 'prompt': return 'sparkles';
            default: return 'camera';
        }
    }

    return (
        <div className={`lg:col-span-4 xl:col-span-3 ${theme.panelBg} p-5 rounded-xl flex flex-col gap-5 h-max shadow-2xl shadow-black/30 border ${theme.border}`}>
            {/* Inline Help Section */}
            <div className={`p-3 rounded-lg border ${theme.border} bg-orange-500/5 flex gap-3 items-start`}>
                <div className="p-1.5 bg-orange-500/10 rounded-md mt-0.5">
                    <Icon name="info" className="w-4 h-4 text-orange-500" />
                </div>
                <div className="flex-1">
                    <h4 className={`text-xs font-bold ${theme.textMain} mb-1 uppercase tracking-wider`}>
                        {t('userGuide.title')}
                    </h4>
                    <p className={`text-[11px] leading-relaxed whitespace-pre-line ${theme.textSub}`}>
                        {t(`userGuide.${activeTab}`)}
                    </p>
                </div>
            </div>

            {isCreationTab && (
                <div className="flex bg-slate-900/50 p-1 rounded-lg border border-slate-700/50">
                    <button 
                        onClick={() => onTabChange('create')}
                        className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${activeTab === 'create' ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
                    >
                        {t('tabArchitecture')}
                    </button>
                    <button 
                        onClick={() => onTabChange('idea')}
                        className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${activeTab === 'idea' ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
                    >
                        {t('tabIdea')}
                    </button>
                    <button 
                        onClick={() => onTabChange('blueprint')}
                        className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${activeTab === 'blueprint' ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
                    >
                        {t('tabBlueprint')}
                    </button>
                    <button 
                        onClick={() => onTabChange('interior')}
                        className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${activeTab === 'interior' ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
                    >
                        {t('tabInterior')}
                    </button>
                    <button 
                        onClick={() => onTabChange('planning')}
                        className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${activeTab === 'planning' ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
                    >
                        {t('tabPlanning')}
                    </button>
                </div>
            )}

            {renderPanel()}
            
            <button onClick={handleGeneration} disabled={isGenerationDisabled()} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 disabled:bg-slate-600 disabled:cursor-not-allowed mt-4 text-base">
                <Icon name={getButtonIcon()} className="w-5 h-5" />
                {getButtonText()}
            </button>

            <SocialLinks />
        </div>
    );
};
