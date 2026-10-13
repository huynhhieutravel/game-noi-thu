# Offline-First Save Portability and Arcade Fair-Play Architecture

## Context
Yokai Onet targets cross-platform mobile players on iOS/Android (via Capacitor) and mobile browsers (via PWA). Players need progression safety across 100 levels and 495 collected characters without the overhead, privacy friction, or operational cost of backend user accounts. Additionally, modern free-to-play puzzle games often gate progression behind artificial stamina or energy systems, which frustrates players and contradicts classic Pikachu Onet gameplay.

## Decision
We enforce a strict Zero-Cloud Offline-First architecture:
1. **Save Portability**: Player progress is stored locally in client storage, with a zero-cloud Export/Import backup code mechanism (Base64 checksummed string) enabling instant cross-device transfer.
2. **Arcade Fair-Play**: Level attempts are unconstrained by energy or heart timers. In-game Coins are dedicated exclusively to optional boosters, revives, and companion unlocks.
3. **Procedural Media**: Audio and typography are 100% self-hosted and procedurally synthesized, eliminating runtime network asset dependencies.

## Consequences
- Zero server maintenance cost and zero risk of service deprecation.
- Absolute privacy and compliance (no GDPR/COPPA user tracking or authentication databases).
- Instant offline cold boot without render-blocking network stalls.
- Players can play indefinitely without arbitrary waiting gates.
