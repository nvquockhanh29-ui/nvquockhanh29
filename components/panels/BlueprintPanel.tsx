
import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Icon } from '../icons';
import { ImageDropzone } from '../ImageDropzone';
import { sourceImageToDataUrl } from '../../utils';

export const BlueprintPanel: React.FC<any> = ({ 
    sourceImage, 
    handleSourceImageUpload, 
    prompt, 
    setPrompt,
    isLoading,
    blueprintFloors,
    setBlueprintFloors
}) => {
    const { t } = useLanguage();
    const { theme } = useTheme();

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
                <label className={`text-sm font-bold ${theme.textMain}`}>
                    {t('numFloors')}
                </label>
                <div className="flex items-center gap-3">
                    <input 
                        type="number" 
                        min="1" 
                        max="10" 
                        value={blueprintFloors} 
                        onChange={(e) => setBlueprintFloors(parseInt(e.target.value) || 1)}
                        className={`w-20 p-2 text-sm rounded-lg border ${theme.border} ${theme.inputBg} ${theme.textMain} focus:ring-2 focus:ring-orange-500 outline-none`}
                    />
                    <span className={`text-xs ${theme.textSub}`}>
                        {t('floorCount').replace('{count}', blueprintFloors.toString())}
                    </span>
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <label className={`text-sm font-bold ${theme.textMain}`}>
                    {t('upload3dScene')}
                </label>
                {sourceImage ? (
                    <div className="space-y-3">
                        <ImageDropzone onImageUpload={handleSourceImageUpload} className="cursor-pointer rounded-lg">
                            <div className="bg-black/30 rounded-lg p-2">
                                <img src={sourceImageToDataUrl(sourceImage)} alt="3D Scene" className="w-full h-auto max-h-[200px] object-contain rounded" />
                            </div>
                        </ImageDropzone>
                        <button 
                            onClick={() => handleSourceImageUpload(null)} 
                            className="w-full text-red-400 hover:text-red-500 text-xs py-2 px-3 rounded-md hover:bg-red-500/10 border border-red-500/20"
                        >
                            {t('delete')}
                        </button>
                    </div>
                ) : (
                    <ImageDropzone 
                        onImageUpload={handleSourceImageUpload} 
                        className={`w-full h-40 border-2 border-dashed ${theme.border} rounded-xl flex flex-col items-center justify-center text-center ${theme.textSub} text-sm cursor-pointer hover:bg-white/5 transition-all`}
                    >
                        <div className="flex flex-col items-center gap-2">
                            <Icon name="upload" className="w-8 h-8" />
                            <p>{t('dropzoneHint')}</p>
                            <p className="text-[10px] opacity-60">{t('dropzoneFormats')}</p>
                        </div>
                    </ImageDropzone>
                )}
            </div>

            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <label className={`text-sm font-bold ${theme.textMain}`}>
                        {t('prompt')}
                    </label>
                    <div className="group relative">
                        <Icon name="info" className={`w-4 h-4 ${theme.textSub} cursor-help`} />
                        <div className="absolute bottom-full right-0 mb-2 w-64 p-2 bg-slate-800 text-white text-[10px] rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                            {t('blueprintPromptHelp')}
                        </div>
                    </div>
                </div>
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={t('blueprintPromptPlaceholder')}
                    className={`w-full h-32 p-3 text-sm rounded-lg border ${theme.border} ${theme.inputBg} ${theme.textMain} focus:ring-2 focus:ring-orange-500 outline-none resize-none`}
                />
            </div>
        </div>
    );
};
