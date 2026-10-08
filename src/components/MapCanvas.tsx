import React, { useEffect, useRef } from 'react';
import { useRideStore } from '../store/useRideStore';
import { MapPin, Navigation, Compass } from 'lucide-react';

export const MapCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { pickupLocation, destinationLocation, activeRide, brandSettings, defaultLocations, setDestinationLocation } =
    useRideStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let pulseStep = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      // 1. Draw Map Base
      ctx.fillStyle = '#0B111C';
      ctx.fillRect(0, 0, width, height);

      // Waterbody / River
      ctx.fillStyle = '#0F1B2C';
      ctx.beginPath();
      ctx.moveTo(0, height * 0.15);
      ctx.bezierCurveTo(width * 0.4, height * 0.1, width * 0.6, height * 0.35, width, height * 0.25);
      ctx.lineTo(width, 0);
      ctx.lineTo(0, 0);
      ctx.closePath();
      ctx.fill();

      // Green Park Area
      ctx.fillStyle = '#0D231E';
      ctx.beginPath();
      ctx.roundRect(width * 0.05, height * 0.38, width * 0.22, height * 0.2, 16);
      ctx.fill();

      // Roads & Arteries
      ctx.strokeStyle = '#1E2838';
      ctx.lineWidth = 14;

      // Highway 1
      ctx.beginPath();
      ctx.moveTo(0, height * 0.45);
      ctx.lineTo(width, height * 0.38);
      ctx.stroke();

      // Cross streets
      ctx.beginPath();
      ctx.moveTo(width * 0.35, 0);
      ctx.lineTo(width * 0.3, height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(width * 0.7, 0);
      ctx.lineTo(width * 0.75, height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, height * 0.75);
      ctx.lineTo(width, height * 0.7);
      ctx.stroke();

      // Coordinates on canvas
      const pX = width * 0.32;
      const pY = height * 0.65;
      const dX = width * 0.72;
      const dY = height * 0.28;

      // 2. Draw Route Polyline if destination exists
      if (destinationLocation) {
        ctx.beginPath();
        ctx.moveTo(pX, pY);
        ctx.bezierCurveTo(width * 0.25, height * 0.45, width * 0.65, height * 0.48, dX, dY);

        // Glow
        ctx.strokeStyle = 'rgba(0, 229, 153, 0.2)';
        ctx.lineWidth = 16;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Main line
        const gradient = ctx.createLinearGradient(pX, pY, dX, dY);
        gradient.addColorStop(0, brandSettings.primaryColorHex || '#00E599');
        gradient.addColorStop(1, brandSettings.secondaryColorHex || '#06B6D4');
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 6;
        ctx.stroke();

        // Dashed center
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 12]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Destination Marker
        ctx.fillStyle = '#F43F5E';
        ctx.beginPath();
        ctx.arc(dX, dY, 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(dX, dY, 4, 0, Math.PI * 2);
        ctx.fill();

        // Destination tag
        ctx.fillStyle = '#111827';
        ctx.beginPath();
        ctx.roundRect(dX - 60, dY - 36, 120, 24, 8);
        ctx.fill();
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 11px Plus Jakarta Sans, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(destinationLocation.title.slice(0, 16), dX, dY - 20);
      }

      // 3. Draw Idle Nearby Vehicles (if no active trip)
      if (!activeRide || activeRide.status === 'SEARCHING_DRIVER') {
        const fleet = [
          { x: width * 0.22, y: height * 0.6 },
          { x: width * 0.45, y: height * 0.72 },
          { x: width * 0.38, y: height * 0.48 },
          { x: width * 0.6, y: height * 0.35 },
          { x: width * 0.78, y: height * 0.62 },
        ];
        fleet.forEach((car) => {
          ctx.fillStyle = '#1E293B';
          ctx.beginPath();
          ctx.arc(car.x, car.y, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = brandSettings.primaryColorHex;
          ctx.lineWidth = 2.5;
          ctx.stroke();
        });
      }

      // 4. Pickup Location Marker with animated pulse
      pulseStep += 0.04;
      const pulseSize = 12 + (Math.sin(pulseStep) + 1) * 10;
      const pulseOpacity = 0.6 - (Math.sin(pulseStep) + 1) * 0.25;

      ctx.fillStyle = `rgba(0, 229, 153, ${Math.max(0, pulseOpacity)})`;
      ctx.beginPath();
      ctx.arc(pX, pY, pulseSize, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = brandSettings.primaryColorHex;
      ctx.beginPath();
      ctx.arc(pX, pY, 10, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(pX, pY, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Pickup tag
      ctx.fillStyle = '#090D14';
      ctx.beginPath();
      ctx.roundRect(pX - 50, pY + 16, 100, 22, 6);
      ctx.fill();
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = brandSettings.primaryColorHex;
      ctx.font = 'bold 10px Plus Jakarta Sans, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`PICKUP: ${pickupLocation.title.slice(0, 12)}`, pX, pY + 31);

      // 5. Active Driver Vehicle Animation along Route
      if (activeRide && (activeRide.status === 'DRIVER_ARRIVING' || activeRide.status === 'ON_TRIP')) {
        let carX = pX;
        let carY = pY;
        const progress = activeRide.driverLiveProgress;

        if (activeRide.status === 'DRIVER_ARRIVING') {
          // Approaching pickup from distance
          const startX = width * 0.15;
          const startY = height * 0.85;
          carX = startX + (pX - startX) * progress;
          carY = startY + (pY - startY) * progress;
        } else {
          // On trip towards destination along curve
          const t = progress;
          carX = (1 - t) * (1 - t) * pX + 2 * (1 - t) * t * (width * 0.45) + t * t * dX;
          carY = (1 - t) * (1 - t) * pY + 2 * (1 - t) * t * (height * 0.48) + t * t * dY;
        }

        // Radar ring around car
        ctx.fillStyle = 'rgba(0, 229, 153, 0.25)';
        ctx.beginPath();
        ctx.arc(carX, carY, 18, 0, Math.PI * 2);
        ctx.fill();

        // Car icon representation
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(carX, carY, 9, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(carX, carY, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [pickupLocation, destinationLocation, activeRide, brandSettings]);

  return (
    <div className="relative w-full h-full min-h-[340px] bg-[#0B111C] overflow-hidden">
      <canvas
        ref={canvasRef}
        width={900}
        height={500}
        className="w-full h-full object-cover block"
      />

      {/* Floating map badges */}
      <div className="absolute top-3 right-3 flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/85 backdrop-blur border border-slate-700/80 text-[11px] font-semibold text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Live GPS Telemetry</span>
        </div>
      </div>

      {/* Destination presets quick selector chips over map */}
      {!activeRide && (
        <div className="absolute bottom-3 left-3 right-3 overflow-x-auto scrollbar-none flex items-center gap-2 z-10 pb-1">
          {defaultLocations.map((loc) => {
            const isSelected = destinationLocation?.id === loc.id;
            return (
              <button
                key={loc.id}
                onClick={() => setDestinationLocation(loc)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur border transition-all ${
                  isSelected
                    ? 'text-black font-bold shadow-md'
                    : 'bg-slate-900/80 text-slate-300 border-slate-700/70 hover:bg-slate-800'
                }`}
                style={isSelected ? { backgroundColor: brandSettings.primaryColorHex } : {}}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>{loc.title}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
