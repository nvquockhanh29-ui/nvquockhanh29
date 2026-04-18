
import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { SourceImage, HistoryItem, ActiveTab, AspectRatio, EditSubMode, ObjectTransform, BoundingBox, ImageSize } from './types';
import { generateImages, editImage, generateVideo, mergeImages, generatePromptFromImage, placeAndRenderFurniture, generateArchitecturalPrompts, generatePromptFromPlan, analyzePlanStyle, generateMoodboard, applyLighting, generateVideoScriptPrompt, extendView, generateStyleChangePrompt, analyzeCharacterImage, analyzeImageArea, getClosestAspectRatio, generateBlueprint } from './services/geminiService';
import { sourceImageToDataUrl, copyToClipboard, dataUrlToSourceImage, cropImage, compositeImage } from './utils';
import { useHistory } from './hooks/useHistory';
import { useLibrary } from './hooks/useLibrary';
import { useLanguage } from './contexts/LanguageContext';
import { useTheme } from './contexts/ThemeContext';
import { translations } from './locales/translations';

import { WelcomeScreen } from './components/WelcomeScreen';
import { Header } from './components/Header';
import { TopNavBar } from './components/TopNavBar';
import { ControlPanel } from './components/ControlPanel';
import { GalleryPanel } from './components/GalleryPanel';
import { HistoryPanel } from './components/HistoryPanel';
import { FullscreenViewer } from './components/FullscreenViewer';
import { UtilitiesView } from './components/UtilitiesView';
import { LibraryView } from './components/LibraryView';
import { UserGuide } from './components/UserGuide';

