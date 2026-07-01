# 🦕🦄 KidQuest — Gezinstaak App

## Concept

Een visueel, leuk systeem om taken van kinderen (2 dochters: Aline, 8j en Lea, 5j) bij te houden. Met een puntensysteem, beloningen en straffen.

### Doelgroep

- Gezin: mama, papa + 2 dochters (5 en 8 jaar)
- Ouders beheren het systeem, kinderen kunnen taken (laten) afvinken

### Thema & Styling

- **Aline (8j):** Unicorn-thema 🦄 — lavendel `#C9B8E8` + roze `#F4A7B9`
- **Lea (5j):** Dino-thema 🦕 — salie groen `#7BAE7F`
- **Algemeen:** Rustig, modern, speels. Crème achtergrond `#FAF7F0`
- **Typography:** Nunito + Baloo 2
- **UI-stijl:** Grote kaarten, ronde hoeken, kaart-stijl met avatars in cirkel

---



## Puntensysteem



### Regels

- Kinderen **verdienen punten** als ze een taak afvinken (dagelijks/wekelijks: zelfde bedrag als de straf bij missen; bonus: hogere beloning)
- Kinderen **verliezen punten** als standaard taken niet gedaan worden (einde dag)
- **Beloning** gelinkt aan een punten-drempel (bv. 30 min schermtijd = 30 punten)
- **Straf**: punten aftrek (bv. -15 punten), waardoor beloningen (tijdelijk) onbereikbaar worden
- Punten kunnen terugverdiend worden via extra taken



### Standaard taken (dagelijks/wekelijks)


| Taak             | Type      | Emoji | Punten bij doen / verlies bij missen |
| ---------------- | --------- | ----- | ------------------------------------ |
| Tafel dekken     | Dagelijks | 🍽️   | +5 / -5                              |
| Tanden poetsen   | Dagelijks | 🦷    | +5 / -5                              |
| Spullen opruimen | Dagelijks | 🧹    | +5 / -5                              |
| Kamer opruimen   | Wekelijks | 🛏️   | +10 / -10                            |




### Bonustaken (punten verdienen)


| Taak         | Emoji | Punten |
| ------------ | ----- | ------ |
| Extra helpen | 🌟    | +20    |
| Boek lezen   | 📚    | +15    |




### Beloningen (punten kosten)


| Beloning          | Emoji | Kosten |
| ----------------- | ----- | ------ |
| 30 min schermtijd | 📱    | 30     |
| 1 uur schermtijd  | 📺    | 55     |
| Roblox sessie     | 🎮    | 40     |
| Snoepje kiezen    | 🍬    | 20     |
| iPad tijd         | 🎯    | 35     |




### Straffen (punten aftrek)


| Straf          | Emoji | Puntenverlies |
| -------------- | ----- | ------------- |
| Onbeleefd zijn | 😤    | -10           |
| Liegen         | 🤥    | -15           |
| Ruzie maken    | 😠    | -10           |
| Niet luisteren | 🙉    | -5            |


---



## Taak Flow

1. Ouder wijst taken toe aan kinderen (via dashboard)
2. **Standaard taken** verschijnen dagelijks/weekelijks per kind
3. **Taak unlocken:** Ouder moet taak eerst unlocken voordat kind kan afvinken
4. **Taak afvinken:** Ouder voert eerst pincode in (ouder modus) → kind/ouder kan taken afvinken zonder opnieuw pin in te voeren
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
- Per kind: takenlijst met afvink-buttons, punten-teller, beschikbare beloningen, **straffen vandaag** (door ouder gegeven)
- Pin-code popup voor ouderlijke bevestiging
- Animaties bij afvinken (punten vliegen, confetti)



### 2. Ouder Dashboard (laptop/tablet, achter pincode)

