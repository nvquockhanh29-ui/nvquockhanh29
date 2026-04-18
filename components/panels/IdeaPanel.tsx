
import React, { useState, useEffect, useRef } from 'react';
import { Icon } from '../icons';
import { ImageDropzone } from '../ImageDropzone';
import { sourceImageToDataUrl } from '../../utils';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { translations } from '../../locales/translations';

export const IdeaPanel: React.FC<any> = ({
    sourceImage, setSourceImage, handleSourceImageUpload,
    prompt, setPrompt, negativePrompt, setNegativePrompt,
    imageCount, setImageCount, aspectRatio, setAspectRatio
}) => {
    const { language, t } = useLanguage();
    const { theme } = useTheme();
    const {
        stylePrompts, contextPrompts, lightingPrompts, ASPECT_RATIO_LABELS, ideaCategories
    } = (translations[language] as any).constants;
    
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [prompt]);

    const handlePromptSelect = (selectedPrompt: string, categoryPrompts: string[]) => {
        if (!selectedPrompt) return;
        setPrompt((currentPrompt: string) => {
            let existingPrompt = categoryPrompts.find(p => currentPrompt.includes(p));
            let newPrompt = currentPrompt;
            if (existingPrompt) newPrompt = newPrompt.replace(existingPrompt, selectedPrompt);
            else newPrompt = newPrompt.trim() === '' ? selectedPrompt : `${newPrompt}, ${selectedPrompt}`;
            return newPrompt;
        });
    };

    return (
        <div className="space-y-6">
            <section>
                <h3 className={`font-semibold ${theme.textMain} mb-3`}>1. {t('uploadSiteImage')}</h3>
                <p className={`text-xs ${theme.textSub} -mt-2 mb-3`}>{t('uploadSiteImageHelp') || 'Tải lên ảnh khu đất thực tế để AI xác định ranh giới và bối cảnh.'}</p>
                {sourceImage ? (
                  <div className='space-y-3'>
                      <ImageDropzone onImageUpload={handleSourceImageUpload} className="cursor-pointer rounded-lg"><div className='bg-black/30 rounded-lg p-2'><img src={sourceImageToDataUrl(sourceImage)} alt="Source" className="w-full h-auto object-contain rounded" /></div></ImageDropzone>
                      <button onClick={() => setSourceImage(null)} className='w-full text-red-400 hover:text-red-500 text-xs py-2 px-3 rounded-md hover:bg-red-500/10 border border-red-500/20'>{t('delete')}</button>
                  </div>
                ) : (
                  <ImageDropzone onImageUpload={handleSourceImageUpload} className={`w-full h-32 border-2 border-dashed ${theme.border} rounded-lg flex items-center justify-center text-center ${theme.textSub} text-sm cursor-pointer`}>
                      <div><p>{t('dropzoneHint')}</p></div>
                  </ImageDropzone>
                )}
            </section>

            <section>
                <h3 className={`font-semibold ${theme.textMain} mb-3`}>2. {t('chooseIdeaCategory')}</h3>
                <div className="grid grid-cols-2 gap-2">
                    {ideaCategories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setPrompt(cat.prompt)}
                            className={`p-3 text-xs font-semibold rounded-lg border transition-all ${prompt.includes(cat.prompt) ? 'bg-orange-600 text-white border-orange-500' : `${theme.inputBg} ${theme.textMain} hover:bg-white/10 ${theme.border}`}`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
            </section>

            <section>
                <div className="flex justify-between items-center mb-2">
                    <h3 className={`font-semibold ${theme.textMain}`}>3. {t('prompt')}</h3>
                </div>
                <textarea
                    ref={textareaRef}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={t('promptPlaceholder.create')}
                    className={`w-full ${theme.inputBg} ${theme.textMain} p-3 rounded-md min-h-[112px] overflow-hidden resize-none text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none border ${theme.border}`}
                />
                <div className="mt-3 space-y-2">
                  <p className={`text-xs ${theme.textSub} mb-1`}>{t('addFromPresets')}</p>
                  <select onChange={(e) => handlePromptSelect(e.target.value, stylePrompts)} value="" className={`w-full ${theme.inputBg} ${theme.textMain} p-3 rounded-md text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none appearance-none border ${theme.border}`} style={{ background: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2364748b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e") right 0.5rem center/1.5em 1.5em no-repeat`}}><option value="" disabled>{t('style')}</option>{stylePrompts.map(p => <option key={p} value={p}>{p}</option>)}</select>
                </div>
            </section>

            <section>
                <h3 className={`font-semibold ${theme.textMain} mb-2`}>4. {t('negativePrompt')}</h3>
                <textarea
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                    placeholder={t('promptPlaceholder.negative')}
                    className={`w-full ${theme.inputBg} ${theme.textMain} p-3 rounded-md h-20 resize-none text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none border ${theme.border}`}
                />
            </section>

            <section>
                <h3 className={`font-semibold ${theme.textMain} mb-2`}>5. {t('aspectRatio')}</h3>
                <div className="grid grid-cols-3 gap-2 text-sm">
                    {['1:1', '4:3', '3:4', '16:9', '9:16'].map(ratio => (
                        <button key={ratio} onClick={() => setAspectRatio(ratio)} className={`py-2 px-2 text-center rounded-md border ${aspectRatio === ratio ? 'bg-orange-600 text-white font-semibold border-orange-500' : `${theme.inputBg} ${theme.textMain} hover:bg-white/10 ${theme.border}`}`}>{ratio}</button>
                    ))}
                </div>
              </section>
        </div>
    );
};
