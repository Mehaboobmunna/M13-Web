# Quartet Clash: Online Multiplayer Rooms, Single Player Bot Configuration & Gameplay Hardening

Add dedicated game entry mode selection (Single Player vs Online Multiplayer), Firebase Firestore real-time room synchronization with shareable room codes and pre-game lobby, strict bot replacement only for disconnected players, fix bot turn stalls, and lock center status tile dimensions.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural decisions were confirmed in Phase 1 interactive clarification:
> - **Multiplayer Synchronization Engine**: Powered by **Firebase Firestore** real-time listeners (`onSnapshot`) to enable cross-device room code sharing and multi-user gameplay across any browser or mobile device.
> - **Single Player Bot Selection**: A clean **prompt modal** at game start allowing the player to select 3, 4, or 5 bots (for 4, 5, or 6 players total).
> - **Multiplayer Lobby Experience**: A **pre-game lobby screen** displaying the unique shareable Room Code, real-time joined players list, and a "Start Tournament" button for the room host.
> - **Bot Replacement Policy**: Bots are **strictly prohibited from taking over active player turns**. Bots will **only** replace players who quit or disconnect from a multiplayer match to keep the game alive for remaining players.

---

### 1. Overview & Core Concept

- **What It Does**: Quartet Clash will feature a clean Title Mode selection at start:
  1. **Single Player Mode**: The user is prompted to pick how many bot competitors they want at the table (3, 4, or 5 bots $\to$ 4, 5, or 6 players total).
  2. **Online Multiplayer Mode**: The user can create a new room (generating a short, shareable 6-character room code) or join an existing room by entering a code. In the pre-game lobby, players see all joined participants in real time. Once ready, the host starts the match. If any player leaves, a bot seamlessly replaces them.
- **Key Fixes & Refinements**:
  - **Fixed Center Status Tile**: The center action and animation area is locked to a strict constant height (`h-44 sm:h-48`) so the board never expands or contracts during card flight, player turn, or bot decisions.
  - **Chloe / Bot Stalling Fix**: A robust, resilient turn scheduler replaces fragile single-timer references to ensure bots (e.g. Chloe) always execute their clockwise pass even across component re-renders.
  - **15-Second Auto-Pass**: If any human player does not pass within 15 seconds, their least-matching single card is automatically passed clockwise.

---

### 2. User Experience & Visual Design