- 📋 **Taken** — dagelijkse/wekelijkse/bonustaken beheren, toewijzen, unlocken
- ⭐ **Punten** — handmatig toekennen/aftrekken + geschiedenis per kind
- 🎁 **Beloningen** — aanmaken, puntendrempel instellen, Bunny.net URL koppelen
- 🎯 **Spaardoelen** — groot doel (bv. uitstap), kinderen storten punten naartoe; visuele bijdrage per kind (gestapelde balk + legenda)
- ⚠️ **Straffen** — straf-voorinstellingen + geven, automatische dag-afhandeling
- 👧 **Kinderen** — profielen aanmaken/bewerken, thema (dino/unicorn) + avatar-emoji
- ⚙️ **Instellingen** — gezinsnaam, pincode wijzigen, uur van dag-afsluiting, startpunten per dag

---



## Tech Stack


| Laag     | Keuze                                               |
| -------- | --------------------------------------------------- |
| Frontend | Next.js 14 (App Router)                             |
| Styling  | Tailwind CSS + custom design system + Framer Motion |
| Database | SQLite via Prisma                                   |
| Auth     | Pincode (eigen implementatie, ouder-pincode)        |
| Media    | Bunny.net CDN (extern beheerd)                      |
| Deploy   | Docker multi-stage build → GHCR                     |

### App icons & PWA

- **Bron-icoon:** `public/icon.svg` — quest-ster op crème achtergrond, gradient ring (dino-groen → oranje → unicorn-lavendel), sparkle-accenten
- **Next.js (file-based):** `src/app/favicon.ico`, `src/app/icon.png` (192px), `src/app/apple-icon.png` (180px)
- **PWA / manifest:** `public/manifest.json` — SVG + PNG 192/512 in `public/icons/`
- **Metadata:** `src/app/layout.tsx` — `manifest`, `icons`, `appleWebApp`, `themeColor: #FAF7F0`
- **Regenereren:** `node scripts/generate-icons.mjs` (lokaal: `npm install --no-save sharp`)


---



## DevOps



### CI/CD Flow

```
Lokaal: git push → GitHub (main)
→ GitHub Actions: build Docker image (amd64 + arm64)
→ push naar ghcr.io/pvanpuyenbroeck/kidquest:latest
→ SSH naar VPS: pull image + update docker-compose.yml + docker compose up -d
```

**Workflow:** `.github/workflows/deploy.yml` (triggert op push naar `main` of handmatig via `workflow_dispatch`)

### Eerste keer op VPS (eenmalig)

1. **GitHub Secrets** instellen in repo → Settings → Secrets → Actions:
   - `VPS_HOST` = `91.99.105.174`
   - `VPS_USER` = `pieter`
   - `VPS_SSH_KEY` = private SSH key (volledige inhoud)
   - `GHCR_TOKEN` = GitHub PAT met `read:packages` (voor `docker pull` op VPS)

2. **VPS bootstrap** (SSH als `pieter`):
   ```bash
   curl -fsSL https://raw.githubusercontent.com/pvanpuyenbroeck/kidquest/main/scripts/vps-setup.sh | bash
   nano /opt/kidquest/.env   # PARENT_PIN + NEXTAUTH_URL aanpassen
   echo "<GHCR_TOKEN>" | docker login ghcr.io -u pvanpuyenbroeck --password-stdin
   cd /opt/kidquest && docker compose pull && docker compose up -d
   ```

3. **Verifiëren:**
   ```bash
   curl -s http://localhost:3001/api/health
   docker logs kidquest --tail 50
   ```

4. **Optioneel — Caddy reverse proxy** (als je een domein wilt):
   ```
   kidquest.jouwdomein.be {
     reverse_proxy localhost:3001
   }
   ```
   Zet dan `NEXTAUTH_URL` in `/opt/kidquest/.env` op `https://kidquest.jouwdomein.be`

### Deploy na wijzigingen

1. Commit + push naar `main` (of handmatig: Actions → "Build & Deploy KidQuest" → Run workflow)
2. GitHub Actions bouwt multi-arch image en deployt automatisch
3. Op VPS: container draait op poort **3001** → `http://91.99.105.174:3001`

