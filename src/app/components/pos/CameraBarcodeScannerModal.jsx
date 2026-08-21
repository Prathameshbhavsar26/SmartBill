import React, { useEffect, useRef, useState, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Camera, X, RefreshCw, Volume2, VolumeX, CheckCircle, Zap } from "lucide-react";

export default function CameraBarcodeScannerModal({ isOpen, onClose, onScanProduct }) {
  const [cameraError, setCameraError] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [continuousMode, setContinuousMode] = useState(true);
  const [lastScannedCode, setLastScannedCode] = useState("");
  const [scanCount, setScanCount] = useState(0);

  const html5QrCodeRef = useRef(null);
  const scannerContainerId = "smartbill-html5-scanner";

  // Synthesize pleasant scanner beep sound
  const playBeep = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(1200, audioCtx.currentTime); // 1.2 kHz high beep
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.12);
    } catch (_) {}
  }, [soundEnabled]);

  const handleScanSuccess = useCallback(
    (decodedText) => {
      if (!decodedText) return;
      const cleanCode = decodedText.trim();
      setLastScannedCode(cleanCode);
      setScanCount((prev) => prev + 1);
      playBeep();

      if (onScanProduct) {
        onScanProduct(cleanCode);
      }

      if (!continuousMode) {
        stopScanner();
        onClose();
      }
    },
    [continuousMode, onScanProduct, onClose, playBeep]
  );

  const startScanner = useCallback(async () => {
    try {
      setCameraError("");
      const devices = await Html5Qrcode.getCameras();
      if (!devices || devices.length === 0) {
        setCameraError("No camera hardware found on this device.");
        return;
      }

      // Prioritize back camera for barcode scanning
      const backCamera = devices.find((d) =>
        d.label.toLowerCase().includes("back") || d.label.toLowerCase().includes("rear") || d.label.toLowerCase().includes("environment")
      );
      const selectedCameraId = backCamera ? backCamera.id : devices[0].id;

      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode(scannerContainerId);
      }

      const qrCodeSuccessCallback = (decodedText) => {
        handleScanSuccess(decodedText);
      };

      const config = {
        fps: 15,
        qrbox: { width: 280, height: 180 },
        aspectRatio: 1.333334,
      };

      await html5QrCodeRef.current.start(
        selectedCameraId,
        config,
        qrCodeSuccessCallback,
        () => {} // ignore interim frame read errors
      );

      setIsScanning(true);
    } catch (err) {
      console.warn("Camera start failed:", err);
      setCameraError(err.message || "Failed to start camera. Please grant camera permission.");
      setIsScanning(false);
    }
  }, [handleScanSuccess]);

  const stopScanner = useCallback(async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
      } catch (err) {
        console.warn("Camera stop error:", err);
      }
    }
    setIsScanning(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      // Small timeout to allow DOM container to render
      const t = setTimeout(() => {
        startScanner();
      }, 150);
      return () => {
        clearTimeout(t);
        stopScanner();
      };
    } else {
      stopScanner();
    }
  }, [isOpen, startScanner, stopScanner]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Live Barcode & QR Scanner</h3>
              <p className="text-[11px] text-slate-500">Point your camera at any product barcode</p>
            </div>
          </div>
          <button
            onClick={() => {
              stopScanner();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Video Scanner Viewport */}
        <div className="p-4 flex flex-col items-center bg-slate-900">
          <div
            id={scannerContainerId}
            className="w-full h-64 rounded-xl overflow-hidden bg-black flex items-center justify-center text-white relative shadow-inner"
          >
            {!isScanning && !cameraError && (
              <div className="flex flex-col items-center gap-2 text-slate-400">
                <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
                <span className="text-xs">Starting camera feed...</span>
              </div>
            )}
          </div>

          {cameraError && (
            <div className="mt-3 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs w-full text-center">
              <p className="font-semibold">Camera Access Error</p>
              <p className="mt-0.5 text-[11px]">{cameraError}</p>
              <button
                onClick={startScanner}
                className="mt-2 px-3 py-1 bg-rose-600 text-white rounded-lg font-medium text-[11px]"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Last Scanned Tag */}
          {lastScannedCode && (
            <div className="mt-3 flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-1.5 rounded-full text-xs animate-in zoom-in-95">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>
                Scanned: <strong>{lastScannedCode}</strong> ({scanCount} item{scanCount > 1 ? "s" : ""})
              </span>
            </div>
          )}
        </div>

        {/* Controls Footer */}
        <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs">
            <label className="flex items-center gap-1.5 text-slate-600 font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={continuousMode}
                onChange={(e) => setContinuousMode(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
              />
              Continuous Scan
            </label>

            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="flex items-center gap-1 text-slate-600 hover:text-slate-900 transition"
              title="Toggle Audio Beep"
            >
              {soundEnabled ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Beep On</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                  <span>Beep Off</span>
                </>
              )}
            </button>
          </div>

          <button
            onClick={() => {
              stopScanner();
              onClose();
            }}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
