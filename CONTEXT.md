# 🦕🦄 KidQuest — Gezinstaak App

## Concept

Een visueel, leuk systeem om taken van kinderen (2 dochters: Emma, 8j en Lotte, 5j) bij te houden. Met een puntensysteem, beloningen en straffen.

### Doelgroep
- Gezin: mama, papa + 2 dochters (5 en 8 jaar)
- Ouders beheren het systeem, kinderen kunnen taken (laten) afvinken

### Thema & Styling
- **Emma (8j):** Dino-thema 🦕 — salie groen `#7BAE7F`
- **Lotte (5j):** Unicorn-thema 🦄 — lavendel `#C9B8E8` + roze `#F4A7B9`
- **Algemeen:** Rustig, modern, speels. Crème achtergrond `#FAF7F0`
- **Typography:** Nunito + Baloo 2
- **UI-stijl:** Grote kaarten, ronde hoeken, kaart-stijl met avatars in cirkel

---

## Puntensysteem

### Regels
- Kinderen verdienen punten bij **bonustaken** (niet de standaard taken)
- Kinderen **verliezen punten** als standaard taken niet gedaan worden
- **Beloning** gelinkt aan een punten-drempel (bv. 30 min schermtijd = 30 punten)
- **Straf**: punten aftrek (bv. -15 punten), waardoor beloningen (tijdelijk) onbereikbaar worden
- Punten kunnen terugverdiend worden via extra taken

### Standaard taken (dagelijks/wekelijks)
| Taak | Type | Emoji | Puntenverlies bij niet doen |
|------|------|-------|---------------------------|
| Tafel dekken | Dagelijks | 🍽️ | -5 |
| Tanden poetsen | Dagelijks | 🦷 | -5 |
| Spullen opruimen | Dagelijks | 🧹 | -5 |
| Kamer opruimen | Wekelijks | 🛏️ | -10 |

### Bonustaken (punten verdienen)
| Taak | Emoji | Punten |
|------|-------|--------|
| Extra helpen | 🌟 | +20 |
| Boek lezen | 📚 | +15 |

### Beloningen (punten kosten)
| Beloning | Emoji | Kosten |
|----------|-------|--------|
| 30 min schermtijd | 📱 | 30 |
| 1 uur schermtijd | 📺 | 55 |
| Roblox sessie | 🎮 | 40 |
| Snoepje kiezen | 🍬 | 20 |
| iPad tijd | 🎯 | 35 |

### Straffen (punten aftrek)
| Straf | Emoji | Puntenverlies |
|-------|-------|---------------|
| Onbeleefd zijn | 😤 | -10 |
| Liegen | 🤥 | -15 |
| Ruzie maken | 😠 | -10 |
| Niet luisteren | 🙉 | -5 |

---

## Taak Flow

1. Ouder wijst taken toe aan kinderen (via dashboard)
2. **Standaard taken** verschijnen dagelijks/weekelijks per kind
3. **Taak unlocken:** Ouder moet taak eerst unlocken voordat kind kan afvinken
4. **Taak afvinken:** Kind drukt op taak → "Roep mama of papa!" → ouder voert pincode in → ✅
5. **Niet gedaan:** Automatisch punten aftrekken bij einde dag
6. **Beloning claimen:** Kind heeft genoeg punten → ouder bevestigt (pincode) → punten worden afgetrokken
7. **Straf geven:** Ouder kiest straf in dashboard → punten aftrek

---

## Unlockable Media

