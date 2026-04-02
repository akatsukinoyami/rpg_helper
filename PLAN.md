# RPG Helper — Feature Plan

## Status legend

- ✅ Done
- 🔨 In progress
- ⬜ Not started

---

## Already done ✅

- SvelteKit project, auth (better-auth), GM/player roles
- Game CRUD, Character CRUD with race-based stats/skills
- Character approval workflow (pending → approved/rejected)
- Character visibility grants (`characterVisibility` table)
- Remote functions migration (`$lib/remote/`)
- Character cards with flip animation
- i18n (paraglide), themes

---

## 0. OAuth ⬜

- Add Google, Discord, and Telegram OAuth providers via better-auth
- Sign-in page: show OAuth buttons alongside existing email/password form
- On first OAuth login: prompt to pick a display name if not provided by provider
- Settings page: show connected providers, allow linking/unlinking additional providers

---

## 1. DB Schema Extensions ⬜

### 1a. Games — configurable HP/MP labels

```
games
  + hpLabel  text  default 'HP'
  + mpLabel  text  default 'MP'
```

### 1b. Characters — vital stats & location

```
characters
  + hp                 int   default 0
  + maxHp              int   default 0
  + mp                 int   default 0
  + maxMp              int   default 0
  + currentLocationId  text  FK → locations.id  nullable
```

### 1c. Locations

```
locations
  id           text  PK
  gameId       text  FK → games.id
  parentId     text  FK → locations.id  nullable  (recursive)
  name         text
  description  text  nullable
  image        text  nullable
  hidden       bool  default false
  createdAt    timestamp
```

### 1d. Messages

```
messages
  id                text  PK
  locationId        text  FK → locations.id
  characterId       text  FK → characters.id  nullable  (null = system message)
  content           text
  editedAt          timestamp  nullable
  deletedAt         timestamp  nullable  (soft delete)
  replyToId         text  FK → messages.id  nullable
  referencedCharIds text[]  nullable  (array of character IDs, for @mentions)
  gmAnnotation      text  nullable
  createdAt         timestamp
```

### 1e. Stat change proposals (HP/MP edits pending GM approval)

```
statProposals
  id           text  PK
  characterId  text  FK → characters.id
  proposedBy   text  FK → users.id
  field        enum('hp', 'mp', 'maxHp', 'maxMp')
  delta        int   (positive = gain, negative = loss)
  reason       text  nullable  (e.g. "used 1 Potion")
  status       enum('pending', 'approved', 'rejected')  default 'pending'
  createdAt    timestamp
```

- On approval: apply delta to character, emit feed event, delete proposal
- On rejection: delete proposal silently
- Feed shows approved proposals only: `{charName} lost 1 Potion, received 10 HP`

### 1f. Item change proposals (inventory edits pending GM approval)

```
itemProposals
  id           text  PK
  characterId  text  FK → characters.id
  proposedBy   text  FK → users.id
  charItemId   text  FK → charItems.id  nullable  (null = new item)
  itemTypeId   text  FK → itemTypes.id
  deltaQty     int   nullable   (quantity items)
  deltaDur     int   nullable   (durability items)
  reason       text  nullable
  status       enum('pending', 'approved', 'rejected')  default 'pending'
  createdAt    timestamp
```

### 1g. Item types (game library + optional premade)

```
itemTypes
  id            text  PK
  gameId        text  FK → games.id  nullable  (null = premade/global)
  name          localizedText
  description   localizedText  nullable
  image         text  nullable
  weight        numeric  default 0
  trackingMode  enum('durability', 'quantity')
  maxDurability int  nullable  (only when trackingMode = durability)
  createdAt     timestamp

charItems
  id           text  PK
  characterId  text  FK → characters.id
  itemTypeId   text  FK → itemTypes.id
  durability   int   nullable
  quantity     int   nullable
  createdAt    timestamp
```

Money = ItemType with `trackingMode = quantity`, created by GM.

