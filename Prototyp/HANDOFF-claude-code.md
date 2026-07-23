# RALLIES — Handoff: Bedienbarkeit / Swipe-Flow (mobil)

Ziel: der bestehenden Vanilla-Seite (`index.html` / `style.css` / `script.js`)
ein weiches, sauber einrastendes Swipe-Gefühl geben, saubere Geräte-Anpassung
und ausdrucksstarke Rubriken-Übergänge — **ohne Inhalte zu ändern**.

Referenz-Implementierung: `rallies-flow-prototype.html` (eigenständig, gleiche Farben/Fonts).

---

## Die 3 Ursachen im Ist-Zustand (mobil, ≤768px)

Dein Ziel ist Shorts-Verhalten (immer genau eine Rubrik). Aktuell verhindern das:

1. **`height: 100dvh`** auf den Snap-Panels (Z.2216 ff.). `dvh` ändert sich beim
   Ein-/Ausblenden der Safari-Toolbar → Snap-Punkte verschieben sich mitten im Wisch
   → man bleibt zwischen zwei Rubriken hängen. **Das ist die Hauptursache.**
2. **Verschachteltes Scrollen:** `.services/.portfolio/.contact` haben zusätzlich
   `overflow-y:auto` (Z.2263–2270) INNERHALB des Snaps → innerer Scroll kämpft mit
   dem Paging → Haken + Zwischenstopps.
3. Snapping muss `mandatory` + `scroll-snap-stop: always` sein (ist teils vorhanden) —
   aber nur zuverlässig, wenn 1) und 2) gelöst sind.

---

## Die Fixes (Shorts-Style: immer genau EINE Rubrik)

Ziel: ein Wisch = genau eine Rubrik weiter, nie zwischen zweien stehenbleiben.
Das braucht drei Dinge zusammen — fehlt eins, „rutscht“ es.

### A) Festes Paging statt weichem Snap
```css
@media (max-width: 768px){
  html{
    scroll-snap-type: y mandatory;   /* NICHT proximity – proximity erlaubt Stehenbleiben */
    -webkit-overflow-scrolling: touch;
    overscroll-behavior-y: contain;
    /* KEIN scroll-behavior: smooth hier! (siehe unten) */
  }
  .hero,.services,.portfolio,.contact,.about-footer-wrap{
    scroll-snap-align: start;
    scroll-snap-stop: always;        /* BEHALTEN/WIEDER REIN – erzwingt eins-nach-dem-anderen */
  }
}
```
> **Wichtig – Ruck/Sprung beim Snap:** `scroll-behavior: smooth` NICHT auf den Snap-Container
> (html/scroller) legen. Es kämpft mit der nativen Snap-Animation → sichtbarer Sprung statt
> Shorts-artigem Gleiten. Die native `mandatory`-Snap-Bewegung folgt dem Finger und rastet
> von selbst weich ein. Weiche Navigation für Klicks (Punkt-Nav/Menü/CTAs) macht JS via
> `el.scrollIntoView({behavior:'smooth'})` – das reicht und stört das Wischen nicht.

### B) Gerätegenaue, FIXE Höhe (der eigentliche Grund fürs „Halb-dazwischen“)
`100dvh` ändert sich beim Toolbar-Ein/Ausblenden → die Snap-Punkte verschieben sich
mitten im Wisch → man landet zwischen zwei Rubriken. Lösung: Höhe per JS auf die
REALE Viewport-Höhe locken und als CSS-Variable setzen.

```js
function lockVH(){
  document.documentElement.style.setProperty('--appvh', window.innerHeight + 'px');
}
lockVH();
window.addEventListener('resize', lockVH);
window.addEventListener('orientationchange', ()=> setTimeout(lockVH, 200));
```
```css
@media (max-width: 768px){
  .hero,.services,.portfolio,.contact,.about-footer-wrap{
    height: var(--appvh, 100svh);   /* FIX, nicht 100dvh – jede Rubrik exakt ein Screen */
  }
}
```

### C) Überlauf sauber lösen (Kontakt-Formular) — ohne das Paging zu brechen
Panels dürfen NICHT clippen (sonst ist der „Nachricht senden"-Button unerreichbar),
aber auch keinen Scroll-Krieg mit dem Paging anzetteln. Muster:
```css
@media (max-width: 768px){
  .hero,.services,.portfolio,.contact,.about-footer-wrap{
    overflow-y: auto;
    overscroll-behavior: contain;      /* verhindert Scroll-Chaining → kein Haken */
    -webkit-overflow-scrolling: touch;
    justify-content: safe center;      /* zentriert kurze Inhalte, klippt lange NICHT oben */
  }
}
```
Kurze Rubriken sind mittig und scrollen nicht (kein Konflikt). Nur die zu hohe Rubrik
(Kontakt) scrollt intern; `overscroll-behavior:contain` hält das vom Paging getrennt.
Das ersetzt das alte, verschachtelte `overflow-y:auto` aus Z.2263–2270.

### D) Ausdrucksstarke Übergänge (Apple-/daspodcastufo-Charakter)
Pro Rubrik Inhalte gestaffelt einblenden, sobald sie in den Viewport gleiten —
IntersectionObserver (`root` = Scroll-Container), Klasse `in` togglen, siehe Prototyp
(`.rise` + `.panel.in .rise`). Robust in Safari + Opera GX. `prefers-reduced-motion` respektieren.

### E) Rubriken-Navigation (optional, großer UX-Gewinn)
Seitliche Dot-Navigation + dünner Fortschrittsbalken oben (siehe Prototyp: `.dotnav`,
`.progress`). Zeigt jederzeit „wo bin ich" und erlaubt gezieltes Hingleiten.

---

## Was NICHT anfassen
- Inhalte/Texte, Formular-Logik, Lightbox, Theme-Toggle, Cookie-/Service-Modal.
- Desktop-Verhalten (>768px) bleibt wie es ist.

## Testmatrix
iPhone Safari, iPhone/Desktop Opera GX, Desktop Safari. Prüfen: (1) durchwischen ohne
Haken, (2) sauberes Einrasten, (3) kein Sprung beim Toolbar-Ein/Ausblenden,
(4) tiefe Rubriken (Kontakt-Formular) voll scrollbar erreichbar.
