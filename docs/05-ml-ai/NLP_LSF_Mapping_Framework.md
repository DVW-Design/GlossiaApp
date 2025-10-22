# NLP ⇄ LSF Mapping Framework

This document outlines a general mapping between **NLP (Natural Language Processing)** and **LSF (Langue des Signes Française / French Sign Language)**. The goal is to define how different layers of linguistic analysis in NLP can correspond to elements of sign language, and how to build a framework for translation, recognition, and synthesis.

---

## 🧠 General Mapping Framework

| **NLP Layer**             | **Equivalent in LSF**                                | **Mapping Possible?** | **Notes**                                                                 |
|--------------------------|------------------------------------------------------|------------------------|---------------------------------------------------------------------------|
| Phonetics / Phonology    | Handshapes, Movement, Location, Orientation, Facial Expressions | ✅ Partial         | Use SignWriting / HamNoSys for notation. Facial expressions also serve grammatical roles. |
| Morphology               | Sign inflection (tense, aspect, number), classifiers | ✅ Complex            | Classifiers in LSF act like morphemes. Verb modification is spatial.     |
| Syntax                   | Sign order, topic-comment structure                  | ✅ But different      | LSF often uses topic-first structure. Spatial syntax encoding (location = meaning). |
| Semantics                | Conceptual meaning of signs                          | ✅ Mappable           | Core meanings can map. Idioms and metaphors differ across languages.     |
| Pragmatics / Discourse   | Role shifting, gaze direction, affect, space use     | ✅ Needs modeling     | These are rarely modeled in NLP but critical in LSF.                     |
| Named Entities           | Fingerspelling, proper name signs                    | ✅ Limited            | Some names have unique signs, others must be fingerspelled.             |
| Sentiment Analysis       | Facial expression + movement intensity               | ✅ Experimental       | Emotion is encoded visually; detection requires video/gesture models.   |
| Text Generation          | Sign synthesis (avatar or video output)              | 🟡 Difficult          | Needs synthesis model (3D avatar, DGS, etc.). Syntax → motion mapping.  |
| Speech-to-Text           | Video-to-Gloss or Video-to-Text                      | 🟡 Needs Sign Model   | Requires CV + Sign NLP + text NLP pipeline.                             |
| Translation              | French ⇄ LSF translation                             | 🟡 Possible with training | Requires corpus of aligned text+signs (scarce). Existing attempts in DGS, ASL. |

---

## 🔧 Minimal Mapping Components

### 1. Input Layer (Data Collection)
- LSF video recordings (signed stories, dialogs, commands)
- Aligned transcripts: French text ↔ gloss ↔ sign (via ELAN or SignStream)
- 3D hand/body keypoints (MediaPipe, OpenPose, SignAll, etc.)

### 2. Intermediate Representation
- **Gloss Layer**: Abstract representation of signs in linear text (e.g., `VOIR ELLE DEMAIN`)
- **Classifier notation / movement vectorization** (e.g., `CL:1` hand moving forward)
- **Spatial model / scene mapping** if conversation is contextual

### 3. Processing Layer
- NLP tools for:
  - French parsing (syntax tree, dependency)
  - Named Entity Recognition
  - Intent classification
- LSF models for:
  - Gesture recognition (pose, handshape, classifier)
  - Sign segmentation (start/end)
  - Sign-to-gloss conversion

### 4. Output Layer
- Gloss → French / French → Gloss
- Avatar animation (e.g., using OpenPose + Blender rig or SignAvatar)
- Synthesized sign video (if possible)

---

## 🔄 NLP to LSF Mapping Table

| **NLP Entity**           | **LSF Equivalent**        | **Notes**                                  |
|--------------------------|---------------------------|--------------------------------------------|
| Subject                  | Location + Pointing       | Point to referent in space                 |
| Verb                     | Core sign + spatial inflection | Movement direction, intensity matter  |
| Object                  | Location/Direction        | Pointing or shifting signer’s body        |
| Tense/aspect markers     | Before/after signs, expression | Often optional or embedded in verb motion |
| Negation                 | Head shake + specific sign | Not linear; includes facial expression     |
| Questions                | Eyebrows + Sign order     | Eyebrows raised (yes/no), furrowed (wh)    |
| Emphasis                 | Intensity + repetition    | Sign repeated faster/harder                |

---

## 🤖 Future Development

- **AI Model Training**: Requires curated, aligned datasets (French ↔ LSF gloss ↔ video)
- **Corpus Needed**: ELAN-annotated video datasets, preferably open source
- **Avatar Generator**: Needed for NLP → LSF output (Blender / Unity + rig)
- **API/Toolkits**: 
  - SignWriting, HamNoSys parsers
  - OpenPose/MediaPipe for sign input
  - NLP toolkit for French (spaCy, CamemBERT, etc.)

---

## ✅ Next Step Suggestions

1. Build a **conceptual map** of:
   - NLP → Gloss → LSF video
   - LSF video → Gloss → NLP / Text

2. Start with **basic intents and domain vocabularies**:
   - Greetings, shopping, health, administration

3. Use **dual-mode app flow**:
   - Signer → camera → NLP/Gloss
   - Hearing person → text/voice → avatar sign / translated gloss

4. Design **fallback UI**: text, pictograms, and audio