### 1h. Skill types (game library + optional premade)

```
skillTypes
  id          text  PK
  gameId      text  FK → games.id  nullable  (null = premade/global)
  name        localizedText
  description localizedText  nullable
  createdAt   timestamp

charSkills
  characterId  text  FK → characters.id
  skillTypeId  text  FK → skillTypes.id
  PRIMARY KEY (characterId, skillTypeId)
```

GM names skills however they like (e.g. "Flip L1", "Flip L2"). No level tracking needed.

---

## 2. Real-time WebSocket Infrastructure ⬜

### 2a. Server setup

- Research WS approach based on chosen production adapter (deferred — do before implementation)
- Rooms keyed by `gameId`
- Auth handshake: validate session cookie on WS upgrade

### 2b. Event types broadcast per game room

| Event | Payload |
| --- | --- |
| `message:created` | full message object |
| `message:edited` | messageId, content, gmAnnotation |
| `message:deleted` | messageId |
| `character:moved` | characterId, fromLocationId, toLocationId |
| `character:stat` | characterId, field, oldValue, newValue |
| `character:item` | characterId, charItem (upsert or delete) |
| `dice:roll` | characterId, formula, rolls, total |
| `location:revealed` | locationId |

### 2c. Client store

- Svelte store `wsStore` — singleton per game layout, reconnects on disconnect
- Each component subscribes to relevant event types
- On reconnect: re-fetch stale data via `invalidateAll()`

---

## 3. Dice Roller ⬜

### 3a. Shared formula parser util

- Parses `NdS+M` (e.g. `2d6+3`, `d20`, `4d4-1`)
- Returns `{ formula, rolls: int[], modifier: int, total: int }`
- Used both by the standalone widget and by inline message resolution (§3c)

### 3b. Standalone widget (dumb, no side effects)

- Floating, collapsible, visible on all game pages (game layout)
- State (open/closed) persisted in localStorage
- Quick buttons: d4, d6, d8, d10, d12, d20
- Custom formula text input + roll button
- Displays result locally with breakdown (e.g. `2d6+3 → [4, 2] +3 = 9`)
- Broadcasts `dice:roll` WS event so others in the game see it (toast or feed)
- No DB writes, no stat effects — purely informational

### 3c. Inline dice in GM messages (connected)

- GM can include dice expressions in message content using `{NdS+M}` syntax
- Example: `{charName} receives a hit, loses {1d4+2} HP`
- On message send: server resolves all `{...}` expressions, replaces with rolled result
- Resolved values stored in message content (permanent, not re-rolled on reload)
- After resolution, server auto-creates an approved `statProposal` for the affected character, applies it immediately, emits feed event

---

## 4. Locations ⬜

### 4a. GM: location management

- Location tree UI (recursive, collapsible) in game sidebar or dedicated GM panel
- CRUD: create / edit / delete location (name, description, image upload, parent, hidden toggle)
- Reveal hidden location: sets `hidden = false`, broadcasts `location:revealed`
- Hidden locations shown as "???" to players until revealed

### 4b. Player: navigation

- Location tree shows only non-hidden locations (current location always visible even if hidden)
- "Move here" button per location
- On move: updates `characters.currentLocationId`, inserts system message in the previous location: `{charName} moved to {newLocationName}`, WS broadcasts `character:moved`

### 4c. Location page

- Header: name, description, image
- Child locations list (non-hidden shown normally, hidden shown as "???")
- Characters currently here (avatars/names)
- Message feed for this location (§5)

---

## 5. Messages ⬜

### 5a. Message feed (per location)

- Initial load: last N messages
- Infinite scroll upward for older messages
- New messages appended live via WS `message:created`
- System messages: italic, muted colour, no avatar
- Soft-deleted: show "Message deleted" placeholder
- MD rendering (`marked` + `DOMPurify`)

### 5b. Writing a message

