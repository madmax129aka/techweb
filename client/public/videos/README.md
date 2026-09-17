# Per-event promotional videos (Section 5F)

Drop one short, muted, seamlessly-looping `.mp4` per event in this folder,
named to match the event's slug (lowercase, spaces -> hyphens, matching
exactly what `getEventVideoSrc()` in `client/src/lib/eventVideos.js`
generates from the event's `name` field). For the current seeded events:

```
coding-marathon.mp4
paper-presentation.mp4
hackathon.mp4
tech-quiz.mp4
robo-race.mp4
web-design-contest.mp4
poster-presentation.mp4
startup-pitch.mp4
treasure-hunt.mp4
gaming-tournament.mp4
photography-contest.mp4
```

**None of these files exist yet.** This sandbox has no video-generation
tool and no way to render/preview media, so no actual video content was
created here - only the plumbing to use one once it exists
(`components/EventHeroMedia.jsx`). Until a matching file is added, the
event detail page's hero simply shows the existing static banner image
(from `getEventImage()` in `eventImages.js`) - there is no broken-video
icon or blank space either way.

## Recommended encoding

Target under 3-5MB per clip so the hero loads fast:

```bash
ffmpeg -i source.mov -vcodec libx264 -crf 28 -preset veryslow -an -movflags +faststart output.mp4
```

- `-an` strips audio (playback is always muted, so audio is dead weight)
- `-movflags +faststart` lets the browser start playing before the whole
  file downloads
- 5-10 seconds, looped seamlessly (matching first/last frame helps)

The video only starts loading once its section actually scrolls into
view (see the `IntersectionObserver` in `EventHeroMedia.jsx`), and never
autoplays for visitors with `prefers-reduced-motion` enabled - both are
already handled in code, no extra step needed here.