**Let op:** uncommitted lokale wijzigingen worden niet gedeployed — eerst committen en pushen.

### VPS `.env` (productie)

| Variabele | Verplicht | Beschrijving |
|-----------|-----------|--------------|
| `PARENT_PIN` | Ja | Ouder-pincode (fallback; DB-instelling is leidend) |
| `NEXTAUTH_SECRET` | Ja | Willekeurige string voor sessie-HMAC (min. 32 tekens) |
| `NEXTAUTH_URL` | Ja | Publieke URL van de app (bijv. `http://91.99.105.174:3001`) |
| `DATABASE_URL` | Nee | Staat al in docker-compose: `file:/data/kidquest.db` |

### Docker details

- **Image:** `ghcr.io/pvanpuyenbroeck/kidquest:latest`
- **Poort mapping:** `3001:3000` (container luistert intern op 3000)
- **Volume:** `kidquest_data` → `/data` (SQLite persistent)
- **Startup:** `docker-entrypoint.sh` → `prisma migrate deploy` → `tsx prisma/seed.ts` bij eerste opstart → `node server.js`



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
SavingsGoal    — id, naam, emoji, targetPoints, currentPoints, availableTo, isCompleted
GoalContribution — goalId, childId, amount, createdAt
Punishment     — id, naam, emoji, pointsLoss
ChildPunishment — childId, punishmentId, reason, givenAt
PointHistory   — childId, delta (+/-), reason, sourceType, sourceId, createdAt
Settings       — familyName, parentPin, dayCloseHour (standaard 20), dailyStartPoints (standaard 10), lastDayStarted
```

---



## Architectuur (geïmplementeerd)

```
src/
├── app/
│   ├── api/
│   │   ├── auth/                   # pin, session, logout
│   │   ├── dashboard/
│   │   │   ├── tasks/              # GET/POST, [id] PATCH/DELETE, assign, unlock
│   │   │   ├── rewards/            # GET/POST, [id] PATCH/DELETE
│   │   │   ├── goals/              # GET/POST, [id] PATCH/DELETE
│   │   │   ├── punishments/        # GET/POST, [id] PATCH/DELETE, give
│   │   │   ├── day-close/          # POST — dag handmatig afsluiten
│   │   │   ├── settings/           # GET/PATCH — gezinsnaam, pincode, dag-uur, startpunten
│   │   │   └── children/           # GET/POST, [id] PATCH/DELETE, [id]/points POST
│   │   ├── family/route.ts
│   │   ├── health/route.ts
│   │   ├── goals/contribute/route.ts  # POST — punten storten op doel
│   │   ├── rewards/claim/route.ts  # POST — beloning claimen
│   │   └── tasks/complete/route.ts
│   ├── dashboard/
│   │   ├── layout.tsx              # DashboardShell + pin-gate
│   │   ├── tasks/page.tsx
│   │   ├── points/page.tsx
│   │   ├── rewards/page.tsx
│   │   └── goals/page.tsx
│   │   └── punishments/page.tsx
│   │   └── children/page.tsx
│   │   └── settings/page.tsx
│   ├── family/page.tsx
│   └── globals.css
├── components/
│   ├── dashboard/                  # DashboardGate, TasksManager, PointsManager, RewardsManager, GoalsManager, PunishmentsManager, ChildrenManager, SettingsManager
│   ├── goals/GoalProgressCard.tsx  # spaardoel voortgang + storten
│   ├── goals/GoalContributionBreakdown.tsx  # gestapelde balk + legenda per kind
│   ├── punishments/PunishmentCard.tsx  # alleen-lezen op gezinsscherm
│   ├── rewards/RewardCard.tsx      # klikbaar op gezinsscherm
│   ├── children/ChildColumn.tsx
│   ├── shared/                     # FamilyScreen, PinModal, RewardCelebration, ...
│   └── tasks/TaskItem.tsx, TaskList.tsx
├── lib/
│   ├── prisma.ts, auth.ts, session.ts, api-auth.ts
│   ├── db.ts                       # gezinsscherm, taak afvinken, beloning claimen, straffen vandaag
│   ├── dashboard.ts                # taken CRUD, unlock, punten aanpassen
│   ├── rewards.ts                  # beloningen CRUD
│   ├── goals.ts                    # spaardoelen CRUD
│   ├── goal-contributions.ts       # aggregatie GoalContribution per kind/doel
│   ├── punishments.ts              # straffen CRUD + geven
│   ├── day-close.ts                # gemiste taken + puntenaftrek
│   ├── day-start.ts                # dagstart: punten resetten naar dailyStartPoints
│   ├── settings.ts                 # gezinsnaam, pincode, dag-uur, startpunten
│   └── utils.ts
└── stores/
    └── parentAuthStore.ts
