/**
 * AmbientGlow — a static golden bloom framing the screen edges.
 * Pure CSS gradients (fx.css). Fixed, pointer-events: none, sits behind
 * content. Does not track the pointer — there are no cursor-following
 * effects on this site.
 */
export function AmbientGlow() {
  return <div className="fx-layer fx-ambient" aria-hidden="true" />;
}
