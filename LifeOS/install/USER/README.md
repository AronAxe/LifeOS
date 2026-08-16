---
provenance: template
---

# USER/ — Your Identity Layer

This directory is retained **upstream LifeOS scaffolding** for capability reference. The HALOS Hermes importer does not copy it into a profile, populate it, or load it at session start. A principal's real identity belongs in approved Hermes-native destinations such as `SOUL.md`, configured TELOS, and a separately configured memory provider.

## Layout

```
LIFEOS/USER/
├── PRINCIPAL_IDENTITY.md   # Upstream identity scaffold; not loaded by HALOS
├── DA_IDENTITY.md          # Upstream DA scaffold; not loaded by HALOS
├── PROJECTS/PROJECTS.md    # Upstream project registry scaffold
├── TELOS/PRINCIPAL_TELOS.md # Upstream generated TELOS summary scaffold
├── Config/LIFEOS_CONFIG.yaml  # Credentials and config keys
├── RESUME.md               # Career detail
├── CONTACTS.md             # People you work with
├── WRITINGSTYLE.md         # How you write
├── RHETORICALSTYLE.md      # How you argue
├── OPINIONS.md             # Your DA's opinions on working with you
├── DEFINITIONS.md          # Canonical terms in your vocabulary
├── CORECONTENT.md          # The themes you write/talk about
├── AI_WRITING_PATTERNS.md  # Writing patterns to avoid
├── ARCHITECTURE.md         # How your LifeOS fits together
├── FEED.md                 # Sources you read
├── PRONUNCIATIONS.md       # Words the DA needs to say correctly
└── (subdirs) BUSINESS/, FINANCES/, HEALTH/, TELOS/...
```

## Bootstrap

These files document the upstream scaffold shape. HALOS onboarding must not populate this tree or treat it as canonical. Its interview workflow may help draft a principal-owned setup plan, but each destination and write requires explicit consent.

## Privacy

Everything in this directory is **private** and never ships in any LifeOS
release. The release builder (`skills/_LIFEOS/Tools/ShadowRelease.ts`)
deletes the entire `USER/` tree from staging and overlays generic
scaffolds in its place.
