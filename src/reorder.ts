export function moveById<T extends { id: string }>(
  list: T[],
  itemId: string,
  beforeId: string | null,
): T[] {
  const from = list.findIndex((item) => item.id === itemId);
  if (from < 0) return list;
  if (beforeId === itemId) return list;

  const next = list.slice();
  const [item] = next.splice(from, 1);
  if (beforeId === null) {
    next.push(item);
    return next;
  }

  const to = next.findIndex((entry) => entry.id === beforeId);
  if (to < 0) {
    next.push(item);
    return next;
  }
  next.splice(to, 0, item);
  return next;
}

export function moveBetween<T extends { id: string }>(
  fromList: T[],
  toList: T[],
  itemId: string,
  beforeId: string | null,
): { from: T[]; to: T[] } {
  const fromIndex = fromList.findIndex((item) => item.id === itemId);
  if (fromIndex < 0) return { from: fromList, to: toList };

  const item = fromList[fromIndex];
  const from = fromList.filter((entry) => entry.id !== itemId);
  const destination = toList.filter((entry) => entry.id !== itemId);
  if (beforeId === null) return { from, to: [...destination, item] };

  const insertAt = destination.findIndex((entry) => entry.id === beforeId);
  if (insertAt < 0) return { from, to: [...destination, item] };

  const to = destination.slice();
  to.splice(insertAt, 0, item);
  return { from, to };
}

export const DELETE_OUTSIDE_FRACTION = 0.3;

type Rect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

function overlapArea(a: Rect, b: Rect): number {
  const width =
    Math.min(a.left + a.width, b.left + b.width) - Math.max(a.left, b.left);
  const height =
    Math.min(a.top + a.height, b.top + b.height) - Math.max(a.top, b.top);
  if (width <= 0 || height <= 0) return 0;
  return width * height;
}

export function isCardDeletable(card: Rect, frame: Rect): boolean {
  const area = card.width * card.height;
  if (area <= 0) return false;
  return 1 - overlapArea(card, frame) / area >= DELETE_OUTSIDE_FRACTION;
}