- Ouder kan media (afbeeldingen/video's) koppelen aan speciale taken
- Kinderen unlocken deze media door de bijhorende taak te voltooien
- Bestanden worden gehost op **Bunny.net CDN** (door ouder zelf te beheren)

---

## Schermen

### 1. Gezinsscherm (tablet/TV — "voorkant")
- Beide kinderen **naast elkaar** met eigen kolom
- Per kind: takenlijst met afvink-buttons, punten-teller, beschikbare beloningen
- Pin-code popup voor ouderlijke bevestiging
- Animaties bij afvinken (punten vliegen, confetti)

### 2. Ouder Dashboard (laptop/tablet, achter pincode)
- 📋 **Taken** — dagelijkse/wekelijkse/bonustaken beheren, toewijzen, unlocken
- 🎁 **Beloningen** — aanmaken, puntendrempel instellen, Bunny.net URL koppelen
- ⚡ **Bonustaken** — speciale taken met puntbeloning + media unlock
- ⚠️ **Straffen** — straf aanmaken, punten aftrekken
- 👧 **Kinderen** — profielen, avatars, puntengeschiedenis
- ⚙️ **Instellingen** — gezinsnaam, pincode wijzigen

---

## Tech Stack

| Laag | Keuze |
|------|-------|
| Frontend | Next.js 14 (App Router) |
| Styling | Tailwind CSS + custom design system + Framer Motion |
| Database | SQLite via Prisma |
| Auth | Pincode (eigen implementatie, ouder-pincode) |
| Media | Bunny.net CDN (extern beheerd) |
| Deploy | Docker multi-stage build → GHCR |

---

## DevOps

### CI/CD Flow
```
Lokaal: git push → GitHub
→ GitHub Actions: build Docker image (amd64 + arm64)
→ push naar ghcr.io/pvanpuyenbroeck/kidquest
→ SSH naar VPS: docker pull + docker compose up -d
```

### VPS
- **IP:** `91.99.105.174`
- **User:** `pieter`
- **Poort:** `3001` (3000 bezet door vroom_api)
- **Architectuur:** ARM64
- **Path:** `/opt/kidquest/`
- **Database:** SQLite in persistent Docker volume

### GitHub
- **Repo:** `pvanpuyenbroeck/kidquest` (public)
- **GHCR:** `ghcr.io/pvanpuyenbroeck/kidquest`

### GitHub Secrets
- `VPS_HOST`: 91.99.105.174
- `VPS_USER`: pieter
- `VPS_SSH_KEY`: ~/.ssh/id_ed25519 (private key)
- `GHCR_TOKEN`: GitHub personal access token

### Andere containers op VPS (geen impact)
- Caddy (reverse proxy, poort 80/443)
- n8n (poort 5678)
- Baserow
- Directus (8055)
- PostgreSQL (2x)
- Redis (2x)
- Vroom API (poort 3000)
- OSRM Backend (poort 5000)
- Portainer (8000, 9443)

---

## Database Schema (Prisma)

```
Child          — id, naam, avatarEmoji, theme (dino/unicorn), punten, isActive
Task           — id, naam, emoji, type (daily/weekly/bonus), pointsReward, pointsLoss, mediaUrl, recurrence
ChildTask      — koppeltabel: welk kind heeft welke taken
TaskAssignment — dagelijkse instantie: childId, taskId, date, status (pending/unlocked/completed/missed)
Reward         — id, naam, emoji, pointsCost, mediaUrl
RewardClaim    — childId, rewardId, claimedAt
Punishment     — id, naam, emoji, pointsLoss
ChildPunishment — childId, punishmentId, reason, givenAt
PointHistory   — childId, delta (+/-), reason, sourceType, sourceId, createdAt
Settings       — familyName, parentPin
```

---

## Bouwvolgorde

1. ✅ **Fase 0** — Project scaffolding, GitHub, CI/CD, Docker, VPS config
2. 🔜 **Fase 1** — Gezinsscherm (voorkant) met beide kinderen
3. ⬜ **Fase 2** — Pincode authenticatie + taak afvinken flow
4. ⬜ **Fase 3** — Ouder dashboard (taken & kinderen beheren)
5. ⬜ **Fase 4** — Beloningen & puntensysteem
6. ⬜ **Fase 5** — Bonustaken + Bunny.net media unlock
7. ⬜ **Fase 6** — Straffen & puntengeschiedenis
8. ⬜ **Fase 7** — Polish, animaties, finetuning, tablet-optimalisatie

---

## Communicatievoorkeuren
- Gebruiker is Nederlandstalig
- Communicatie en templates in het Nederlands
- E-mail: info@polariswebstudio.com (Polaris Web Studio)
