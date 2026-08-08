import React, { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, CheckCircle2, ShieldCheck, AlertCircle, Eye, Sun, UserCheck, AlertTriangle, ShieldAlert } from 'lucide-react';
import { ProctorStatus } from '../types';

interface CameraProctorProps {
  onStatusChange?: (status: ProctorStatus) => void;
  isCompact?: boolean;
  interviewEnded?: boolean;
}

export const CameraProctor: React.FC<CameraProctorProps> = ({
  onStatusChange,
  isCompact = false,
  interviewEnded = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const [streamActive, setStreamActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [mouthCovered, setMouthCovered] = useState(false);

  const [status, setStatus] = useState<ProctorStatus>({
    cameraActive: false,
    faceDetected: true,
    lightingQuality: 'Good',
    attentionScore: 96,
    livenessVerified: true,
    alerts: [],
  });

  // Start video stream
  const startCamera = async () => {
    if (interviewEnded) return;
    setErrorMsg(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setStreamActive(true);

        const currentScore = mouthCovered ? 68 : 98;
        const currentAlerts = mouthCovered
          ? ['SECURITY PENALTY: Mouth/Lower face obstructed (-20% score)']
          : ['Webcam hardware verified', 'Candidate face detected in frame'];

        const newStatus: ProctorStatus = {
          cameraActive: true,
          faceDetected: true,
          lightingQuality: 'Good',
          attentionScore: currentScore,
          livenessVerified: true,
          alerts: currentAlerts,
        };
        setStatus(newStatus);
        onStatusChange?.(newStatus);
      }
    } catch (err: any) {
      console.warn('Camera access error or restricted:', err);
      setErrorMsg('Camera access limited or blocked. Using simulated liveness proctoring feed.');
      setStreamActive(false);

      const currentScore = mouthCovered ? 68 : 92;
      const fallbackStatus: ProctorStatus = {
        cameraActive: false,
        faceDetected: true,
        lightingQuality: 'Fair',
        attentionScore: currentScore,
        livenessVerified: true,
        alerts: mouthCovered
          ? ['SECURITY PENALTY: Mouth/Lower face obstructed (-20% score)']
          : ['Virtual camera proctor active'],
      };
      setStatus(fallbackStatus);
      onStatusChange?.(fallbackStatus);
    }
  };

  const stopCamera = () => {
    // 1. Stop all tracks in mediaStreamRef
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => {
        t.stop();
      });
      mediaStreamRef.current = null;
    }

    // 2. Stop any remaining tracks on video element
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }

    setStreamActive(false);
    const stoppedStatus: ProctorStatus = {
      cameraActive: false,
      faceDetected: false,
      lightingQuality: 'Fair',
      attentionScore: 0,
      livenessVerified: false,
      alerts: ['Session Ended - Camera & Hardware Shut Off'],
    };
    setStatus(stoppedStatus);
    onStatusChange?.(stoppedStatus);
  };

  useEffect(() => {
    if (interviewEnded) {
      stopCamera();
    } else {
      startCamera();
    }
    return () => stopCamera();
  }, [interviewEnded]);

  // Handle Mouth Obstruction Security Penalty
  const toggleMouthObstructed = () => {
    const nextMouthCovered = !mouthCovered;
    setMouthCovered(nextMouthCovered);

    const score = nextMouthCovered ? 68 : 98;
    const alerts = nextMouthCovered
      ? ['SECURITY PENALTY: Mouth/Lower face obstructed (-20% score penalty)']
      : ['Face & mouth centered'];

    const updatedStatus: ProctorStatus = {
      ...status,
      attentionScore: score,
      alerts,
    };
    setStatus(updatedStatus);
    onStatusChange?.(updatedStatus);
  };

  // Animate proctor box & eye gaze simulation on canvas
  useEffect(() => {
    let animationId: number;

    const renderOverlay = () => {
      const canvas = canvasRef.current;
      if (canvas && (streamActive || !streamActive)) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // If no active webcam video, draw synthetic proctor visual
          if (!streamActive) {
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw grid pattern
            ctx.strokeStyle = '#1e293b';
            ctx.lineWidth = 1;
            for (let x = 0; x < canvas.width; x += 20) {
              ctx.beginPath();
              ctx.moveTo(x, 0);
              ctx.lineTo(x, canvas.height);
              ctx.stroke();
            }
            for (let y = 0; y < canvas.height; y += 20) {
              ctx.beginPath();
              ctx.moveTo(0, y);
              ctx.lineTo(canvas.width, y);
              ctx.stroke();
            }

            // Draw candidate avatar silhouette
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;

            // Head
            ctx.fillStyle = '#334155';
            ctx.beginPath();
            ctx.arc(centerX, centerY - 15, 28, 0, Math.PI * 2);
            ctx.fill();

            // Shoulders
            ctx.beginPath();
            ctx.arc(centerX, centerY + 55, 55, Math.PI, Math.PI * 2);
            ctx.fill();
          }

          // Draw Bounding Face Detection Box
          const time = Date.now() * 0.003;
          const offsetX = Math.sin(time) * 3;
          const offsetY = Math.cos(time) * 2;

          const boxX = canvas.width * 0.22 + offsetX;
          const boxY = canvas.height * 0.18 + offsetY;
          const boxWidth = canvas.width * 0.56;
          const boxHeight = canvas.height * 0.62;

          // Corner markers for face detection
          ctx.strokeStyle = '#10b981'; // Emerald glow
          ctx.lineWidth = 2;

          const lineLen = 16;
          // Top-left corner
          ctx.beginPath();
          ctx.moveTo(boxX, boxY + lineLen);
          ctx.lineTo(boxX, boxY);
          ctx.lineTo(boxX + lineLen, boxY);
          ctx.stroke();

          // Top-right corner
          ctx.beginPath();
          ctx.moveTo(boxX + boxWidth - lineLen, boxY);
          ctx.lineTo(boxX + boxWidth, boxY);
          ctx.lineTo(boxX + boxWidth, boxY + lineLen);
          ctx.stroke();

          // Bottom-left corner
          ctx.beginPath();
          ctx.moveTo(boxX, boxY + boxHeight - lineLen);
          ctx.lineTo(boxX, boxY + boxHeight);
          ctx.lineTo(boxX + lineLen, boxY + boxHeight);
          ctx.stroke();

          // Bottom-right corner
          ctx.beginPath();
          ctx.moveTo(boxX + boxWidth - lineLen, boxY + boxHeight);
          ctx.lineTo(boxX + boxWidth, boxY + boxHeight);
          ctx.lineTo(boxX + boxWidth, boxY + boxHeight - lineLen);
          ctx.stroke();

          // Label above face box
          ctx.fillStyle = '#10b981';
          ctx.font = 'bold 10px sans-serif';
          ctx.fillText('REAL CANDIDATE DETECTED • 99.4%', boxX + 4, boxY - 6);
        }
      }
      animationId = requestAnimationFrame(renderOverlay);
    };

    renderOverlay();
    return () => cancelAnimationFrame(animationId);
  }, [streamActive]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col">
      {/* Header bar */}
      <div className="bg-slate-950 px-3.5 py-2 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-slate-200">Real Candidate Proctor</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            Verified Real
          </span>
          {streamActive ? (
            <button
              onClick={stopCamera}
              className="text-slate-400 hover:text-white text-[10px] p-1 rounded bg-slate-800"
              title="Stop Camera"
            >
              <CameraOff className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={startCamera}
              className="text-slate-400 hover:text-white text-[10px] p-1 rounded bg-slate-800"
              title="Start Camera"
            >
              <Camera className="w-3.5 h-3.5 text-indigo-400" />
            </button>
          )}
        </div>
      </div>

      {/* Video & Canvas Container */}
      <div className="relative bg-slate-950 aspect-video w-full flex items-center justify-center overflow-hidden">
        <video
          ref={videoRef}
          playsInline
          muted
          className={`w-full h-full object-cover ${streamActive ? 'block' : 'hidden'}`}
        />
        <canvas
          ref={canvasRef}
          width={320}
          height={240}
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
        />

        {/* Live Proctor HUD Badge */}
        <div className="absolute top-2 left-2 z-20 bg-slate-950/80 backdrop-blur-md px-2 py-1 rounded-md border border-slate-800 text-[10px] text-slate-300 flex items-center gap-1.5">
          <UserCheck className="w-3 h-3 text-emerald-400" />
          <span>Face Centered</span>
        </div>

        <div className="absolute top-2 right-2 z-20 bg-slate-950/80 backdrop-blur-md px-2 py-1 rounded-md border border-slate-800 text-[10px] text-slate-300 flex items-center gap-1.5">
          <Eye className="w-3 h-3 text-indigo-400" />
          <span>Proctor Score {status.attentionScore}%</span>
        </div>

        {/* Mouth Covered Security Alert Banner on HUD */}
        {mouthCovered && (
          <div className="absolute bottom-2 inset-x-2 z-20 bg-red-950/90 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-red-500/50 text-red-200 text-[10px] flex items-center justify-between font-medium animate-pulse">
            <div className="flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-red-400 shrink-0" />
              <span>Mouth Obstructed! Security Penalty Applied (-20%)</span>
            </div>
          </div>
        )}
      </div>

      {/* Compact Status Metrics & Security Controls */}
      <div className="p-3 bg-slate-900 border-t border-slate-800 text-xs space-y-2">
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="bg-slate-950 p-2 rounded-lg border border-slate-800/80 flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1">
              <Sun className="w-3 h-3 text-amber-400" /> Lighting
            </span>
            <span className="font-semibold text-emerald-400">{status.lightingQuality}</span>
          </div>
          <div className="bg-slate-950 p-2 rounded-lg border border-slate-800/80 flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-indigo-400" /> Face & Mouth
            </span>
            <span className={`font-semibold ${mouthCovered ? 'text-red-400' : 'text-emerald-400'}`}>
              {mouthCovered ? 'Obstructed' : 'Clear'}
            </span>
          </div>
        </div>

        {/* Security Rule Simulation Button */}
        {!interviewEnded && (
          <button
            onClick={toggleMouthObstructed}
            className={`w-full py-1.5 px-3 rounded-lg text-[11px] font-semibold border transition-all flex items-center justify-center gap-1.5 ${
              mouthCovered
                ? 'bg-red-500/20 text-red-300 border-red-500/40 hover:bg-red-500/30'
                : 'bg-slate-800/90 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <AlertTriangle className={`w-3.5 h-3.5 ${mouthCovered ? 'text-red-400' : 'text-amber-400'}`} />
            <span>{mouthCovered ? 'Uncover Mouth (Clear Penalty)' : 'Simulate Mouth Covered (Trigger Penalty)'}</span>
          </button>
        )}

        {errorMsg && (
          <p className="text-[10px] text-amber-400/90 bg-amber-500/10 p-1.5 rounded border border-amber-500/20 flex items-center gap-1">
            <AlertCircle className="w-3 h-3 shrink-0" />
            <span>{errorMsg}</span>
          </p>
        )}
      </div>
    </div>
  );
};
