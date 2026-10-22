/**
 * Master Configuration for the Data Treasure Hunt
 * 4 Teams mapped to the 4 digits of the physical combination padlock.
 */

export const DEFAULT_VAULT_CODE = "7394";

export const QUEST_CONFIG = {
  title: "The Data Vault",
  subtitle: "Dutch Banking Expedition",
  organization: "Enterprise Data & Analytics",
  vaultLocation: "Main Reception / Host Welcome Table",
  prizeDescription: "Dutch Stroopwafels, Craft Gouda & Exclusive Bank Souvenirs",
  
  // The 4 Teams in exact presentation order
  teams: [
    {
      id: 1,
      name: "Metadata and governance solutions",
      shortName: "Metadata & Governance",
      codeName: "THE GOVERNANCE SHIELD",
      badge: "📜",
      tagline: "Enterprise Catalogs, Regulatory Compliance & ABN AMRO Audits",
      room: "Room 'Vermeer' (Central Hub - 3rd Floor)",
      presenters: "Metadata & Governance Team",
      color: "from-amber-600 to-orange-700",
      accent: "#F59E0B",
      puzzle: {
        title: "The Lineage & Regulatory Trail",
        category: "Compliance & Governance",
        instructions: "Sequence the 4 regulatory lifecycle stages in chronological order to generate a certified ABN AMRO compliance audit trail.",
        hint: "Start with Raw Ingestion, follow with Privacy Masking, then Cataloging, and finish with the Certified ABN AMRO Report.",
        solvedMessage: "Governance trail certified! Regulatory compliance verified by ABN AMRO governance protocols."
      },
      presentationSecretCode: "GOVERNANCE",
      presentationHint: "Look for the key word on the governance slide or ask the presenter!",
      digitReveal: {
        digitIndex: 0, // 1st digit of 4
        title: "Vault Digit #1 Unlocked!",
        flavor: "You mastered enterprise governance. The 1st lock tumbler clicks into place."
      }
    },
    {
      id: 2,
      name: "Enterprise Data Lake",
      shortName: "Enterprise Data Lake",
      codeName: "THE CORE LAKEHOUSE",
      badge: "🏗️",
      tagline: "Scalable Storage, High-Throughput Ingestion & Compute Clusters",
      room: "Room 'Van Gogh' (Wing A - 2nd Floor)",
      presenters: "Enterprise Data Lake Squad",
      color: "from-blue-600 to-indigo-700",
      accent: "#3B82F6",
      puzzle: {
        title: "Cloud Data Lake Ingestion",
        category: "Storage & Lakehouse Ingestion",
        instructions: "Match each banking data feed to its optimal cloud engine to scale the Enterprise Data Lake.",
        hint: "Match SEPA to Kafka Stream, Ledgers to Batch Spark, ATM to Memory Cache, and Mobile Events to Delta Lakehouse.",
        solvedMessage: "All 4 data feeds connected! Enterprise Data Lake operating at 100,000 events/sec."
      },
      presentationSecretCode: "LAKEHOUSE",
      presentationHint: "Check the Data Lake Architecture slide for the secret word.",
      digitReveal: {
        digitIndex: 1, // 2nd digit of 4
        title: "Vault Digit #2 Unlocked!",
        flavor: "The Data Lake streams pure truth. The 2nd lock tumbler clicks into alignment."
      }
    },
    {
      id: 3,
      name: "Data Marketplace & Data Lineage",
      shortName: "Marketplace & Lineage",
      codeName: "THE DATA NEXUS",
      badge: "⚡",
      tagline: "Discoverable Data Products, Sharing Contracts & End-to-End Lineage",
      room: "Room 'Mondrian' (Innovation Hub - 3rd Floor)",
      presenters: "Data Marketplace & Lineage Team",
      color: "from-cyan-600 to-blue-700",
      accent: "#06B6D4",
      puzzle: {
        title: "Marketplace Product & Lineage Handshake",
        category: "Data Products & Lineage",
        instructions: "Tune the 3 Marketplace handshake parameters (Delivery Protocol, SLA Latency, and Zero-Trust Security) to subscribe to the certified banking product.",
        hint: "Choose Apache Kafka Event Mesh, < 15ms Sub-Second SLA, and mTLS + Banking OAuth 2.0.",
        solvedMessage: "Data Product Contract Activated! Live Lineage verified from source to consumer."
      },
      presentationSecretCode: "MARKETPLACE",
      presentationHint: "Look for the data product sharing slide!",
      digitReveal: {
        digitIndex: 2, // 3rd digit of 4
        title: "Vault Digit #3 Unlocked!",
        flavor: "Data contract validated. The 3rd tumbler rolls into position."
      }
    },
    {
      id: 4,
      name: "Enterprise Data Assets & Data Quality",
      shortName: "Assets & Data Quality",
      codeName: "THE QUALITY GUARDIAN",
      badge: "🛡️",
      tagline: "Asset Health Monitoring, Financial Reconciliations & Anomaly Cleansing",
      room: "Room 'Rembrandt' (Wing B - 2nd Floor)",
      presenters: "Data Assets & Quality Squad",
      color: "from-emerald-600 to-teal-700",
      accent: "#10B981",
      puzzle: {
        title: "The Asset Anomaly Hunter",
        category: "Observability & Asset Health",
        instructions: "Identify and quarantine 4 defective banking asset records before the audit timer expires to achieve 100% Data Asset Health.",
        hint: "Look for invalid IBAN formats, negative savings balances, future timestamps, or corrupt NaN currency floats.",
        solvedMessage: "All 4 corrupted records quarantined! Enterprise Data Asset Health restored to 100%."
      },
      presentationSecretCode: "INTEGRITY",
      presentationHint: "Ask the team about their automated data observability rules!",
      digitReveal: {
        digitIndex: 3, // 4th digit of 4
        title: "Final Vault Digit #4 Unlocked!",
        flavor: "All 4 tumblers have aligned! The master safe combination is completely revealed."
      }
    }
  ]
};
