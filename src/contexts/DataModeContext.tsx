import React, { createContext, useContext, useState, useEffect } from "react";

interface DataModeContextType {
  lowDataMode: boolean;
  setLowDataMode: (v: boolean) => void;
  textOnly: boolean;
  setTextOnly: (v: boolean) => void;
  compressImages: boolean;
  setCompressImages: (v: boolean) => void;
}

const DataModeContext = createContext<DataModeContextType | null>(null);

export const DataModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lowDataMode, setLowDataMode] = useState(() => localStorage.getItem("low_data_mode") === "true");
  const [textOnly, setTextOnly] = useState(() => localStorage.getItem("text_only_mode") === "true");
  const [compressImages, setCompressImages] = useState(() => localStorage.getItem("compress_images") !== "false");

  useEffect(() => { localStorage.setItem("low_data_mode", String(lowDataMode)); }, [lowDataMode]);
  useEffect(() => { localStorage.setItem("text_only_mode", String(textOnly)); }, [textOnly]);
  useEffect(() => { localStorage.setItem("compress_images", String(compressImages)); }, [compressImages]);

  return (
    <DataModeContext.Provider value={{ lowDataMode, setLowDataMode, textOnly, setTextOnly, compressImages, setCompressImages }}>
      {children}
    </DataModeContext.Provider>
  );
};

export const useDataMode = () => {
  const ctx = useContext(DataModeContext);
  if (!ctx) throw new Error("useDataMode must be used within DataModeProvider");
  return ctx;
};
