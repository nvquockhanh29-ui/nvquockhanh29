import { SourceImage } from './types';
import { sourceImageToDataUrl, dataUrlToSourceImage } from './utils';

// Định nghĩa hằng số cho đường dẫn logo mặc định "logo-3.png"
// Đã được chuyển vào thư mục public để phục vụ tĩnh.
const DEFAULT_LOGO_URL = '/logo-3.png';

/**
 * Helper to wrap external URLs with a CORS proxy if needed.
 */
const getProxiedUrl = (url: string) => {
    if (!url) return url;
    
    // If it's a relative path, return as is (it will be handled as same-origin)
    if (url.startsWith('/') && !url.startsWith('//')) {
        return url;
    }
    
    // If it's already proxied or not an absolute URL, return as is
    if (!url.startsWith('http') || url.includes('images.weserv.nl')) {
        return url;
    }
    
    // Use images.weserv.nl as a CORS proxy for external images
    return `https://images.weserv.nl/?url=${encodeURIComponent(url)}`;
};

/**
 * Applies a logo watermark to a canvas at a specific position.
 * This version forces an image as a fallback instead of text to increase sharpness.
 */
export const applyLogoWatermark = async (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    logoUrl: string, // URL chính của logo (ví dụ từ API hoặc user upload)
    position: 'top-left' | 'bottom-right' = 'top-left',
    // Tham số dự phòng mới, mặc định là logo 3.png
    fallbackUrl: string = DEFAULT_LOGO_URL 
): Promise<void> => {

    // Tách riêng logic vẽ để dùng chung cho cả logo chính và logo dự phòng
    const drawLogoImage = (img: HTMLImageElement) => {
        // Tăng kích thước logo lên 13% chiều rộng hình ảnh để dễ đọc hơn
        const logoWidth = Math.round(width * 0.13);
        const logoHeight = Math.round((img.naturalHeight / img.naturalWidth) * logoWidth);

        // Lề tương đối (2% chiều rộng)
        const margin = Math.round(Math.max(20, width * 0.02));
        let x = margin;
        let y = margin;

        if (position === 'bottom-right') {
            x = width - logoWidth - margin;
            y = height - logoHeight - margin;
        }

        ctx.save();
        // Quan trọng: Làm tròn tọa độ để tránh hiện tượng nhòe do sub-pixel rendering
        const finalX = Math.round(x);
        const finalY = Math.round(y);

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.filter = 'none';
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1.0;

        // Loại bỏ hoàn toàn shadow blur để giữ cạnh logo sắc nét nhất có thể
        ctx.shadowColor = 'rgba(0, 0, 0, 0)';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;

        try {
            ctx.drawImage(img, finalX, finalY, logoWidth, logoHeight);
            console.log("Đã đóng dấu logo thành công (Sắc nét)");
        } catch (drawErr) {
            console.error("Lỗi vẽ logo lên canvas:", drawErr);
        }
        ctx.restore();
    };

    return new Promise((resolve) => {
        const attemptLoadImage = (url: string, isFallbackAttempt: boolean = false) => {
            const proxiedUrl = getProxiedUrl(url);
            
            // Determine if we need CORS for this URL
            // If it's a relative path or same-origin, we don't need crossOrigin = "anonymous"
            const isExternal = proxiedUrl.startsWith('http') && !proxiedUrl.includes(window.location.origin);
            
            const cacheBuster = `cb=${Date.now()}`;
            const finalUrl = proxiedUrl.includes('?') ? `${proxiedUrl}&${cacheBuster}` : `${proxiedUrl}?${cacheBuster}`;

            const img = new Image();
            if (isExternal) {
                img.crossOrigin = "anonymous"; // Only set for external images to avoid issues with local assets
            }

            img.onload = () => {
                // Kiểm tra xem ảnh tải về có bị hỏng kích thước không
                if (!img.naturalWidth || !img.naturalHeight) {
                    console.error(`Logo has invalid dimensions: ${url}`);
                    // Nếu đây là lần thử ảnh chính và có link dự phòng, hãy thử lại
                    if (!isFallbackAttempt && fallbackUrl) {
                        console.warn("Retrying with fallback logo.");
                        attemptLoadImage(fallbackUrl, true);
                    } else {
                        console.error("No valid logo images could be loaded.");
                        resolve(); // Resolve để không kẹt luồng xử lý chính
                    }
                    return;
                }
                
                // Tải thành công ảnh hợp lệ, đem đi vẽ
                drawLogoImage(img);
                resolve();
            };

            img.onerror = () => {
                console.error(`Failed to load logo from: ${url}`);
                // Nếu tải ảnh chính xịt (CORS, 404...), hãy thử lại với link dự phòng
                if (!isFallbackAttempt && fallbackUrl) {
                    console.warn("Retrying with fallback logo.");
                    attemptLoadImage(fallbackUrl, true);
                } else {
                    console.error("No logo images could be loaded.");
                    resolve(); // Resolve để không kẹt luồng xử lý chính
                }
            };

            img.src = finalUrl;
        };

        // Kích hoạt phát súng đầu tiên với link logo gốc sếp truyền vào
        attemptLoadImage(logoUrl);
    });
};

/**
 * Generates a watermarked version of an image for download.
 */
export const getWatermarkedImage = async (imageSrc: string, logoUrl?: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const proxiedImageSrc = getProxiedUrl(imageSrc);
        const img = new Image();
        
        // Determine if we need CORS for this URL
        // If it's a relative path, data URL, or same-origin, we don't need crossOrigin = "anonymous"
        const isExternal = proxiedImageSrc.startsWith('http') && !proxiedImageSrc.includes(window.location.origin);
        
        if (isExternal) {
            img.crossOrigin = "anonymous";
        }
        
        img.onload = async () => {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                const ctx = canvas.getContext('2d');
                if (!ctx) return reject(new Error('Could not get canvas context'));

                // Draw original image
                ctx.drawImage(img, 0, 0);

                // Apply logo watermark if provided
                if (logoUrl) {
                    await applyLogoWatermark(ctx, canvas.width, canvas.height, logoUrl);
                }

                resolve(canvas.toDataURL('image/png'));
            } catch (e) {
                console.error("Error during watermarking process:", e);
                // If it fails (e.g. tainted canvas despite proxy), return original
                resolve(imageSrc);
            }
        };

        img.onerror = (err) => {
            console.error("Failed to load image for watermarking:", imageSrc, err);
            resolve(imageSrc);
        };

        img.src = proxiedImageSrc;
    });
};
