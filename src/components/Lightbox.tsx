import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  src: string;
  alt?: string;
  type?: "image" | "video" | "audio";
}

const Lightbox = ({ open, onClose, src, alt, type = "image" }: Props) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition"
          >
            <X className="h-6 w-6" />
          </button>
          <motion.div
            initial={{ scale: 0.85 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.85 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] max-w-[95vw]"
          >
            {type === "video" ? (
              <video src={src} controls autoPlay className="max-h-[90vh] max-w-[95vw] rounded-lg" />
            ) : type === "audio" ? (
              <audio src={src} controls autoPlay className="w-[80vw] max-w-md" />
            ) : (
              <img src={src} alt={alt || ""} className="max-h-[90vh] max-w-[95vw] rounded-lg object-contain" />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Lightbox;