#### A. Entry Mode & Setup Flow
```
┌─────────────────────────────────────────────────────────────┐
│                 ⚡ QUARTET CLASH: ENTRY                     │
│           Choose your game mode to get started              │
│                                                             │
│   ┌─────────────────────────┐   ┌─────────────────────────┐ │
│   │     👤 SINGLE PLAYER     │   │     🌐 MULTIPLAYER      │ │
│   │   Play offline vs Bots  │   │  Create or join online  │ │
│   │    [ Select & Play ]    │   │      [ Join / Host ]    │ │
│   └─────────────────────────┘   └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

1. **Single Player Setup Modal**:
   - Displays a clean selector: `3 Bots (4 Players - Fast)`, `4 Bots (5 Players - Strategic)`, `5 Bots (6 Players - Maximum Optimum)`.
   - Remembers previous player choice in local storage.
2. **Multiplayer Room Creation & Join Modal**:
   - **Host**: Generates a shareable Room Code (e.g. `CLASH-782`). Provides 1-click "Copy Room Link / Code".
   - **Joiner**: Enter 6-character code $\to$ joins the room in real time.
3. **Pre-Game Lobby**:
   - Lists connected players with custom avatars, host badge, player count badge ($2/6$ to $6/6$), and theme selection by host.
   - Host has a glowing "Start Tournament" CTA. Empty seats are filled by bots upon launch if desired.

#### B. Center Status Tile Strict Geometry
- Center table tile uses fixed height: `h-44 sm:h-48 shrink-0 overflow-hidden` with flex centering.
- Content changes (Face-down card in flight $\to$ Active human pass button $\to$ Bot evaluating) cross-fade smoothly inside the rigid frame with zero layout shifts.

#### C. Color & Typography
- **Theme**: Deep slate/indigo card table background (`bg-slate-950` with emerald accents).
- **Typography**: `Plus Jakarta Sans` for clean titles, `font-mono tabular-nums` for timers and room codes.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Firebase Firestore Provisioning for Online Rooms**:
  - *Chosen Approach*: Provision Firebase Firestore via `show_aistudio_ui` (`firebase_setup`), verify terms via `GetFirebaseTos`, and run `ProvisionFirebase` RPC.
  - *Why*: Provides persistent, low-latency room documents with real-time `onSnapshot` listeners across mobile and desktop without needing a custom WebSocket daemon.
- **Decision 2: Strict Bot Replacement Invariant**:
  - *Chosen Approach*: Remove the manual "Bot Takeover / Autoplay" toggle from the active player HUD. A player must play their own hand. If a player disconnects or leaves mid-match, the room's host or state machine marks that seat as `isBotControlled: true` so the remaining players are never blocked.
- **Decision 3: Turn Engine Resilience (Fixing Chloe / Bot Stalls)**:
  - *Chosen Approach*: The bot turn execution will use a state-driven `useEffect` keyed on `[currentStep, activePlayerIdx, isTransferring]` with defensive error boundaries and fallback auto-advance. This completely eliminates orphaned timers and ensures bots always complete their pass.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        QUARTET CLASH ARCHITECTURE                      │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  [ Title / Mode Selection ]                                            │
│        ├── Single Player ──> Bot Count Modal (3, 4, 5 Bots)            │
│        └── Multiplayer   ──> Create Room / Join Room                   │
│                                      │                                 │
│                                      ▼                                 │
│                         [ Pre-Game Lobby View ]                        │
│                                      │ (Host clicks Start)             │
│                                      ▼                                 │
│                         [ Active Card Table HUD ]                      │
│        ┌─────────────────────────────┬──────────────────────────────┐  │
│        │ Top Opponents (3-5 rivals)  │ Clockwise Turn Sequencer     │  │
│        ├─────────────────────────────┴──────────────────────────────┤  │
│        │ Center Status Tile: Strict Fixed Height (h-44 / h-48)      │  │
│        │  - Secret In-Flight Mystery Card Banner                    │  │
│        │  - Human Pass Controls & 15s Auto-Pass Timer (Least Count) │  │
│        │  - Bot Decision Notice & Resilient Auto-Advance            │  │
│        ├────────────────────────────────────────────────────────────┤  │
│        │ Human Hand: Stacked (Askew) or Spread View                 │  │
│        │ (Strict Constant Card Dimensions w-32 sm:w-36, h-48 sm:h-52)│  │
│        └────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  [ Real-Time Data Sync: Firebase Firestore ]                           │
│        /rooms/{roomId}                                                 │
│          ├── status: 'lobby' | 'playing' | 'round_end'                 │
│          ├── hostId, roomCode, tableSize, currentThemeId               │
│          ├── players: [ { id, name, avatar, isBot, handCount, ... } ]  │
│          └── activeTransfer: { from, to, stepNum, directionTitle }     │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

### 5. Implementation Phases

1. **Phase 1: Firebase Provisioning & Blueprint Setup**:
   - Request user confirmation for Firebase via `show_aistudio_ui` (`firebase_setup`).
   - Call `ProvisionFirebase` RPC to initialize Firestore.
   - Create `firebase-blueprint.json` and deploy secure `firestore.rules` for `/rooms/{roomId}`.
2. **Phase 2: Mode Selection & Lobby Components**:
   - Add Mode Selection view (`Single Player` vs `Multiplayer`).
   - Add Single Player Bot Count Selector modal (3, 4, or 5 bots).
   - Add Multiplayer Room Creation, Code Sharing, and Pre-Game Lobby.
3. **Phase 3: Turn Engine Hardening & Bug Fixes**:
   - Fix the Chloe / Bot stalling bug by converting to state-driven turn lifecycle with resilient step handling.
   - Fix Center Status Tile to strict fixed height (`h-44 sm:h-48`) so it never shrinks or expands.
   - Enforce 15-second auto-pass on least-count card.
   - Enforce strict bot replacement rule: remove manual bot takeover button; bots only replace disconnected players.
4. **Phase 4: Verification & Testing**:
   - Test Single Player across 4, 5, and 6 players.
   - Test Multiplayer room creation and join flow.
   - Run `compile_applet` and `lint_applet` to verify clean compilation.