- Only characters currently in this location can post
- Textarea with basic MD toolbar shortcuts (bold, italic, heading)
- Reply: button on any message → sets `replyToId`, shows quoted preview in composer
- Character mention: `@name` autocomplete from game roster

### 5c. Editing & deleting

- Character owner can edit own messages (`editedAt` set), WS `message:edited`
- Owner or GM can soft-delete (`deletedAt` set), WS `message:deleted`
- "Edited" badge shown on message

### 5d. GM annotation

- GM sees "Annotate" button on any message
- Saves to `messages.gmAnnotation`, visible to everyone in location
- WS broadcasts `message:edited`

---

## 6. Game Feed ⬜

### 6a. Feed page (per game, `/games/[id]/feed`)

- Chronological list across all locations
- Included: messages, system messages (relocations), approved stat changes, approved item changes
- Excluded: approvals themselves, pending proposals
- Initial load: last N entries; infinite scroll for older
- Real-time: WS events appended live

### 6b. Entry rendering

| Type | Format |
| --- | --- |
| Message | `[Location] [CharName]: content preview` |
| Relocation | `[CharName] moved to [Location]` |
| Stat change | `[CharName] HP: 24 → 18` |
| Item change | `[CharName] received/lost [ItemName] ×3` |

---

## 7. Character Sheet — HP/MP & Vitals ⬜

### 7a. Display

- HP/maxHP and MP/maxMP bars on character card back and character detail page
- Labels from `game.hpLabel` / `game.mpLabel`
- Pending proposals shown as a small badge (e.g. `HP −4 pending`)

### 7b. Player proposes a change

- Player submits a proposal: field, delta, optional reason (e.g. "used 1 Potion")
- Proposal recorded in `statProposals` with `status = pending`
- Shows in GM's approval queue

### 7c. GM approval queue

- List of pending `statProposals` and `itemProposals` per game
- Approve: applies delta, records feed event, deletes proposal
- Reject: silently deletes proposal

### 7d. GM direct edit (no proposal needed)

- GM can directly set HP/MP/maxHP/maxMP on a character
- Immediately applies, broadcasts `character:stat`, creates feed entry

---

## 8. Items ⬜

### 8a. GM: item type library (`/games/[id]/library/items`)

- CRUD for ItemTypes: name, description, image, weight, trackingMode, maxDurability
- Option to include premade global ItemTypes when creating game (toggle on game creation form)

### 8b. Character inventory

- Listed on character detail page
- Quantity items: show count, +/- proposes `itemProposal`
- Durability items: show durability bar, edit proposes `itemProposal`
- Total carried weight shown at bottom
- GM can directly add/remove items (bypasses proposal)

### 8c. Money

- Just an ItemType with `trackingMode = quantity` (GM creates it, e.g. "Gold Coins")
- No special treatment in schema

---

## 9. Skills ⬜

### 9a. GM: skill type library (`/games/[id]/library/skills`)

- CRUD for SkillTypes: name, description, levels JSON
- Option to include premade global SkillTypes when creating game

### 9b. Character skills

- Listed on character detail page
- Shows current level + level description from SkillType.levels
- GM can add/remove skills and set level directly
- Player can edit through approve

---

## 10. Game Settings Additions ⬜

- HP label / MP label free-text fields (defaults: "HP" / "MP")
- Premade library toggles (items, skills) — shown only on game creation, not edit
- Extends existing `editGame` remote and game edit form

---

## Implementation order (suggested)

1. **DB migrations** — all schema extensions (§1)
2. **WS infrastructure** (§2) — research adapter first, then implement
3. **Locations** (§4) — foundation for messages
4. **Messages** (§5) — core gameplay loop
5. **Character vitals + proposal queue** (§7) — HP/MP display, proposals, GM queue
6. **Items** (§8)
7. **Skills** (§9)
8. **Game feed** (§6)
9. **Dice roller** (§3) — widget first (3b), inline resolution last (3c)
10. **Game settings additions** (§10)
