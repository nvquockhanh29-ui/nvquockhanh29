
import React from 'react';
import type { LibraryItem } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { Icon } from './icons';

interface LibraryViewProps {
  images: LibraryItem[];
  onDelete: (id: string) => void;
  onUseAsSource: (imageData: string) => void;
  onFullscreen: (index: number) => void;
  justSavedId: string | null;
}

export const LibraryView: React.FC<LibraryViewProps> = ({ images, onDelete, onUseAsSource, onFullscreen, justSavedId }) => {
    const { t } = useLanguage();
    const { theme } = useTheme();

    if (images.length === 0) {
        return (
            <div className={`lg:col-span-12 ${theme.panelBg} p-6 rounded-xl border ${theme.border} min-h-[70vh] flex flex-col items-center justify-center text-center text-slate-500`}>
                <Icon name="heart" className="w-16 h-16 mb-4 text-slate-600" />
                <h3 className={`text-xl font-semibold ${theme.textSub}`}>
                    {t('libraryEmptyHeader')}
                </h3>
                <p className="mt-2">
                    {t('libraryEmptyText')}
                </p>
            </div>
        );
    }

    return (
        <div className="lg:col-span-12">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {images.map((item, index) => (
                    <div key={item.id} className={`flex flex-col group aspect-square ${theme.panelBg} rounded-xl overflow-hidden shadow-xl border ${theme.border} transition-all duration-300 hover:border-orange-500/50`}>
                        <div className="relative flex-grow overflow-hidden">
                            <img src={item.imageData} alt="Saved in library" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            
                            {justSavedId === item.id && (
                                <div className="absolute inset-0 bg-black/70 flex items-center justify-center animate-pulse-once z-10">
                                    <p className="text-white font-bold text-lg">{t('saved')}</p>
                                </div>
                            )}
                            
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                                <div className="flex justify-center items-center gap-3">
                                    <button onClick={() => onFullscreen(index)} className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white p-2.5 rounded-full transition-all hover:scale-110" title={t('fullscreen')}>
                                        <Icon name="arrows-pointing-out" className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => onUseAsSource(item.imageData)} className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white p-2.5 rounded-full transition-all hover:scale-110" title={t('useAsSource')}>
                                        <Icon name="arrow-up-tray" className="w-5 h-5" />
                                    </button>
                                    <a href={item.imageData} download={`library-image-${item.id}.png`} className="bg-orange-600/80 backdrop-blur-md border border-orange-500 hover:bg-orange-600 text-white p-2.5 rounded-full transition-all hover:scale-110" title={t('downloadImage')}>
                                        <Icon name="download" className="w-5 h-5" />
                                    </a>
                                    <button onClick={() => onDelete(item.id)} className="bg-red-600/80 backdrop-blur-md border border-red-500 hover:bg-red-600 text-white p-2.5 rounded-full transition-all hover:scale-110" title={t('deleteFromLibrary')}>
                                        <Icon name="trash" className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                        {item.prompt && (
                            <div className="p-3 bg-black/20 border-t border-slate-700/30">
                                <p className="text-[10px] text-slate-400 line-clamp-2 italic leading-tight" title={item.prompt}>
                                    {item.prompt}
                                </p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
