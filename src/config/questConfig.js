/**
 * Master Configuration for the Data Treasure Hunt
 * 4 Teams mapped to Harry Potter Houses and ABN AMRO brand colors.
 */

export const DEFAULT_VAULT_CODE = "2347";
export const DATASPHERE_PHRASE = "DATA VALUE CHAIN";

// Set to true to re-enable hints, quick-complete buttons, and dev helpers (or visit with ?debug=1 or ?dev=1 or ?test=1)
export const SHOW_DEV_HELPERS = false;

export const isDevHelperEnabled = () => {
  if (SHOW_DEV_HELPERS) return true;
  if (typeof window !== 'undefined' && window.location) {
    const params = new URLSearchParams(window.location.search);
    return params.has('debug') || params.has('dev') || params.has('test');
  }
  return false;
};

export const QUEST_CONFIG = {
  title: "The Data Vault",
  subtitle: "ABN AMRO Banking Expedition",
  organization: "Enterprise Data & Analytics",
  vaultLocation: "Main Reception / Host Welcome Table",
  
  // The 4 Teams in exact presentation order with Harry Potter House locations
  teams: [
    {
      id: 1,
      name: "Data Marketplace",
      shortName: "Data Marketplace",
      codeName: "THE DATA MARKETPLACE",
      badge: "🛒",
      house: "House Ravenclaw",
      houseEmoji: "🦅",
      tagline: "Discoverable Data Products, Sharing Agreements & Contract Exchange",
      room: "House Ravenclaw",
      color: "from-[#009488] to-[#033B36]",
      accent: "#009488",
      puzzle: {
        title: "Emoji Phrase Decrypt",
        category: "Data Products & Contracts",
        instructions: "Guess the secret 3-word phrase from the emoji clues representing our contract framework.",
        hint: "Think about what teams sign when exchanging banking data: Data Sharing Agreement!",
        solvedMessage: "Phrase decrypted! Data Sharing Agreement established."
      },
      presentationSecretCode: "HACN",
      presentationHint: "Look for the 4-letter code on the Data Marketplace presentation slide!",
      letters: "HACN",
      fragmentReveal: {
        fragmentIndex: 0,
        letters: "HACN",
        title: "Letter Fragment #1 Discovered: HACN",
        flavor: "You verified the Data Marketplace presentation! 4 letters added to your Datasphere cipher."
      }
    },
    {
      id: 2,
      name: "Enterprise Data Lake",
      shortName: "Enterprise Data Lake",
      codeName: "THE CORE LAKEHOUSE",
      badge: "🏗️",
      house: "House Hufflepuff",
      houseEmoji: "🦡",
      tagline: "Scalable Storage, High-Throughput Ingestion & Compute Clusters",
      room: "House Hufflepuff",
      color: "from-[#007F74] to-[#022D29]",
      accent: "#00B3A4",
      puzzle: {
        title: "Memory Matching Game",
        category: "Central Data Pooling",
        instructions: "Find and match all 4 pairs of cards by tapping to flip them.",
        hint: "Match the 4 pairs: Provider onboarding, Consumer Delivery, DAS, and RDS.",
        solvedMessage: "All 4 pairs matched! Enterprise Data Lake operational."
      },
      presentationSecretCode: "EUL",
      presentationHint: "Check the Data Lake presentation slides for the 3-letter code!",
      letters: "EUL",
      fragmentReveal: {
        fragmentIndex: 1,
        letters: "EUL",
        title: "Letter Fragment #2 Discovered: EUL",
        flavor: "Enterprise Data Lake validated! 3 letters added to your Datasphere cipher."
      }
    },
    {
      id: 3,
      name: "Enterprise Data Assets & Data Quality",
      shortName: "Assets & Data Quality",
      codeName: "THE QUALITY GUARDIAN",
      badge: "🛡️",
      house: "House Gryffindor",
      houseEmoji: "🦁",
      tagline: "Asset Health Monitoring, Financial Reconciliations & Anomaly Cleansing",
      room: "House Gryffindor",
      color: "from-[#F9BD20] to-[#785303]",
      accent: "#F9BD20",
      puzzle: {
        title: "The Data Quality Audit",
        category: "Asset Health & Cleansing",
        instructions: "Select exactly 3 corrupted transactions with business anomalies, then submit your audit.",
        hint: "Look for impossible dates (Feb 31), negative payments (-€85k), or email typos (@@@).",
        solvedMessage: "All 3 corrupted records cleansed! 100% Data Asset Health certified."
      },
      presentationSecretCode: "ATD",
      presentationHint: "Look for the 3-letter code on the Data Quality presentation slide!",
      letters: "ATD",
      fragmentReveal: {
        fragmentIndex: 2,
        letters: "ATD",
        title: "Letter Fragment #3 Discovered: ATD",
        flavor: "Data quality validated! 3 letters added to your Datasphere cipher."
      }
    },
    {
      id: 4,
      name: "BDM and Data Lineage",
      shortName: "BDM & Lineage",
      codeName: "THE LINEAGE OBSERVER",
      badge: "⚡",
      house: "House Slytherin",
      houseEmoji: "🐍",
      tagline: "Business Data Management, Catalogs & End-to-End Lineage",
      room: "House Slytherin",
      color: "from-[#009488] to-[#012522]",
      accent: "#009488",
      puzzle: {
        title: "The Data Lineage Sequence",
        category: "Lineage & Governance Trail",
        instructions: "Order 4 steps and submit.",
        hint: "Order: Discover & Scan Metadata → Enrich & Understand Data → Connect & Trace Lineage → Visualize & Act.",
        solvedMessage: "Lineage sequence validated! End-to-end data trail established."
      },
      presentationSecretCode: "AAIV",
      presentationHint: "Ask the BDM and Data Lineage team for their 4-letter code!",
      letters: "AAIV",
      fragmentReveal: {
        fragmentIndex: 3,
        letters: "AAIV",
        title: "Final Letter Fragment #4 Discovered: AAIV",
        flavor: "All letter fragments assembled! You are ready to unscramble the phrase and unlock the Datasphere."
      }
    }
  ]
};