export default function App() {
  const { language, t } = useLanguage();
  const { theme } = useTheme();
  const [isAppStarted, setIsAppStarted] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('create');
  const [sourceImage, setSourceImage] = useState<SourceImage | null>(null);
  const [sourceImage2, setSourceImage2] = useState<SourceImage | null>(null);
  const [referenceImage, setReferenceImage] = useState<SourceImage | null>(null);
  const [editReferenceImage, setEditReferenceImage] = useState<SourceImage | null>(null);
  const [maskImage, setMaskImage] = useState<SourceImage | null>(null);
  const [prompt, setPrompt] = useState(t('promptInitial'));
  const [negativePrompt, setNegativePrompt] = useState(t('defaultNegativePrompt'));
  const [imageCount, setImageCount] = useState(2);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('auto');
  const [imageSize, setImageSize] = useState<ImageSize>('1K');
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [generatedPrompts, setGeneratedPrompts] = useState<string | null>(null);
  const [promptTabSourceImage, setPromptTabSourceImage] = useState<SourceImage | null>(null);
  const [characterImage, setCharacterImage] = useState<SourceImage | null>(null);
  const [characterDescription, setCharacterDescription] = useState('');
  const [isAnalyzingCharacter, setIsAnalyzingCharacter] = useState(false);
  const [lastUsedPrompt, setLastUsedPrompt] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const { history, addHistoryItem, clearHistory } = useHistory();
  const { library, addImageToLibrary, removeImageFromLibrary, justSavedId } = useLibrary();
  const [isEditingMask, setIsEditingMask] = useState(false);
  const [isSelectingArea, setIsSelectingArea] = useState(false);
  const [brushSize, setBrushSize] = useState(20);
  const [planTo3dMode, setPlanTo3dMode] = useState<'render' | 'colorize'>('render');
  const [editSubMode, setEditSubMode] = useState<EditSubMode>('inpaint');
  const [editTool, setEditTool] = useState<'lasso' | 'brush'>('brush');
  const [fullscreenData, setFullscreenData] = useState<{ images: string[], index: number } | null>(null);
  const [videoModel] = useState('veo-3.1-fast-generate-preview');
  const [aiModel, setAiModel] = useState<string>('gemini-2.5-flash-image');

  // Area Selection / Close-up Prompt State
  const [pendingAreaImage, setPendingAreaImage] = useState<SourceImage | null>(null);
  const [areaPrompt, setAreaPrompt] = useState('');
  const [isConfirmingAreaPrompt, setIsConfirmingAreaPrompt] = useState(false);

  // Smart Edit State
  const [editBox, setEditBox] = useState<BoundingBox | null>(null);

  // Canva Mix state
  const [canvaObjects, setCanvaObjects] = useState<SourceImage[]>([]);
  const [canvaObjectTransforms, setCanvaObjectTransforms] = useState<ObjectTransform[]>([]);
  const [selectedCanvaObjectIndex, setSelectedCanvaObjectIndex] = useState<number | null>(null);
  const [isCanvaLayoutLocked, setIsCanvaLayoutLocked] = useState(false);

  // Virtual Tour state
  const [virtualTourHistory, setVirtualTourHistory] = useState<string[]>([]);
  const [virtualTourIndex, setVirtualTourIndex] = useState(-1);

  // Utilities state
  const [moodboardSourceImage, setMoodboardSourceImage] = useState<SourceImage | null>(null);
  const [moodboardReferenceImage, setMoodboardReferenceImage] = useState<SourceImage | null>(null);
  const [moodboardPrompt, setMoodboardPrompt] = useState('');
  const [moodboardImageCount, setMoodboardImageCount] = useState(2);
  const [moodboardGeneratedImages, setMoodboardGeneratedImages] = useState<string[]>([]);
  const [moodboardSelectedImage, setMoodboardSelectedImage] = useState<string | null>(null);

  const [lightingSimulationStep3, setLightingSimulationStep3] = useState<string | null>(null);
  const [lightingSourceImage, setLightingSourceImage] = useState<SourceImage | null>(null);
  const [lightingSelectedPrompts, setLightingSelectedPrompts] = useState<{interior: string; exterior: string}>({ interior: '', exterior: '' });
  const [lightingImageCount, setLightingImageCount] = useState(2);
  const [lightingGeneratedImages, setLightingGeneratedImages] = useState<string[]>([]);
  const [lightingSelectedImage, setLightingSelectedImage] = useState<string | null>(null);

  const [videoPromptSourceImage, setVideoPromptSourceImage] = useState<SourceImage | null>(null);
  const [videoPromptUserPrompt, setVideoPromptUserPrompt] = useState('');
  const [videoPromptGeneratedPrompt, setVideoPromptGeneratedPrompt] = useState<string | null>(null);

  const [extendViewSourceImage, setExtendViewSourceImage] = useState<SourceImage | null>(null);
  const [extendViewAspectRatio, setExtendViewAspectRatio] = useState<AspectRatio>('auto');
  const [extendViewImageCount, setExtendViewImageCount] = useState(2);
  const [extendViewGeneratedImages, setExtendViewGeneratedImages] = useState<string[]>([]);
  const [extendViewSelectedImage, setExtendViewSelectedImage] = useState<string | null>(null);

  const [changeStyleSourceImage, setChangeStyleSourceImage] = useState<SourceImage | null>(null);
  const [changeStyleUserPrompt, setChangeStyleUserPrompt] = useState('');
  const [changeStyleGeneratedPrompt, setChangeStyleGeneratedPrompt] = useState<string | null>(null);
  const [changeStyleImageCount, setChangeStyleImageCount] = useState(2);
  const [changeStyleGeneratedImages, setChangeStyleGeneratedImages] = useState<string[]>([]);
  const [changeStyleSelectedImage, setChangeStyleSelectedImage] = useState<string | null>(null);
  const [blueprintFloors, setBlueprintFloors] = useState(1);

  const [externalActiveUtility, setExternalActiveUtility] = useState<string | null>(null);

  const lassoEditorRef = useRef<{ clear: () => void }>(null);
  const brushEditorRef = useRef<{ clear: () => void }>(null);
  const areaSelectorRef = useRef<{ clear: () => void }>(null);
  const sharedSourceImageRef = useRef<SourceImage | null>(null);
  const isRestoringRef = useRef(false);

  useEffect(() => {
    if (generatedImages.length > 0 && !selectedImage) {
      setSelectedImage(generatedImages[0]);
    }
  }, [generatedImages, selectedImage]);
  
  useEffect(() => {
      if (activeTab !== 'edit' || !sourceImage) setIsEditingMask(false);
      if (activeTab !== 'cameraAngle' || !sourceImage) {
          setIsSelectingArea(false);
          setIsConfirmingAreaPrompt(false);
      }
  }, [activeTab, sourceImage]);

  useEffect(() => {
    if (activeTab === 'edit' && sourceImage && (editTool === 'lasso' || editTool === 'brush' || editSubMode === 'smartEdit')) {
      setIsEditingMask(true);
    } else {
      setIsEditingMask(false);
    }
  }, [activeTab, sourceImage, editTool, editSubMode]);
  
  useEffect(() => {
    if (isRestoringRef.current) {
        isRestoringRef.current = false;
        return;
    }
    if (activeTab === 'create') {
        setPrompt(t('promptInitial'));
        setNegativePrompt(t('defaultNegativePrompt'));
    } else if (activeTab === 'interior') {
        setPrompt(t('promptInterior'));
        setNegativePrompt(t('defaultNegativePrompt'));
    } else if (activeTab === 'planning') {
        setPrompt(t('promptInitialPlanning')); 
        setNegativePrompt(t('defaultNegativePrompt'));
    } else if (activeTab === 'blueprint') {
        setPrompt('');
        setNegativePrompt(t('defaultNegativePrompt'));
    } else if (['cameraAngle', 'edit', 'video', 'canva', 'prompt', 'utilities', 'library'].includes(activeTab)) {
        setPrompt('');
        setNegativePrompt('');
    } else if (activeTab === 'planTo3d') {
        setPrompt(''); 
        setNegativePrompt('');
        setPlanTo3dMode('render');
    }
  }, [activeTab, t]);

  const handleDeleteSelectedCanvaObject = useCallback(() => {
    if (selectedCanvaObjectIndex === null) return;
    setCanvaObjects(prev => prev.filter((_, i) => i !== selectedCanvaObjectIndex));
    setCanvaObjectTransforms(prev => prev.filter((_, i) => i !== selectedCanvaObjectIndex));
    setSelectedCanvaObjectIndex(null);
  }, [selectedCanvaObjectIndex]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
        if (activeTab === 'edit' && editSubMode === 'canva' && selectedCanvaObjectIndex !== null && event.key === 'Backspace') {
            event.preventDefault();
            handleDeleteSelectedCanvaObject();
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, editSubMode, selectedCanvaObjectIndex, handleDeleteSelectedCanvaObject]);

  const handleSourceImageUpload = (image: SourceImage | null) => {
    if (!image) {
        if(activeTab === 'edit' && (editSubMode === 'canva' || editSubMode === 'smartEdit')) {
          setEditBox(null);
        } else {
          setSourceImage(null);
        }
        return;
    }
    
    if (activeTab === 'edit' && (editSubMode === 'canva' || editSubMode === 'smartEdit')) {
        setCanvaObjects([]);
        setCanvaObjectTransforms([]);
        setSelectedCanvaObjectIndex(null);
        setEditBox(null);
    }

    setSourceImage(image);
    
    if (activeTab === 'prompt') {
      setPromptTabSourceImage(image);
      setGeneratedPrompts(null);
    }
    
    setSourceImage2(null);
    setMaskImage(null);
    setEditReferenceImage(null);
    setIsSelectingArea(false);
    setIsConfirmingAreaPrompt(false);
    lassoEditorRef.current?.clear();
    brushEditorRef.current?.clear();
    areaSelectorRef.current?.clear();
    
    if (activeTab !== 'prompt') {
        const dataUrl = sourceImageToDataUrl(image);
        setGeneratedImages([dataUrl]);
        setSelectedImage(dataUrl);
    }
    
    setGeneratedVideoUrl(null);
  };

  const handleGeneratePromptFromPlanHandler = async () => {
    if (!sourceImage) return;
    setPrompt(t('generating'));
    try {
        const newPrompt = await generatePromptFromPlan(sourceImage, language);
        setPrompt(newPrompt);
    } catch (error) {
        console.error("Failed to generate prompt from plan:", error);
        alert(t('alertGenerationFailed'));
        setPrompt('');
    }
  };

  const handleAnalyzePlanStyleHandler = async () => {
    if (!referenceImage) return;
    setPrompt(t('generating'));
    try {
        const newPrompt = await analyzePlanStyle(referenceImage, language);
        setPrompt(newPrompt);
    } catch (error) {
        console.error("Failed to analyze plan style:", error);
        alert(t('alertGenerationFailed'));
        setPrompt('');
    }
  };

  const handleCharacterImageUpload = async (image: SourceImage | null) => {
      setCharacterImage(image);
      if (!image) {
          setCharacterDescription('');
          return;
      }
      setIsAnalyzingCharacter(true);
      try {
          const description = await analyzeCharacterImage(image, language);
          setCharacterDescription(description);
      } catch (error) {
          console.error("Character analysis failed:", error);
      } finally {
          setIsAnalyzingCharacter(false);
      }
  };
  
  const handleTabChange = (tab: ActiveTab) => {
      setIsSelectingArea(false);
      setIsConfirmingAreaPrompt(false);
      setEditTool('brush');
      setEditSubMode('inpaint');
      setEditBox(null);
      setExternalActiveUtility(null);
      if (tab === 'prompt') {
          sharedSourceImageRef.current = sourceImage;
          setSourceImage(promptTabSourceImage);
      } else if (activeTab === 'prompt') {
          setSourceImage(sharedSourceImageRef.current);
      }
      if (tab === 'utilities' || tab === 'library') {
          setSourceImage(null);
      }
      setActiveTab(tab);
  };

  const handleAreaSelectedAndGenerate = useCallback(async (croppedAreaImage: SourceImage | null, box?: BoundingBox) => {
    if (activeTab === 'edit' && editSubMode === 'smartEdit' && box) {
        setEditBox(box);
        return;
    }

    if (!sourceImage || !croppedAreaImage) return;
    
    setIsLoading(true);
    setLoadingMessage(t('loadingAnalyzingArea'));
    try {
        const description = await analyzeImageArea(croppedAreaImage, language);
        // Using description directly as the prompt because the AI instruction already follows the requested structure
        const finalAreaPrompt = description;
        setAreaPrompt(finalAreaPrompt);
        setPendingAreaImage(croppedAreaImage);
        setIsConfirmingAreaPrompt(true);
        setIsSelectingArea(false);
    } catch (error) {
        console.error("Area analysis failed:", error);
        alert(t('alertGenerationFailed'));
    } finally {
        setIsLoading(false);
        setLoadingMessage('');
    }
  }, [sourceImage, activeTab, editSubMode, t, language]);

  const handleConfirmAreaPrompt = useCallback(async () => {
    if (!pendingAreaImage || !sourceImage || !areaPrompt) return;

    setIsConfirmingAreaPrompt(false);
    setIsLoading(true);
    setGeneratedImages([]);
    setSelectedImage(null);
    setGeneratedVideoUrl(null);
    setLoadingMessage(t('loadingStart'));

    try {
        // Tính toán tỉ lệ của ảnh gốc để yêu cầu kết quả đầu ra cùng tỉ lệ
        const originalRatio = await getClosestAspectRatio(sourceImage);
        
        // Tích hợp zoomMagnifyPrompt để buộc AI vẽ lại thay vì chỉ zoom mờ
        const detailInstruction = translations[language].engineeredPrompts.zoomMagnifyPrompt;
        const finalUserPrompt = `${detailInstruction}\n\nĐỐI TƯỢNG CỤ THỂ CẦN VẼ: ${areaPrompt}`;
        
        setLastUsedPrompt(areaPrompt); // Chỉ hiện mô tả ngắn cho người dùng thấy
        const selectedModel = aiModel === 'gemini-3-pro-image-preview' ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';
        
        // Truyền originalRatio thay vì 'auto' để kết quả đầu ra khớp tỉ lệ ảnh tải lên
        const images = await generateImages(pendingAreaImage, finalUserPrompt, imageCount, null, originalRatio, language, undefined, selectedModel, imageSize);
        if (images.length > 0) {
            setGeneratedImages(images);
            images.forEach(img => addImageToLibrary(img, areaPrompt));
            await addHistoryItem({
                tab: activeTab,
                sourceImage,
                sourceImage2: pendingAreaImage,
                referenceImage: null,
                prompt: areaPrompt,
                negativePrompt: '',
                imageCount,
                generatedImages: images,
                generatedPrompts: null,
            });
        }
    } catch (error) {
        console.error("Zoom magnification failed:", error);
        alert(t('alertGenerationFailed'));
    } finally {
        setIsLoading(false);
        setLoadingMessage('');
        setPendingAreaImage(null);
        setAreaPrompt('');
    }
  }, [pendingAreaImage, sourceImage, areaPrompt, imageCount, activeTab, addHistoryItem, t, language, addImageToLibrary, aiModel, imageSize]);

  const handleCancelAreaPrompt = () => {
      setIsConfirmingAreaPrompt(false);
      setPendingAreaImage(null);
      setAreaPrompt('');
      setIsSelectingArea(true); 
  };

  const handleMoodboardGeneration = useCallback(async () => {
    if (!moodboardSourceImage || !moodboardPrompt) return alert(t('alertMoodboard'));
    setIsLoading(true);
    setLoadingMessage(t('generatingMoodboard'));
    setMoodboardGeneratedImages([]);
    setMoodboardSelectedImage(null);
    try {
      const results = await generateMoodboard(moodboardSourceImage, moodboardPrompt, moodboardReferenceImage, moodboardImageCount, language, aspectRatio);
      if (results.length > 0) {
        setMoodboardGeneratedImages(results);
        results.forEach(img => addImageToLibrary(img, moodboardPrompt));
        await addHistoryItem({
          tab: 'utilities',
          sourceImage: moodboardSourceImage,
          sourceImage2: null,
          referenceImage: moodboardReferenceImage,
          prompt: moodboardPrompt,
          imageCount: moodboardImageCount,
          generatedImages: results,
          generatedPrompts: null,
        });
      }
    } catch (error) {
      console.error("Moodboard generation failed:", error);
      alert(t('alertGenerationFailed'));
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [moodboardSourceImage, moodboardPrompt, moodboardReferenceImage, moodboardImageCount, language, t, addImageToLibrary, addHistoryItem, aspectRatio]);

  const handleLightingGeneration = useCallback(async () => {
    const lightingPrompt = lightingSelectedPrompts.interior || lightingSelectedPrompts.exterior;
    if (!lightingSourceImage || !lightingPrompt) return alert(t('alertLighting'));
    setIsLoading(true);
    setLoadingMessage(t('generatingLighting'));
    setLightingGeneratedImages([]);
    setLightingSelectedImage(null);
    try {
      const results = await applyLighting(lightingSourceImage, lightingPrompt, lightingImageCount, language, aspectRatio);
      if (results.length > 0) {
        setLightingGeneratedImages(results);
        results.forEach(img => addImageToLibrary(img, `Lighting: ${lightingPrompt}`));
        await addHistoryItem({
          tab: 'utilities',
          sourceImage: lightingSourceImage,
          sourceImage2: null,
          referenceImage: null,
          prompt: `Lighting: ${lightingPrompt}`,
          imageCount: lightingImageCount,
          generatedImages: results,
          generatedPrompts: null,
        });
      }
    } catch (error) {
      console.error("Lighting generation failed:", error);
      alert(t('alertGenerationFailed'));
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [lightingSourceImage, lightingSelectedPrompts, lightingImageCount, language, t, addImageToLibrary, addHistoryItem, aspectRatio]);

  const handleVideoPromptGeneration = useCallback(async (image: SourceImage, userPrompt: string) => {
    if (!image || !userPrompt) return alert(t('alertVideoPrompt'));
    setIsLoading(true);
    setLoadingMessage(t('generatingVideoPrompt'));
    setVideoPromptGeneratedPrompt(null);
    try {
      const prompt = await generateVideoScriptPrompt(image, userPrompt, language);
      setVideoPromptGeneratedPrompt(prompt);
      await addHistoryItem({
        tab: 'utilities',
        sourceImage: image,
        sourceImage2: null,
        referenceImage: null,
        prompt: `Video Script Request: ${userPrompt}`,
        imageCount: 0,
        generatedImages: [],
        generatedPrompts: prompt,
      });
    } catch (error) {
      console.error("Video prompt generation failed:", error);
      alert(t('alertGenerationFailed'));
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [language, t, addHistoryItem]);

  const handleExtendViewGeneration = useCallback(async () => {
    if (!extendViewSourceImage) return alert(t('alertUploadSource'));
    setIsLoading(true);
    setLoadingMessage(t('generatingExtendedView'));
    setExtendViewGeneratedImages([]);
    setExtendViewSelectedImage(null);
    try {
      const results = await extendView(extendViewSourceImage, extendViewAspectRatio, extendViewImageCount, language);
      if (results.length > 0) {
        setExtendViewGeneratedImages(results);
        results.forEach(img => addImageToLibrary(img, `Extend View to ${extendViewAspectRatio}`));
        await addHistoryItem({
          tab: 'utilities',
          sourceImage: extendViewSourceImage,
          sourceImage2: null,
          referenceImage: null,
          prompt: `Extend View to ${extendViewAspectRatio}`,
          imageCount: extendViewImageCount,
          generatedImages: results,
          generatedPrompts: null,
        });
      }
    } catch (error) {
      console.error("Extend view failed:", error);
      alert(t('alertGenerationFailed'));
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [extendViewSourceImage, extendViewAspectRatio, extendViewImageCount, language, t, addImageToLibrary, addHistoryItem]);

  const handleStylePromptGeneration = useCallback(async () => {
    if (!changeStyleSourceImage || !changeStyleUserPrompt) return alert(t('alertStylePromptGen'));
    setIsLoading(true);
    setLoadingMessage(t('generatingStylePrompt'));
    setChangeStyleGeneratedPrompt(null);
    try {
      const prompt = await generateStyleChangePrompt(changeStyleSourceImage, changeStyleUserPrompt, language);
      setChangeStyleGeneratedPrompt(prompt);
    } catch (error) {
      console.error("Style prompt generation failed:", error);
      alert(t('alertGenerationFailed'));
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [changeStyleSourceImage, changeStyleUserPrompt, language, t]);

  const handleStyleImageGeneration = useCallback(async () => {
    if (!changeStyleSourceImage || !changeStyleGeneratedPrompt) return alert(t('alertStyleChange'));
    setIsLoading(true);
    setLoadingMessage(t('generatingStyledImages'));
    setChangeStyleGeneratedImages([]);
    setChangeStyleSelectedImage(null);
    try {
        const results = await generateImages(changeStyleSourceImage, changeStyleGeneratedPrompt, changeStyleImageCount, null, aspectRatio, language, undefined, aiModel, imageSize);
        if (results.length > 0) {
            setChangeStyleGeneratedImages(results);
            results.forEach(img => addImageToLibrary(img, `Change Style: ${changeStyleUserPrompt}`));
            await addHistoryItem({
                tab: 'utilities',
                sourceImage: changeStyleSourceImage,
                sourceImage2: null,
                referenceImage: null,
                prompt: `Change Style: ${changeStyleUserPrompt}`,
                imageCount: changeStyleImageCount,
                generatedImages: results,
                generatedPrompts: null,
            });
        }
    } catch (error) {
        console.error("Style image generation failed:", error);
        alert(t('alertGenerationFailed'));
    } finally {
        setIsLoading(false);
        setLoadingMessage('');
    }
  }, [changeStyleSourceImage, changeStyleGeneratedPrompt, changeStyleImageCount, changeStyleUserPrompt, language, t, addImageToLibrary, addHistoryItem, aiModel, imageSize, aspectRatio]);

  const handleGeneration = useCallback(async () => {
    if (!sourceImage && activeTab !== 'create' && activeTab !== 'idea' && activeTab !== 'interior' && activeTab !== 'planning' && activeTab !== 'prompt') return alert(t('alertUploadSource'));
    
    if (activeTab === 'edit') {
        if (editSubMode === 'inpaint' && !maskImage) return alert(t('alertDrawMask'));
        if (editSubMode === 'smartEdit') {
          if (!editBox) return alert(t('alertSelectSmartBox'));
          if (!maskImage) return alert(t('alertSelectSmartMask'));
        }
        if ((editSubMode === 'mergeHouse' || editSubMode === 'mergeMaterial' || editSubMode === 'mergeFurniture') && !sourceImage2) return alert(t('alertUploadBothImages'));
        if (editSubMode === 'canva' && (canvaObjects.length === 0)) return alert(t('alertUploadDecor'));
    }

    if (!prompt && activeTab !== 'create' && activeTab !== 'interior' && activeTab !== 'planning' && activeTab !== 'edit' && activeTab === 'cameraAngle') return alert(t('alertEnterPrompt'));
    
    setIsLoading(true);
    setIsEditingMask(false);
    setIsSelectingArea(false);
    setIsConfirmingAreaPrompt(false);
    if (activeTab !== 'prompt') {
      setGeneratedImages([]);
      setSelectedImage(null);
    }
    setGeneratedVideoUrl(null);
    if (activeTab === 'prompt') {
      setGeneratedPrompts(null);
    }
    setLoadingMessage(t('loadingStart'));
    setLastUsedPrompt(prompt);
    try {
      if (activeTab === 'prompt' && sourceImage) {
        setLoadingMessage(t('loadingAnalyzePrompts'));
        setPromptTabSourceImage(sourceImage);
        const promptModel = aiModel === 'gemini-3-pro-image-preview' ? 'gemini-3.1-pro-preview' : 'gemini-3-flash-preview';
        const prompts = await generateArchitecturalPrompts(sourceImage, language, characterDescription, promptModel);
        setGeneratedPrompts(prompts);
        await addHistoryItem({
          tab: 'prompt',
          sourceImage,
          sourceImage2: characterImage || null,
          referenceImage: null,
          prompt: t('promptArchitecturalGenerated') + (characterDescription ? ` (with character)` : ''),
          negativePrompt: '',
          imageCount: 0,
          generatedImages: [],
          generatedPrompts: prompts,
        });
      } else {
        let finalPrompt = prompt;
        let images: string[] = [];
        
        if (activeTab === 'edit' && editSubMode === 'canva' && sourceImage) {
            const placements = canvaObjects.map((obj, index) => ({
                image: obj,
                transform: canvaObjectTransforms[index],
            }));
            images = await placeAndRenderFurniture(sourceImage, placements, imageCount, language, aspectRatio);
        } else if (activeTab === 'edit' && sourceImage) {
            if (editSubMode === 'inpaint' && maskImage) {
                images = await editImage(sourceImage, maskImage, finalPrompt, imageCount, editReferenceImage, language, aspectRatio);
            } else if (editSubMode === 'smartEdit' && editBox && maskImage) {
                const croppedArea = await cropImage(sourceImage, editBox);
                const croppedMask = await cropImage(maskImage, editBox);
                const template = translations[language].engineeredPrompts.smartEditPrompt;
                const smartPrompt = template.replace('{0}', finalPrompt);
                const localizedResults = await editImage(croppedArea, croppedMask, smartPrompt, imageCount, editReferenceImage, language, aspectRatio);
                for (const locImgData of localizedResults) {
                  const locImg = dataUrlToSourceImage(locImgData);
                  if (locImg) {
                    const merged = await compositeImage(sourceImage, locImg, editBox, maskImage, { expansion: 0, edgeBlend: 3 });
                    images.push(sourceImageToDataUrl(merged));
                  }
                }
            } else if (sourceImage2) {
                images = await mergeImages(sourceImage, sourceImage2, finalPrompt, imageCount, aspectRatio);
            }
        } else if (activeTab === 'blueprint') {
          images = await generateBlueprint(sourceImage, prompt, imageCount, language, aspectRatio, imageSize, aiModel, blueprintFloors);
        } else if (activeTab === 'create' || activeTab === 'idea' || activeTab === 'interior' || activeTab === 'planning') {
          if (activeTab === 'idea' && sourceImage) {
            const template = translations[language].engineeredPrompts.generateFromIdeaImage;
            finalPrompt = template.replace('{0}', prompt);
          }
          images = await generateImages(sourceImage, finalPrompt, imageCount, referenceImage, aspectRatio, language, negativePrompt, aiModel, imageSize);
        } else if (activeTab === 'cameraAngle' && sourceImage) {
          finalPrompt = `Render the building from the provided image with a new camera angle. The desired angle is: "${prompt}". The final image should be a realistic architectural photo.`;
          images = await generateImages(sourceImage, finalPrompt, imageCount, null, aspectRatio, language, undefined, aiModel);
        } else if (activeTab === 'planTo3d' && sourceImage) {
          let engineeredPrompt = planTo3dMode === 'render' 
            ? `Bạn là một kiến trúc sư AI chuyên nghiệp, chuyên chuyển đổi các bản vẽ mặt bằng 2D thành các ảnh render nội thất 3D siêu thực... Yêu cầu của người dùng là: "${prompt}".`
            : `Bạn là một trợ lý AI cho kiến trúc sư. Nhiệm vụ của bạn là tô màu cho một bản vẽ mặt bằng 2D đen trắng... Yêu cầu của người dùng là: "${prompt}".`;
          images = await generateImages(sourceImage, engineeredPrompt, imageCount, planTo3dMode === 'render' ? referenceImage : null, aspectRatio, language, undefined, aiModel);
        } else if (activeTab === 'video' && sourceImage) {
          const aistudio = (window as any).aistudio;
          if (aistudio) {
            const hasKey = await aistudio.hasSelectedApiKey();
            if (!hasKey) {
              await aistudio.openSelectKey();
            }
          }
          try {
            const videoUrl = await generateVideo(sourceImage, finalPrompt, videoModel, setLoadingMessage);
            setGeneratedVideoUrl(videoUrl);
            if (videoUrl) {
              await addHistoryItem({ tab: activeTab, sourceImage, sourceImage2: null, referenceImage: null, prompt: finalPrompt, negativePrompt: '', imageCount: 0, generatedImages: [], generatedPrompts: null, videoModel: videoModel });
            }
          } catch (error: any) {
            if (error.message && error.message.includes("Requested entity was not found")) {
              if (aistudio) {
                await aistudio.openSelectKey();
              }
            }
            throw error;
          }
        }

        if (images.length > 0) {
          const historyPrompt = (activeTab === 'edit' && editSubMode === 'canva') ? t('promptCanvaMix') : (editSubMode === 'smartEdit' ? `[Smart Edit] ${prompt}` : prompt);
          await addHistoryItem({ 
            tab: activeTab, 
            sourceImage, 
            sourceImage2: (activeTab === 'edit' && (editSubMode === 'mergeHouse' || editSubMode === 'mergeMaterial' || editSubMode === 'mergeFurniture')) ? sourceImage2 : null, 
            referenceImage: (activeTab === 'create' || activeTab === 'idea' || activeTab === 'blueprint' || activeTab === 'interior' || activeTab === 'planning' || (activeTab === 'planTo3d' && planTo3dMode === 'render')) ? referenceImage : activeTab === 'edit' ? editReferenceImage : null, 
            prompt: historyPrompt, 
            negativePrompt: (activeTab === 'create' || activeTab === 'idea' || activeTab === 'blueprint' || activeTab === 'interior' || activeTab === 'planning') ? negativePrompt : '', 
            imageCount, 
            generatedImages: images, 
            generatedPrompts: null 
          });
          setGeneratedImages(images);
          images.forEach(img => addImageToLibrary(img, historyPrompt));
        }
      }
    } catch (error: any) {
      console.error("Generation failed:", error);
      alert(t('alertGenerationFailed'));
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [sourceImage, sourceImage2, referenceImage, editReferenceImage, maskImage, prompt, negativePrompt, imageCount, aspectRatio, activeTab, planTo3dMode, editSubMode, addHistoryItem, canvaObjects, canvaObjectTransforms, videoModel, t, language, addImageToLibrary, characterImage, characterDescription, aiModel, imageSize, editBox, blueprintFloors]);

  const handleConvertToWatercolor = async () => {
    if (!sourceImage) return alert(t('alertUploadSource'));
    
    setIsLoading(true);
    setLoadingMessage(t('convertingToWatercolor'));
    
    try {
        const engineeredPrompt = translations[language].engineeredPrompts.watercolorSketchPrompt;
        const result = await generateImages(sourceImage, engineeredPrompt, 1, null, aspectRatio, language, undefined, aiModel, imageSize);
        
        if (result.length > 0) {
            const watercolorSketch = dataUrlToSourceImage(result[0]);
            if (watercolorSketch) {
                // Update source image to the new sketch
                setSourceImage(watercolorSketch);
                const sketchUrl = sourceImageToDataUrl(watercolorSketch);
                
                // Show it in gallery
                setGeneratedImages([sketchUrl]);
                setSelectedImage(sketchUrl);
                
                // Add to library for safety
                addImageToLibrary(sketchUrl, `[Watercolor Sketch]`);
                
                // Add a history item for the conversion itself
                await addHistoryItem({
                    tab: activeTab,
                    sourceImage: sourceImage, // original
                    sourceImage2: null,
                    referenceImage: null,
                    prompt: `[Watercolor Sketch]`,
                    negativePrompt: '',
                    imageCount: 1,
                    generatedImages: [sketchUrl],
                    generatedPrompts: null
                });
            }
        }
    } catch (error) {
        console.error("Watercolor Sketch conversion failed:", error);
        alert(t('alertGenerationFailed'));
    } finally {
        setIsLoading(false);
        setLoadingMessage('');
    }
  };

  const handleGenerateFromPromptTab = useCallback(async (selectedPrompt: string) => {
    if (!promptTabSourceImage) { alert(t('alertNoSourceForPrompt')); return; }
    setIsLoading(true); setLoadingMessage(t('loadingStart')); setActiveTab('create'); setGeneratedImages([]); setSelectedImage(null); setGeneratedVideoUrl(null); setLastUsedPrompt(selectedPrompt); setPrompt(selectedPrompt); setSourceImage(promptTabSourceImage); setNegativePrompt(''); setReferenceImage(null);
    try {
        const images = await generateImages(promptTabSourceImage, selectedPrompt, imageCount, null, 'auto', language, undefined, aiModel);
        if (images.length > 0) {
            setGeneratedImages(images); images.forEach(img => addImageToLibrary(img, selectedPrompt));
            await addHistoryItem({ tab: 'create', sourceImage: promptTabSourceImage, sourceImage2: null, referenceImage: null, prompt: selectedPrompt, negativePrompt: '', imageCount, generatedImages: images, generatedPrompts: null });
        } else { throw new Error(t('alertImageGenFailed')); }
    } catch (error) { console.error("Generation from prompt tab failed:", error); alert(t('alertImageGenFailedRetry')); } finally { setIsLoading(false); setLoadingMessage(''); }
  }, [promptTabSourceImage, imageCount, addHistoryItem, t, language, addImageToLibrary, aiModel]);
  
  const handleBatchPromptGeneration = useCallback(async (selectedPrompts: string[]) => {
      if (!promptTabSourceImage) { alert(t('alertNoSourceForPrompt')); return; }
      if (selectedPrompts.length === 0) return;

      setIsLoading(true);
      setActiveTab('create'); // Switch to results view
      setGeneratedImages([]); // Clear previous results
      setSelectedImage(null);
      setGeneratedVideoUrl(null);
      setSourceImage(promptTabSourceImage);
      setReferenceImage(null);
      setNegativePrompt('');

      const allSessionImages: string[] = [];

      for (let i = 0; i < selectedPrompts.length; i++) {
          const currentPrompt = selectedPrompts[i];
          setLoadingMessage(`${t('generating')} (${i + 1}/${selectedPrompts.length}): ${currentPrompt.substring(0, 30)}...`);
          setLastUsedPrompt(currentPrompt); // Update text to show current process
          
          try {
              // Note: Using 'auto' aspect ratio and current model settings
              const images = await generateImages(promptTabSourceImage, currentPrompt, imageCount, null, 'auto', language, undefined, aiModel, imageSize);
              
              if (images.length > 0) {
                  allSessionImages.push(...images);
                  setGeneratedImages([...allSessionImages]); // Update UI incrementally
                  setSelectedImage(images[0]); // Select latest result
                  
                  // Save each batch to library and history individually
                  images.forEach(img => addImageToLibrary(img, currentPrompt));
                  await addHistoryItem({
                      tab: 'create',
                      sourceImage: promptTabSourceImage,
                      sourceImage2: null,
                      referenceImage: null,
                      prompt: currentPrompt,
                      negativePrompt: '',
                      imageCount,
                      generatedImages: images,
                      generatedPrompts: null
                  });
              }
          } catch (error) {
              console.error(`Failed to generate batch prompt ${i+1}:`, error);
              // Continue to next prompt even if one fails
          }
      }

      setIsLoading(false);
      setLoadingMessage('');
      if (allSessionImages.length === 0) {
          alert(t('alertGenerationFailed'));
      }
  }, [promptTabSourceImage, imageCount, addHistoryItem, t, language, addImageToLibrary, aiModel, imageSize]);

  const handleVirtualTourImageUpload = (image: SourceImage | null) => {
    if (image) {
        const dataUrl = sourceImageToDataUrl(image);
        setSourceImage(image); setVirtualTourHistory([dataUrl]); setVirtualTourIndex(0);
    } else {
        setSourceImage(null); setVirtualTourHistory([]); setVirtualTourIndex(-1);
    }
  };

  const handleVirtualTourNavigation = useCallback(async (navigationPrompt: string) => {
    if (virtualTourIndex < 0 || !virtualTourHistory[virtualTourIndex]) return;
    setIsLoading(true); setLoadingMessage("AI is generating the next frame...");
    try {
        const currentImage = dataUrlToSourceImage(virtualTourHistory[virtualTourIndex]);
        if (!currentImage) throw new Error("Could not find image to continue tour.");
        const images = await generateImages(currentImage, navigationPrompt, 1, null, 'auto', language, undefined, aiModel);
        if (images.length > 0) {
            const newHistory = virtualTourHistory.slice(0, virtualTourIndex + 1); const updatedHistory = [...newHistory, images[0]];
            setVirtualTourHistory(updatedHistory); setVirtualTourIndex(updatedHistory.length - 1); addHistoryItem({ tab: 'utilities', sourceImage: currentImage, sourceImage2: null, referenceImage: null, prompt: `Virtual Tour Navigation: ${navigationPrompt}`, imageCount: 1, generatedImages: [images[0]], generatedPrompts: null }); addImageToLibrary(images[0], `Virtual Tour Navigation: ${navigationPrompt}`);
        } else { throw new Error(t('alertImageGenFailed')); }
    } catch (error) { console.error("Virtual tour generation failed:", error); alert(t('alertTourFailed')); } finally { setIsLoading(false); setLoadingMessage(''); }
  }, [virtualTourHistory, virtualTourIndex, t, language, addImageToLibrary, aiModel, addHistoryItem]);

  const handleVirtualTourHistorySelect = (index: number) => { if (index >= 0 && index < virtualTourHistory.length) { setVirtualTourIndex(index); } };
  const handleUndo = () => { if (virtualTourIndex > 0) { setVirtualTourIndex(prev => prev - 1); } };
  const handleRedo = () => { if (virtualTourIndex < virtualTourHistory.length - 1) { setVirtualTourIndex(prev => + 1); } };

  const handleRestoreHistory = (item: HistoryItem) => {
    isRestoringRef.current = true;
    if (item.tab === 'prompt') { setCharacterImage(item.sourceImage2 || null); setPromptTabSourceImage(item.sourceImage); }
    if (item.tab === 'utilities') {
      setActiveTab('utilities');
      if (item.prompt.startsWith('Lighting:')) { setExternalActiveUtility('lighting'); setLightingSourceImage(item.sourceImage); setLightingGeneratedImages(item.generatedImages); setLightingSelectedImage(item.generatedImages[0] || null); }
      else if (item.prompt.startsWith('Video Script Request:')) { setExternalActiveUtility('videoPrompt'); setVideoPromptSourceImage(item.sourceImage); setVideoPromptUserPrompt(item.prompt.replace('Video Script Request: ', '')); setVideoPromptGeneratedPrompt(item.generatedPrompts || null); }
      else if (item.prompt.startsWith('Extend View to')) { setExternalActiveUtility('extendView'); setExtendViewSourceImage(item.sourceImage); setExtendViewGeneratedImages(item.generatedImages); setExtendViewSelectedImage(item.generatedImages[0] || null); }
      else if (item.prompt.startsWith('Change Style:')) { setExternalActiveUtility('changeStyle'); setChangeStyleSourceImage(item.sourceImage); setChangeStyleGeneratedImages(item.generatedImages); setChangeStyleSelectedImage(item.generatedImages[0] || null); }
      else { setExternalActiveUtility('moodboard'); setMoodboardSourceImage(item.sourceImage); setMoodboardReferenceImage(item.referenceImage); setMoodboardPrompt(item.prompt); setMoodboardGeneratedImages(item.generatedImages); setMoodboardSelectedImage(item.generatedImages[0] || null); }
    } else if (item.tab === 'trend') {
        setActiveTab('utilities');
        const trendMapping: Record<string, string> = {
            'Layout': 'layout', 'Model': 'model', 'Diagram': 'diagram', 'Poster BDS': 'analyze', 'Analyze': 'analyze', 'Moodboard': 'trendMoodboard'
        };
        const matched = Object.entries(trendMapping).find(([key]) => item.prompt.includes(`[Trend: ${key}]`));
        setExternalActiveUtility(matched ? matched[1] : 'layout');
        setSourceImage(item.sourceImage);
        setPrompt(item.prompt.replace(/\[Trend: .*?\] /, ''));
        setGeneratedImages(item.generatedImages);
        setSelectedImage(item.generatedImages[0] || null);
    } else {
      setActiveTab(item.tab); setSourceImage(item.sourceImage); setSourceImage2(item.sourceImage2 || null); setEditReferenceImage(item.tab === 'edit' ? item.referenceImage : null); setReferenceImage(item.tab !== 'edit' ? item.referenceImage : null); setPrompt(item.prompt); setLastUsedPrompt(item.prompt); setNegativePrompt(item.negativePrompt || ''); setImageCount(item.imageCount); setGeneratedImages(item.generatedImages); setSelectedImage(item.generatedImages[0]);
    }
  };

  const handleStartEditing = () => { if (!selectedImage) return; const img = dataUrlToSourceImage(selectedImage); if (img) { setSourceImage(img); setMaskImage(null); setEditReferenceImage(null); setActiveTab('edit'); setEditSubMode('inpaint'); setEditTool('brush'); } };
  const handleSetAsSourceImage = () => { if (!selectedImage) return; const img = dataUrlToSourceImage(selectedImage); if (img) { handleSourceImageUpload(img); } };
  const handleStartApp = (mode: 'free' | 'pro') => { setIsAppStarted(true); if (mode === 'pro') { setAiModel('gemini-3-pro-image-preview'); } else { setAiModel('gemini-2.5-flash-image'); } };
  const isProMode = aiModel === 'gemini-3-pro-image-preview';

  const triggerFullscreen = (images: string[], index: number = 0) => {
    setFullscreenData({ images, index });
  };

  if (!isAppStarted) return <WelcomeScreen onStart={handleStartApp} history={history} />;

  return (
    <div className={`min-h-screen ${theme.appBg} ${theme.textMain} font-sans selection:bg-orange-500 selection:text-white pb-20 transition-colors duration-300`}>
        <div className="max-w-[1920px] mx-auto px-4 md:px-6 lg:px-8 py-6">
            <Header onBack={() => setIsAppStarted(false)} isProMode={isProMode} />
            <TopNavBar activeTab={activeTab} onTabChange={handleTabChange} isProMode={isProMode} />
            <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-8">
                {activeTab === 'utilities' ? (
                    <UtilitiesView 
                        isProMode={isProMode}
                        externalActiveUtility={externalActiveUtility}
                        moodboardSourceImage={moodboardSourceImage} setMoodboardSourceImage={setMoodboardSourceImage}
                        moodboardReferenceImage={moodboardReferenceImage} setMoodboardReferenceImage={setMoodboardReferenceImage}
                        moodboardPrompt={moodboardPrompt} setMoodboardPrompt={setMoodboardPrompt}
                        moodboardImageCount={moodboardImageCount} setMoodboardImageCount={setMoodboardImageCount}
                        moodboardGeneratedImages={moodboardGeneratedImages} moodboardSelectedImage={moodboardSelectedImage} setMoodboardSelectedImage={setMoodboardSelectedImage}
                        handleMoodboardGeneration={handleMoodboardGeneration}
                        lightingSourceImage={lightingSourceImage} setLightingSourceImage={setLightingSourceImage}
                        lightingSelectedPrompts={lightingSelectedPrompts} setLightingSelectedPrompts={setLightingSelectedPrompts}
                        lightingImageCount={lightingImageCount} setLightingImageCount={setLightingImageCount}
                        lightingGeneratedImages={lightingGeneratedImages} lightingSelectedImage={lightingSelectedImage} setLightingSelectedImage={setLightingSelectedImage}
                        handleLightingGeneration={handleLightingGeneration}
                        sourceImage={sourceImage} setSourceImage={handleSourceImageUpload}
                        handleVirtualTourImageUpload={handleVirtualTourImageUpload}
                        virtualTourHistory={virtualTourHistory} virtualTourIndex={virtualTourIndex}
                        handleVirtualTourNavigation={handleVirtualTourNavigation}
                        handleUndo={handleUndo} handleRedo={handleRedo} handleVirtualTourHistorySelect={handleVirtualTourHistorySelect}
                        videoPromptSourceImage={videoPromptSourceImage} setVideoPromptSourceImage={setVideoPromptSourceImage}
                        videoPromptUserPrompt={videoPromptUserPrompt} setVideoPromptUserPrompt={setVideoPromptUserPrompt}
                        videoPromptGeneratedPrompt={videoPromptGeneratedPrompt} handleVideoPromptGeneration={() => videoPromptSourceImage && handleVideoPromptGeneration(videoPromptSourceImage, videoPromptUserPrompt)}
                        extendViewSourceImage={extendViewSourceImage} setExtendViewSourceImage={setExtendViewSourceImage}
                        extendViewAspectRatio={extendViewAspectRatio} setExtendViewAspectRatio={setExtendViewAspectRatio}
                        extendViewImageCount={extendViewImageCount} setExtendViewImageCount={setExtendViewImageCount}
                        extendViewGeneratedImages={extendViewGeneratedImages} extendViewSelectedImage={extendViewSelectedImage} setExtendViewSelectedImage={setExtendViewSelectedImage}
                        handleExtendViewGeneration={handleExtendViewGeneration}
                        changeStyleSourceImage={changeStyleSourceImage} setChangeStyleSourceImage={setChangeStyleSourceImage}
                        changeStyleUserPrompt={changeStyleUserPrompt} setChangeStyleUserPrompt={setChangeStyleUserPrompt}
                        changeStyleGeneratedPrompt={changeStyleGeneratedPrompt} setChangeStyleGeneratedPrompt={setChangeStyleGeneratedPrompt}
                        changeStyleImageCount={changeStyleImageCount} setChangeStyleImageCount={setChangeStyleImageCount}
                        changeStyleGeneratedImages={changeStyleGeneratedImages} changeStyleSelectedImage={changeStyleSelectedImage} setChangeStyleSelectedImage={setChangeStyleSelectedImage}
                        handleStylePromptGeneration={handleStylePromptGeneration} handleStyleImageGeneration={handleStyleImageGeneration}
                        canvaObjects={canvaObjects} setCanvaObjects={setCanvaObjects}
                        canvaObjectTransforms={canvaObjectTransforms} setCanvaObjectTransforms={setCanvaObjectTransforms}
                        selectedCanvaObjectIndex={selectedCanvaObjectIndex} setSelectedCanvaObjectIndex={setSelectedCanvaObjectIndex}
                        isCanvaLayoutLocked={isCanvaLayoutLocked} setIsCanvaLayoutLocked={setIsCanvaLayoutLocked}
                        handleDeleteSelectedCanvaObject={handleDeleteSelectedCanvaObject}
                        isLoading={isLoading} loadingMessage={loadingMessage} setFullscreenImage={(url: string) => triggerFullscreen([url], 0)} setFullscreenData={triggerFullscreen} copyToClipboard={copyToClipboard}
                        handleGeneration={handleGeneration} sourceImage2={sourceImage2} setSourceImage2={setSourceImage2}
                        referenceImage={referenceImage} setReferenceImage={setReferenceImage}
                        editReferenceImage={editReferenceImage} setEditReferenceImage={setEditReferenceImage}
                        prompt={prompt} setPrompt={setPrompt} negativePrompt={negativePrompt} setNegativePrompt={setNegativePrompt}
                        imageCount={imageCount} setImageCount={setImageCount} imageSize={imageSize} setImageSize={setImageSize}
                        aspectRatio={aspectRatio} setAspectRatio={setAspectRatio} isSelectingArea={isSelectingArea} setIsSelectingArea={setIsSelectingArea}
                        areaSelectorRef={areaSelectorRef} editTool={editTool} setEditTool={setEditTool} brushSize={brushSize} setBrushSize={setBrushSize}
                        lassoEditorRef={lassoEditorRef} brushEditorRef={brushEditorRef} setMaskImage={setMaskImage}
                        editSubMode={editSubMode} setEditSubMode={setEditSubMode} handleSourceImageUpload={handleSourceImageUpload}
                        characterImage={characterImage} setCharacterImage={handleCharacterImageUpload} characterDescription={characterDescription} setCharacterDescription={setCharacterDescription}
                        isAnalyzingCharacter={isAnalyzingCharacter} planTo3dMode={planTo3dMode} setPlanTo3dMode={setPlanTo3dMode}
                        aiModel={aiModel} generatedVideoUrl={generatedVideoUrl} generatedImages={generatedImages} generatedPrompts={generatedPrompts}
                        selectedImage={selectedImage} lastUsedPrompt={lastUsedPrompt} isEditingMask={isEditingMask} setSelectedImage={setSelectedImage}
                        onAreaSelected={handleAreaSelectedAndGenerate} handleStartEditing={handleStartEditing} handleSetAsSourceImage={handleSetAsSourceImage}
                        onGenerateFromPrompt={handleGenerateFromPromptTab}
                        onGenerateBatch={handleBatchPromptGeneration}
                        addHistoryItem={addHistoryItem} addImageToLibrary={addImageToLibrary}
                    />
                ) : activeTab === 'library' ? (
                    <LibraryView 
                        images={library} 
                        onDelete={removeImageFromLibrary} 
                        onUseAsSource={(imageData) => { const img = dataUrlToSourceImage(imageData); handleSourceImageUpload(img); }} 
                        onFullscreen={(index) => triggerFullscreen(library.map(item => item.imageData), index)} 
                        justSavedId={justSavedId} 
                    />
                ) : (
                    <>
                        <ControlPanel activeTab={activeTab} sourceImage={sourceImage} setSourceImage={handleSourceImageUpload} sourceImage2={sourceImage2} setSourceImage2={setSourceImage2} referenceImage={referenceImage} setReferenceImage={setReferenceImage} editReferenceImage={editReferenceImage} setEditReferenceImage={setEditReferenceImage} prompt={prompt} setPrompt={setPrompt} negativePrompt={negativePrompt} setNegativePrompt={setNegativePrompt} imageCount={imageCount} setImageCount={setImageCount} imageSize={imageSize} setImageSize={setImageSize} aspectRatio={aspectRatio} setAspectRatio={setAspectRatio} handleGeneration={handleGeneration} handleConvertToWatercolor={handleConvertToWatercolor} isLoading={isLoading} isSelectingArea={isSelectingArea} setIsSelectingArea={setIsSelectingArea} areaSelectorRef={areaSelectorRef} editTool={editTool} setEditTool={setEditTool} brushSize={brushSize} setBrushSize={setBrushSize} lassoEditorRef={lassoEditorRef} brushEditorRef={brushEditorRef} setMaskImage={setMaskImage} editSubMode={editSubMode} setEditSubMode={setEditSubMode} handleSourceImageUpload={handleSourceImageUpload} canvaObjects={canvaObjects} setCanvaObjects={setCanvaObjects} canvaObjectTransforms={canvaObjectTransforms} setCanvaObjectTransforms={setCanvaObjectTransforms} selectedCanvaObjectIndex={selectedCanvaObjectIndex} setSelectedCanvaObjectIndex={setSelectedCanvaObjectIndex} isCanvaLayoutLocked={isCanvaLayoutLocked} setIsCanvaLayoutLocked={setIsCanvaLayoutLocked} handleDeleteSelectedCanvaObject={handleDeleteSelectedCanvaObject} characterImage={characterImage} setCharacterImage={handleCharacterImageUpload} characterDescription={characterDescription} setCharacterDescription={setCharacterDescription} isAnalyzingCharacter={isAnalyzingCharacter} planTo3dMode={planTo3dMode} setPlanTo3dMode={setPlanTo3dMode} aiModel={aiModel} onTabChange={handleTabChange} editBox={editBox} setEditBox={setEditBox} onGeneratePromptFromPlan={handleGeneratePromptFromPlanHandler} onAnalyzePlanStyle={handleAnalyzePlanStyleHandler} blueprintFloors={blueprintFloors} setBlueprintFloors={setBlueprintFloors} />
                        <GalleryPanel 
                            isLoading={isLoading} 
                            loadingMessage={loadingMessage} 
                            imageCount={imageCount} 
                            activeTab={activeTab} 
                            generatedVideoUrl={generatedVideoUrl} 
                            generatedImages={generatedImages} 
                            generatedPrompts={generatedPrompts} 
                            selectedImage={selectedImage} 
                            lastUsedPrompt={lastUsedPrompt} 
                            sourceImage={sourceImage} 
                            sourceImage2={sourceImage2} 
                            isSelectingArea={isSelectingArea} 
                            isEditingMask={isEditingMask} 
                            editTool={editTool} 
                            brushSize={brushSize} 
                            setSelectedImage={setSelectedImage} 
                            setMaskImage={setMaskImage} 
                            onAreaSelected={handleAreaSelectedAndGenerate} 
                            setFullscreenImage={(url: string | null) => { if (url) triggerFullscreen(generatedImages, generatedImages.indexOf(url)); }} 
                            handleStartEditing={handleStartEditing} 
                            handleSetAsSourceImage={handleSetAsSourceImage} 
                            copyToClipboard={copyToClipboard} 
                            onGenerateFromPrompt={handleGenerateFromPromptTab}
                            onGenerateBatch={handleBatchPromptGeneration}
                            areaSelectorRef={areaSelectorRef} 
                            lassoEditorRef={lassoEditorRef} 
                            brushEditorRef={brushEditorRef} 
                            canvaObjects={canvaObjects} 
                            canvaObjectTransforms={canvaObjectTransforms} 
                            setCanvaObjectTransforms={setCanvaObjectTransforms} 
                            selectedCanvaObjectIndex={selectedCanvaObjectIndex} 
                            setSelectedCanvaObjectIndex={setSelectedCanvaObjectIndex} 
                            isCanvaLayoutLocked={isCanvaLayoutLocked} 
                            editSubMode={editSubMode} 
                            editBox={editBox} 
                            setEditBox={setEditBox} 
                            isConfirmingAreaPrompt={isConfirmingAreaPrompt}
                            areaPrompt={areaPrompt}
                            setAreaPrompt={setAreaPrompt}
                            pendingAreaImage={pendingAreaImage}
                            handleConfirmAreaPrompt={handleConfirmAreaPrompt}
                            handleCancelAreaPrompt={handleCancelAreaPrompt}
                        />
                    </>
                )}
            </main>
            <UserGuide activeTab={activeTab} />
            <HistoryPanel history={history} onRestore={handleRestoreHistory} onClear={clearHistory} />
        </div>
        {fullscreenData && ( <FullscreenViewer images={fullscreenData.images} initialIndex={fullscreenData.index} onClose={() => setFullscreenData(null)} /> )}
    </div>
  );
}
