# Track: The Bells of Lyonesse

- **Artist:** Dancing Salamanders
- **Album:** Dancing Salamanders
- **Track:** The Bells of Lyonesse
- **Status:** First scene to build (target: Phase 2, first real `scene.config.ts`-driven track). Audio file and finalized `lyrics.json` to be added later by the user; the raw lyric/section transcript below is captured now so mood/imagery details aren't lost before Phase 2 planning.

## Mood & imagery notes for scene design

Folk/Celtic ballad about the drowned city of Lyonesse (Cornish legend — a
sunken kingdom). Fingerpicked acoustic guitar, cello drone, strings,
glockenspiel, building to a full orchestral swell in the final chorus, then
fading back to solo acoustic guitar + cello. Suggests a scene built around:
hearth firelight, oak beams, slate roof, salt tide/sea, a sunken/underwater
city with bells, gray veil / white-crested foam, moonlight over water,
embers cooling as the song ends. Strong candidate for the `waveform` or
`pulseRings` visualizer style (gentle, ambient, swelling) rather than sharp
`bars`. Emotional arc: intimate/warm (fireside storytelling) → swelling/epic
(orchestral chorus, sunken kingdom) → quiet/resolved (embers cold, dreaming
face, final cello note) — a good candidate for lighting/particle intensity
that builds and recedes with the song's dynamics, not just a static per-track
config.

## Raw lyric/section transcript (as provided by user)

```
[Intro]
[fingerpicked acoustic guitar, soft cello drone]

[Verse 1]
[male tenor vocals]
Low beams of oak by a hearth fire's glow
The salt Cornish tide doth ebb and flow
A tattered tale starts to weave, hearth casts the dark toll
His voice bounces off the slate roof and wall
With curls of oak and brown eyes wide with that gleam
He reads me of a world tucked away in the bend of a dream

[Chorus]
[female harmony vocals enter, strings swell]
The bells of Lyoness, they chime through the deep
Silent ghosts of the kingdom stir from their sleep
A silver-lit sun where the Owen flow
Of sea and salt and such only it knows

[Verse 2]
[acoustic guitar continues, soft shaker and kick drum enter]
He tells of a land where the tide took hold
Of merchants, travelers, and crowns of gold
Beneath a gray veil upon white-crested foam
The city of Lyoness, your mother's home
Where the cauldrons brew with the Owen's grace
Entwining our hearts across all time and space

[Chorus]
[full strings, glockenspiel accents]
The bells of Lyoness, they chime through their keep
Ebb and flow through the heart that seeks
Seek a silver-lit realm where the Owen speak
Down deep unto a sunless sea, dark and bleak

[Bridge]
[music softens, acoustic guitar and solo violin]
The Owen-tat whispers is the poet's desire
The first spark, a burning fire
The breath in your life, the salt in the sea
A river of wisdom, it's you and it's me

[Verse 3]
[male vocals, acoustic guitar]
The tale's spun to its end, embers cold
A sunken city, its legend told
Her eyes close in his tender embrace
As the moonlight falls across her dreaming face
He hums an old tune, himself giving to rest
The daughter held close to his chest

[Chorus]
[full orchestral swell, harmonized vocals]
The bells of Lyoness, they chime through the keep
A sunless kingdom lost to the deep
Some say on a cold, windless night
Those bells, truly hear them ring, you just might
Outside the tide doth ebb, doth flow
A silent moon rises over the horizon low
A dreamer away under the waves down deep
Together to see her in their sleep

[Outro]
[acoustic guitar fades, final cello note]
```

## Still needed before Phase 2 implementation

- `audio.mp3` file (user to provide).
- Finalized `lyrics.json` with precise `{start, end, text}` second-accurate
  timestamps per line, derived from the actual audio once available (the
  transcript above has section labels but no timestamps yet).
- `meta.json`: `{ "title": "The Bells of Lyonesse", "artist": "Dancing
  Salamanders", "album": "Dancing Salamanders" }`.
