/**
 * Cubic bezier interpolation helper
 */
function bezier(p0, p1, p2, p3, t) {
  const mt = 1 - t;
  return (
    mt * mt * mt * p0 +
    3 * mt * mt * t * p1 +
    3 * mt * t * t * p2 +
    t * t * t * p3
  );
}

/**
 * Calculates (x, y) coordinates along the RN1 corridor SVG curve.
 * ViewBox: 0 0 600 250
 * Curve definition: M 38 195 C 120 180, 110 95, 215 120 S 340 215, 410 125 S 505 80, 565 42
 * Progress ratio: 0.0 (Coyah origin) to 1.0 (Dubréka destination)
 */
export function getPointOnRN1(progressRatio) {
  const tNorm = Math.max(0, Math.min(1, Number(progressRatio) || 0));

  if (tNorm < 0.333) {
    const t = tNorm / 0.333;
    return {
      x: bezier(38, 120, 110, 215, t),
      y: bezier(195, 180, 95, 120, t),
    };
  } else if (tNorm < 0.666) {
    const t = (tNorm - 0.333) / 0.333;
    return {
      x: bezier(215, 320, 340, 410, t),
      y: bezier(120, 145, 215, 125, t),
    };
  } else {
    const t = (tNorm - 0.666) / 0.334;
    return {
      x: bezier(410, 480, 505, 565, t),
      y: bezier(125, 35, 80, 42, t),
    };
  }
}

/**
 * Total length of the RN1 SVG curve for stroke-dashoffset calculations
 */
export const RN1_CORRIDOR_LENGTH = 606;

/**
 * Formats duration between startedAt and now in human-readable form
 */
export function formatDuration(startedAt) {
  if (!startedAt) return "Not available";
  const start = new Date(startedAt);
  if (isNaN(start.getTime())) return "Not available";
  const now = new Date();
  const diffMs = Math.max(0, now - start);
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (diffHrs >= 24) {
    const days = Math.floor(diffHrs / 24);
    const remHrs = diffHrs % 24;
    return `${days}d ${remHrs}h ${diffMins}m`;
  }
  if (diffHrs > 0) {
    return `${diffHrs}h ${diffMins}m`;
  }
  return `${diffMins}m`;
}
