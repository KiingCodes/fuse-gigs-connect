import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  onRecorded: (blob: Blob) => Promise<void> | void;
  disabled?: boolean;
}

const VoiceRecorder = ({ onRecorded, disabled }: Props) => {
  const [recording, setRecording] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setUploading(true);
        try {
          await onRecorded(blob);
        } finally {
          setUploading(false);
        }
      };
      mr.start();
      recorderRef.current = mr;
      setRecording(true);
      setSeconds(0);
      timerRef.current = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch {
      toast.error("Microphone access denied");
    }
  };

  const stop = () => {
    recorderRef.current?.stop();
    setRecording(false);
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  if (uploading) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <Loader2 className="h-5 w-5 animate-spin" />
      </Button>
    );
  }

  if (recording) {
    return (
      <Button
        variant="destructive"
        size="sm"
        onClick={stop}
        className="gap-2 animate-pulse"
        disabled={disabled}
      >
        <Square className="h-3.5 w-3.5 fill-current" /> {seconds}s
      </Button>
    );
  }

  return (
    <Button variant="ghost" size="icon" onClick={start} disabled={disabled} aria-label="Record voice note">
      <Mic className="h-5 w-5 text-muted-foreground" />
    </Button>
  );
};

export default VoiceRecorder;
