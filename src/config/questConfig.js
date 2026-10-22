/**
 * Master Configuration for the Data Treasure Hunt
 * Easily adjust team details, secret presentation passcodes, physical vault code, and booth locations here.
 */

export const DEFAULT_VAULT_CODE = "7394";

export const QUEST_CONFIG = {
  title: "The Data Vault",
  subtitle: "Dutch Banking Expedition",
  organization: "Enterprise Data & Analytics",
  vaultLocation: "Main Reception / Host Welcome Table",
  prizeDescription: "Dutch Stroopwafels, Craft Gouda & Exclusive Bank Souvenirs",
  
  // The 5 Teams and their Quest Progression
  teams: [
    {
      id: 1,
      name: "Data Platform & Cloud Engineering",
      shortName: "Data Platform",
      codeName: "THE FOUNDATION",
      badge: "🏗️",
      tagline: "Powering the High-Throughput Cloud Lakehouse",
      room: "Room 'Van Gogh' (Wing A - 2nd Floor)",
      presenters: "Platform Architecture Team",
      color: "from-blue-600 to-indigo-700",
      accent: "#3B82F6",
      overview: "We architect and maintain the resilient, auto-scaling cloud lakehouse infrastructure handling over 45 million banking transactions daily with 99.999% uptime.",
      highlights: [
        "Distributed Spark & Databricks Compute Clusters",
        "Multi-region disaster recovery for Dutch banking resilience",
        "Sub-second data ingestion from Core Banking mainframes",
        "Zero-trust network security and encrypted data lakes"
      ],
      puzzle: {
        title: "The Pipeline Router",
        category: "Infrastructure & Ingestion",
        instructions: "Tap the pipe segments to rotate them and establish an uninterrupted flow from Dutch Core Banking into the Cloud Lakehouse.",
        hint: "Rotate the pipes so the green stream flows from the top-left source all the way to the lakehouse storage node at the bottom-right.",
        solvedMessage: "Pipeline connected! Data is streaming at 45,000 events/sec without packet loss."
      },
      // Presentation check-in
      presentationSecretCode: "LAKEHOUSE",
      presentationHint: "Look for the keyword on the final presentation slide or ask the presenter!",
      // Vault digit unlocked after this team
      digitReveal: {
        digitIndex: 0, // 1st digit of 4
        title: "Vault Digit #1 Unlocked!",
        flavor: "You tapped into the foundation. The 1st lock tumbler rotates into place."
      }
    },
    {
      id: 2,
      name: "Data Quality & Observability",
      shortName: "Data Quality",
      codeName: "THE SENTINEL",
      badge: "🛡️",
      tagline: "Guarding Accuracy, Trust & Financial Integrity",
      room: "Room 'Rembrandt' (Wing B - 2nd Floor)",
      presenters: "Quality & Governance Squad",
      color: "from-emerald-600 to-teal-700",
      accent: "#10B981",
      overview: "Every euro, balance calculation, and regulatory number must be flawless. We monitor data pipelines 24/7 with automated anomaly detection and automated remediation.",
      highlights: [
        "Real-time Monte Carlo & Great Expectations testing",
        "Schema drift detection across 400+ data feeds",
        "Automated reconciliation against Dutch Central Bank baselines",
        "Instant alerts for transactional balance anomalies"
      ],
      puzzle: {
        title: "The Anomaly Hunter",
        category: "Observability & Cleansing",
        instructions: "Identify and quarantine 4 corrupt banking transactions before the audit timer expires to achieve 100% Data Health.",
        hint: "Look for illegal Dutch IBAN formats, negative savings balances, impossible timestamps, or missing currency symbols.",
        solvedMessage: "All 4 corrupted records quarantined! Data Health restored to 100% DNB compliance."
      },
      presentationSecretCode: "INTEGRITY",
      presentationHint: "Check the 'Trust & Observability' slide for the key word.",
      digitReveal: {
        digitIndex: 1, // 2nd digit of 4
        title: "Vault Digit #2 Unlocked!",
        flavor: "Clean data yields pure truth. The 2nd lock tumbler clicks into alignment."
      }
    },
    {
      id: 3,
      name: "Metadata & Data Governance",
      shortName: "Data Governance",
      codeName: "THE NAVIGATOR",
      badge: "📜",
      tagline: "Full Lineage, GDPR Compliance & Dutch Regulatory Mastery",
      room: "Room 'Vermeer' (Central Hub - 3rd Floor)",
      presenters: "Governance & Catalog Team",
      color: "from-amber-600 to-orange-700",
      accent: "#F59E0B",
      overview: "We govern enterprise data assets, manage our searchable metadata catalog, and provide cryptographic data lineage satisfying strict DNB (De Nederlandsche Bank) and GDPR audits.",
      highlights: [
        "10,000+ data assets cataloged with automated classification",
        "End-to-end lineage tracing from source to regulatory reports",
        "Automated PII masking & tokenization for customer privacy",
        "BCBS 239 risk data aggregation compliance"
      ],
      puzzle: {
        title: "The Lineage Audit Trail",
        category: "Data Lineage & Governance",
        instructions: "Sequence the 4 regulatory lifecycle stages in chronological order to generate a certified DNB compliance audit trail.",
        hint: "Start with Raw Ingestion, follow with Privacy Masking, then Cataloging, and finish with the Certified DNB Report.",
        solvedMessage: "Lineage certified! Full audit traceability verified by Dutch Central Bank protocols."
      },
      presentationSecretCode: "LINEAGE",
      presentationHint: "Ask the team about their end-to-end lineage tool!",
      digitReveal: {
        digitIndex: null, // Milestone badge stage! Next digit on Team 4
        title: "Governance Firewall Cleared!",
        flavor: "50% Quest Complete! The vault security clearance is approved. Next digit is guarded by Data Delivery."
      }
    },
    {
      id: 4,
      name: "Data Delivery & Real-Time APIs",
      shortName: "Data Delivery",
      codeName: "THE DISPATCHER",
      badge: "⚡",
      tagline: "Ultra-Low Latency Streaming & Secure Banking APIs",
      room: "Room 'Mondrian' (Innovation Wing - 3rd Floor)",
      presenters: "API & Streaming Delivery Squad",
      color: "from-cyan-600 to-blue-700",
      accent: "#06B6D4",
      overview: "We build the high-speed data products and streaming microservices that serve our mobile banking app, ATM network, and real-time fraud detection systems in milliseconds.",
      highlights: [
        "Apache Kafka event mesh handling 100k events/sec",
        "Sub-15ms GraphQL & REST data delivery APIs",
        "Decoupled microservice architecture with Open Banking / PSD2",
        "Secure mTLS authentication with bank-grade encryption"
      ],
      puzzle: {
        title: "High-Speed Stream Handshake",
        category: "Event Streaming & APIs",
        instructions: "Tune the 3 API streaming dials (Protocol, SLA Latency, and Security Protocol) to synchronize with the mobile banking live feed.",
        hint: "Set Protocol to 'Apache Kafka', Latency to '< 15ms Real-Time', and Security to 'mTLS + OAuth2'.",
        solvedMessage: "Feed locked! Real-time stream synchronized at 12ms latency."
      },
      presentationSecretCode: "STREAMING",
      presentationHint: "Look for the streaming architecture diagram on screen.",
      digitReveal: {
        digitIndex: 2, // 3rd digit of 4
        title: "Vault Digit #3 Unlocked!",
        flavor: "High-speed transmission locked. The 3rd tumbler rolls into position."
      }
    },
    {
      id: 5,
      name: "Advanced Analytics & AI / BI",
      shortName: "Analytics & AI",
      codeName: "THE ORACLE",
      badge: "🧠",
      tagline: "Predictive Models, Fraud Intelligence & Executive Insights",
      room: "Room 'Erasmus' (Executive Suite - 4th Floor)",
      presenters: "AI & Business Intelligence Specialists",
      color: "from-purple-600 to-pink-700",
      accent: "#A855F7",
      overview: "We turn raw banking data into intelligent decisions. From predictive credit risk and real-time anti-money laundering (AML) detection to executive Dutch economy dashboards.",
      highlights: [
        "Machine Learning fraud detection preventing €12M+ annual losses",
        "Customer Lifetime Value & personalized banking recommendations",
        "Self-service BI serving 2,500+ daily business users across Europe",
        "LLM-powered banking assistant and automated document extraction"
      ],
      puzzle: {
        title: "The Mule Ring Detector",
        category: "Graph Analytics & AI",
        instructions: "Analyze the financial transaction network and tap the 3 accounts forming an illegal circular money-mule layering loop.",
        hint: "Look for the 3 accounts that form a tight closed triangle transferring funds back and forth to each other.",
        solvedMessage: "Money mule ring isolated! AI confidence score 99.8%. Master Intelligence Core active."
      },
      presentationSecretCode: "INSIGHT",
      presentationHint: "Listen for the core takeaway of the AI case study!",
      digitReveal: {
        digitIndex: 3, // 4th digit of 4
        title: "Final Vault Digit #4 Unlocked!",
        flavor: "All 4 tumblers have aligned! The master safe combination is completely revealed."
      }
    }
  ]
};

