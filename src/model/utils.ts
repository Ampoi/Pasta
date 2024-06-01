export type Rect = Record<"height" | "width", number>
export type Callback<T> = (value: T) => void