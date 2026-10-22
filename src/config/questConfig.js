/**
 * Master Configuration for the Data Treasure Hunt
 * 4 Teams mapped to Harry Potter Houses and ABN AMRO brand colors.
 */

export const DEFAULT_VAULT_CODE = "7394";

export const QUEST_CONFIG = {
  title: "The Data Vault",
  subtitle: "ABN AMRO Banking Expedition",
  organization: "Enterprise Data & Analytics",
  vaultLocation: "Main Reception / Host Welcome Table",
  
  // The 4 Teams in exact presentation order with Harry Potter House locations
  teams: [
    {
      id: 1,
      name: "Metadata and governance solutions",
      shortName: "Metadata & Governance",
      codeName: "THE GOVERNANCE SHIELD",
      badge: "📜",
      house: "House Ravenclaw",
      houseEmoji: "🦅",
      tagline: "Enterprise Catalogs, Regulatory Compliance & ABN AMRO Audits",
      room: "House Ravenclaw",
      color: "from-[#009488] to-[#033B36]",
      accent: "#009488",
      puzzle: {
        title: "The Lineage & Regulatory Trail",
        category: "Compliance & Governance",
        instructions: "Sequence the 4 regulatory lifecycle stages in chronological order to generate a certified ABN AMRO compliance audit trail.",
        hint: "Start with Raw Ingestion, follow with Privacy Masking, then Cataloging, and finish with the Certified ABN AMRO Report.",
        solvedMessage: "Governance trail certified! Regulatory compliance verified by ABN AMRO governance protocols."
      },
      presentationSecretCode: "GOVERNANCE",
      presentationHint: "Look for the key word on the governance slide or ask the team!",
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
      house: "House Hufflepuff",
      houseEmoji: "🦡",
      tagline: "Scalable Storage, High-Throughput Ingestion & Compute Clusters",
      room: "House Hufflepuff",
      color: "from-[#007F74] to-[#022D29]",
      accent: "#00B3A4",
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
      house: "House Gryffindor",
      houseEmoji: "🦁",
      tagline: "Discoverable Data Products, Sharing Contracts & End-to-End Lineage",
      room: "House Gryffindor",
      color: "from-[#F9BD20] to-[#785303]",
      accent: "#F9BD20",
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
      house: "House Slytherin",
      houseEmoji: "🐍",
      tagline: "Asset Health Monitoring, Financial Reconciliations & Anomaly Cleansing",
      room: "House Slytherin",
      color: "from-[#009488] to-[#012522]",
      accent: "#009488",
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
