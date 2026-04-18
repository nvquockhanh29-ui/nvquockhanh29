
import React, { useState, useEffect } from 'react';
import { getWatermarkedImage } from '../watermarkUtils';
import { LOGO_URL } from '../constants';

interface WatermarkedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    alt: string;
    imgRef?: React.RefObject<HTMLImageElement>;
}

export const WatermarkedImage: React.FC<WatermarkedImageProps> = ({ src, alt, className, onLoad, imgRef, ...props }) => {
    const [watermarkedSrc, setWatermarkedSrc] = useState<string>(src);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        let isMounted = true;
        setIsLoading(true);
        
        getWatermarkedImage(src, LOGO_URL)
            .then(newSrc => {
                if (isMounted) {
                    setWatermarkedSrc(newSrc);
                    setIsLoading(false);
                }
            })
            .catch(err => {
                console.error("Watermarking failed:", err);
                if (isMounted) {
                    setWatermarkedSrc(src);
                    setIsLoading(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, [src]);

    return (
        <img 
            ref={imgRef}
            src={watermarkedSrc} 
            alt={alt} 
            className={`${className} ${isLoading ? 'opacity-50' : 'opacity-100'} transition-opacity duration-300`}
            onLoad={onLoad}
            {...props}
        />
    );
};
