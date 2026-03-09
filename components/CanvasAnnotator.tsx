'use client';

import { useRef, useEffect, useState } from 'react';

type Props = {
  imageUrl: string;
  onSave: (annotatedBlob: Blob) => void;
  onCancel: () => void;
};

export default function CanvasAnnotator({ imageUrl, onSave, onCancel }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#ef4444'); // Red

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.lineWidth = Math.max(img.width / 100, 5);
    };
  }, [imageUrl]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.beginPath();
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    ctx.strokeStyle = color;
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const handleSave = () => {
    canvasRef.current?.toBlob((blob) => {
      if (blob) onSave(blob);
    }, 'image/png');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col p-4 md:p-10">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white font-bold">標註截圖 (畫布)</h3>
        <div className="flex gap-4">
          {['#ef4444', '#f59e0b', '#10b981', '#3b82f6'].map(c => (
            <button key={c} onClick={() => setColor(c)} className={`w-6 h-6 rounded-full border-2 ${color === c ? 'border-white' : 'border-transparent'}`} style={{ backgroundColor: c }} />
          ))}
          <button onClick={onCancel} className="text-zinc-400 hover:text-white text-sm">取消</button>
          <button onClick={handleSave} className="bg-indigo-600 text-white px-4 py-1 rounded-lg text-sm font-bold">儲存回報</button>
        </div>
      </div>
      <div className="flex-1 relative overflow-auto flex items-center justify-center bg-zinc-900 rounded-2xl border border-white/10">
        <canvas 
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseOut={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="max-w-full max-h-full cursor-crosshair shadow-2xl"
        />
      </div>
    </div>
  );
}
