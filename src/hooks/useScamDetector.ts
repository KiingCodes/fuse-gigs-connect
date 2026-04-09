import { useCallback } from "react";

// Patterns that indicate potential scams
const SCAM_PATTERNS = [
  /send.*money.*upfront/i,
  /western\s*union/i,
  /pay.*before.*meeting/i,
  /gift\s*card/i,
  /too\s*good\s*to\s*be\s*true/i,
  /wire\s*transfer/i,
  /won\s*a\s*(prize|lottery)/i,
  /nigerian?\s*prince/i,
  /advance\s*fee/i,
  /urgently?\s*need/i,
  /share.*password/i,
  /share.*pin/i,
  /share.*otp/i,
  /click\s*(this|the)\s*link/i,
  /bit\.ly|tinyurl|shorturl/i,
  /whatsapp\s*me\s*at/i,
  /deposit.*first/i,
  /guarantee.*return/i,
  /investment.*opportunity/i,
  /double\s*your\s*money/i,
  /crypto.*guaranteed/i,
  /send.*bitcoin/i,
  /personal.*bank.*details/i,
  /account.*number/i,
  /social\s*security/i,
  /identity.*document.*photo/i,
];

const SUSPICIOUS_LISTING_PATTERNS = [
  /free\s*money/i,
  /earn\s*\$?\d+k?\s*(daily|per\s*day)/i,
  /no\s*experience\s*needed.*\$\d/i,
  /work\s*from\s*home.*\$?\d+k/i,
  /mlm|pyramid|ponzi/i,
  /guaranteed\s*income/i,
  /quick\s*cash/i,
  /easy\s*money/i,
];

export interface ScamCheckResult {
  isSuspicious: boolean;
  confidence: "low" | "medium" | "high";
  warnings: string[];
}

export const useScamDetector = () => {
  const checkMessage = useCallback((text: string): ScamCheckResult => {
    if (!text) return { isSuspicious: false, confidence: "low", warnings: [] };
    
    const warnings: string[] = [];
    let matchCount = 0;

    for (const pattern of SCAM_PATTERNS) {
      if (pattern.test(text)) {
        matchCount++;
        if (/send.*money|deposit.*first|pay.*before/i.test(text)) {
          warnings.push("Requests for upfront payment are a common scam tactic.");
        }
        if (/share.*(password|pin|otp)/i.test(text)) {
          warnings.push("Never share your passwords, PINs, or OTPs.");
        }
        if (/click.*(link)|bit\.ly|tinyurl/i.test(text)) {
          warnings.push("Suspicious links detected. Be careful clicking unknown URLs.");
        }
        if (/account.*number|bank.*details/i.test(text)) {
          warnings.push("Be cautious about sharing banking information.");
        }
      }
    }

    // Deduplicate warnings
    const uniqueWarnings = [...new Set(warnings)];
    
    if (matchCount === 0) return { isSuspicious: false, confidence: "low", warnings: [] };
    
    return {
      isSuspicious: true,
      confidence: matchCount >= 3 ? "high" : matchCount >= 2 ? "medium" : "low",
      warnings: uniqueWarnings.length > 0 ? uniqueWarnings : ["This message contains patterns commonly associated with scams. Please be cautious."],
    };
  }, []);

  const checkListing = useCallback((title: string, description: string): ScamCheckResult => {
    const combined = `${title} ${description}`;
    const warnings: string[] = [];
    let matchCount = 0;

    for (const pattern of SUSPICIOUS_LISTING_PATTERNS) {
      if (pattern.test(combined)) {
        matchCount++;
      }
    }

    // Also check chat patterns in listings
    for (const pattern of SCAM_PATTERNS) {
      if (pattern.test(combined)) {
        matchCount++;
      }
    }

    if (matchCount >= 2) {
      warnings.push("This listing contains patterns often seen in fraudulent posts.");
    }
    if (/earn.*\$?\d+k?\s*(daily|per\s*day)/i.test(combined)) {
      warnings.push("Unrealistic income promises are a red flag.");
    }
    if (/mlm|pyramid/i.test(combined)) {
      warnings.push("This may be a multi-level marketing or pyramid scheme.");
    }

    if (matchCount === 0) return { isSuspicious: false, confidence: "low", warnings: [] };

    return {
      isSuspicious: true,
      confidence: matchCount >= 3 ? "high" : matchCount >= 2 ? "medium" : "low",
      warnings: warnings.length > 0 ? warnings : ["This listing looks suspicious. Proceed with caution."],
    };
  }, []);

  return { checkMessage, checkListing };
};