```

**Seed kinderen:** Aline (unicorn, 25 punten) + Lea (dino, 15 punten)

**Ouder-pincode:** standaard `1234` (via Settings of `PARENT_PIN` env)

**Dashboard:** `/dashboard` — pincode vereist. Tabs: Taken, Punten, Beloningen, Doelen, Straffen, Kinderen, Instellingen.

**Kinderen & instellingen:** Kinderen-tab beheert profielen (naam, kleur/thema, avatar-emoji; verwijderen = deactiveren, punten/historiek blijven). Zes kleuren: dino groen, unicorn paars, ocean blauw, sunset oranje, berry roze, sunshine geel. Instellingen-tab regelt gezinsnaam, ouder-pincode (4 cijfers), het uur van automatische dag-afsluiting en het aantal startpunten per dag (standaard 10). De DB-pincode is leidend (env `PARENT_PIN` enkel fallback).

**Gezinsscherm:** Kalender met huidige dag + weekoverzicht. Taken en beloningen gelden per dag (beloningen resetten elke dag). Bij een nieuwe kalenderdag worden kindpunten gereset naar `dailyStartPoints` (na verwerking van gemiste taken). Spaardoelen blijven bewaard over dagen heen.

**Bonustaken:** Ouder geeft bonustaak via dashboard → kind ziet onder "Extra bonustaken" → voltooien levert punten + media unlock. Ontgrendelde media in "Mijn verrassingen".

**Spaardoelen:** Ouder maakt groot doel aan (bv. uitstap, 200 punten). Kinderen storten punten van bonustaken via "Punten storten" (ouder bevestigt). Gezinsdoelen tonen voortgang bovenaan; per kind eigen stort-knop in hun kolom. Bijdragen per kind zichtbaar als gestapelde voortgangsbalk (kind-themakleur) met legenda bv. "Emma: 15 ⭐ (60%)" — op gezinsscherm én ouder-dashboard.

**Straffen & dag-afhandeling:** Straf-voorinstellingen beheren in dashboard. Snel straf geven per kind. Niet-afgevinkte taken worden automatisch bestraft na 20:00 (of bij volgende app-load). Handmatig "Dag afsluiten" in Straffen-tab.

---

## Bouwvolgorde

1. ✅ **Fase 0** — Project scaffolding, GitHub, CI/CD, Docker, VPS config
2. ✅ **Fase 1** — Gezinsscherm (voorkant) met beide kinderen
3. ✅ **Fase 2** — Pincode authenticatie + taak afvinken flow
4. ✅ **Fase 3** — Ouder dashboard (taken beheren + handmatige punten)
5. ✅ **Fase 4** — Beloningen beheren & claimen op gezinsscherm
6. ✅ **Fase 5** — Bonustaken + Bunny.net media unlock
7. ✅ **Fase 6** — Straf-voorinstellingen beheren + automatische dag-afhandeling
8. ✅ **Fase 7** — Kinderen- & instellingen-tab, polish, tablet-optimalisatie

---



## Communicatievoorkeuren

- Gebruiker is Nederlandstalig
- Communicatie en templates in het Nederlands
- E-mail: [info@polariswebstudio.com](mailto:info@polariswebstudio.com) (Polaris Web Studio)

