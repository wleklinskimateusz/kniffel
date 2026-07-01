/** Each slot lists acceptable face values for one target die (order-independent). */
export type FlexibleTarget = number[][];

export function normalizeSlot(values: number[]): number[] {
  const unique = [...new Set(values.filter((v) => v >= 1 && v <= 6))];
  if (unique.length === 0) return [1];
  return unique.sort((a, b) => a - b);
}

export function normalizeTarget(slots: FlexibleTarget): FlexibleTarget {
  return slots.map(normalizeSlot);
}

export function fixedTarget(values: number[]): FlexibleTarget {
  return values.map((value) => [value]);
}

export function flexibleTargetKey(target: FlexibleTarget): string {
  return normalizeTarget(target)
    .map((slot) => slot.join(','))
    .join('|');
}

export function targetsEqual(a: FlexibleTarget, b: FlexibleTarget): boolean {
  const left = normalizeTarget(a);
  const right = normalizeTarget(b);
  if (left.length !== right.length) return false;
  return left.every(
    (slot, index) =>
      slot.length === right[index].length &&
      slot.every((value, valueIndex) => value === right[index][valueIndex]),
  );
}

export function matchesFlexibleTarget(
  dice: number[],
  target: FlexibleTarget,
): boolean {
  const slots = normalizeTarget(target);
  if (dice.length !== slots.length) return false;
  return assignSlots(dice, slots, 0, new Array(dice.length).fill(false));
}

function assignSlots(
  dice: number[],
  slots: FlexibleTarget,
  slotIndex: number,
  used: boolean[],
): boolean {
  if (slotIndex === slots.length) return true;

  const allowed = slots[slotIndex];
  for (let i = 0; i < dice.length; i++) {
    if (used[i] || !allowed.includes(dice[i])) continue;
    used[i] = true;
    if (assignSlots(dice, slots, slotIndex + 1, used)) return true;
    used[i] = false;
  }
  return false;
}

export function formatSlotDisplay(slot: number[]): string {
  const normalized = normalizeSlot(slot);
  if (normalized.length === 1) return String(normalized[0]);
  return normalized.join('·');
}
