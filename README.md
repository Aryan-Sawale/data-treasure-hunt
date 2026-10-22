# 🔐 The Data Vault: Dutch Banking Expedition

An interactive, gamified mobile-first browser game built for the client visit to our **Enterprise Data & Analytics** department (Netherlands Banking Domain).

Clients play on their smartphones as they tour the department: solving puzzles to discover each team, visiting their presentations, collecting secret lock digits, and ultimately cracking a **physical 4-digit combination safe box** filled with authentic Dutch souvenirs (Stroopwafels, Dutch Gouda, banking gifts).

---

## 🎯 Game Flow & Rules

```mermaid
flowchart TD
    Start["📱 Welcome Screen<br/>(Mystery Mission Briefing)"] --> P1["🧩 Puzzle 1: Governance & Compliance Trail<br/>(Sequence DNB compliance stages)"]
    P1 --> T1["🏢 Team 1 Revealed:<br/>Metadata and governance solutions"]
    T1 --> Pres1["👥 Visit Room 'Vermeer'<br/>(Client attends Presentation)"]
    Pres1 --> Code1["🔑 Enter Presenter Word: 'GOVERNANCE'<br/><b>🎉 DIGIT #1 REVEALED: [ 7 ]</b>"]

    Code1 --> P2["🧩 Puzzle 2: Cloud Data Lake Ingestion<br/>(Match banking feeds to Lakehouse engines)"]
    P2 --> T2["🏢 Team 2 Revealed:<br/>Enterprise Data Lake"]
    T2 --> Pres2["👥 Visit Room 'Van Gogh'<br/>(Client attends Presentation)"]
    Pres2 --> Code2["🔑 Enter Presenter Word: 'LAKEHOUSE'<br/><b>🎉 DIGIT #2 REVEALED: [ 3 ]</b>"]

    Code2 --> P3["🧩 Puzzle 3: Product & Lineage Handshake<br/>(Tune Kafka, &lt;15ms SLA, mTLS)"]
    P3 --> T3["🏢 Team 3 Revealed:<br/>Data Marketplace & Data Lineage"]
    T3 --> Pres3["👥 Visit Room 'Mondrian'<br/>(Client attends Presentation)"]
    Pres3 --> Code3["🔑 Enter Presenter Word: 'MARKETPLACE'<br/><b>🎉 DIGIT #3 REVEALED: [ 9 ]</b>"]

    Code3 --> P4["🧩 Puzzle 4: Asset Anomaly Hunter<br/>(Catch 4 corrupted banking records)"]
    P4 --> T4["🏢 Team 4 Revealed:<br/>Enterprise Data Assets & Data Quality"]
    T4 --> Pres4["👥 Visit Room 'Rembrandt'<br/>(Client attends Presentation)"]
    Pres4 --> Code4["🔑 Enter Presenter Word: 'INTEGRITY'<br/><b>🎉 DIGIT #4 REVEALED: [ 4 ]</b>"]

    Code4 --> Vault["🎁 The Physical Vault Terminal<br/>Dial [ 7 - 3 - 9 - 4 ] to Crack Safe!"]
    Vault --> PhysicalBox["🔓 Open Physical Souvenir Box on Table<br/>Claim Dutch Treats & Souvenirs!"]
```

---

## 🛠️ The 4 Teams & Challenges

| # | Team Name | Domain Focus | Room / Booth | Puzzle Mini-Game | Presenter Passcode | Safe Code Unlock |
|---|-----------|--------------|--------------|------------------|-------------------|------------------|
| **1** | **Metadata and governance solutions** | Catalogs, Regulatory Compliance & DNB Audits | Room *Vermeer* | **The Lineage & Regulatory Trail:** Sequence the 4 compliance stages in order | `GOVERNANCE` | **Digit #1: `7`** |
| **2** | **Enterprise Data Lake** | Storage, Lakehouse Ingestion & Compute | Room *Van Gogh* | **Cloud Data Lake Ingestion:** Connect banking streams to cloud Lakehouse engines | `LAKEHOUSE` | **Digit #2: `3`** |
| **3** | **Data Marketplace & Data Lineage** | Data Products, Discoverability & Contracts | Room *Mondrian* | **Marketplace Handshake:** Tune Protocol (Kafka), SLA (<15ms), and Security (mTLS) | `MARKETPLACE` | **Digit #3: `9`** |
| **4** | **Enterprise Data Assets & Data Quality** | Data Observability, Accuracy & Cleansing | Room *Rembrandt* | **Asset Anomaly Hunter:** Tap 4 corrupted transaction rows before audit timeout | `INTEGRITY` | **Digit #4: `4`** |
| **🏆** | **The Physical Vault** | Physical 4-Digit Combination Safe | Main Table | **Tumbler Dial Safe Screen:** Enter 7 - 3 - 9 - 4 and open the physical box | *Code Match* | **Souvenirs Claimed!** |

---

## 💻 Quick Start & Running

### 1. Start Development Server
```bash
npm run dev
```

### 2. Production Build
```bash
npm run build
```

---

## 🎨 How to Customize for Your Event

All customizable event settings are located in [`src/config/questConfig.js`](file:///c:/Users/Aryan/Desktop/Folders/Projects/data-treasure-hunt/src/config/questConfig.js):
- `DEFAULT_VAULT_CODE`: Change the 4-digit code (e.g. `"2486"`).
- `room`: Room names/booth locations.
- `presenters`: Names of speakers.
- `presentationSecretCode`: Check-in keyword for each presentation.
