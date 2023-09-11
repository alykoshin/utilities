export type GenericId = string | number

export type GenericDict<K extends GenericId, V> = {
  [id in K]?: V
}
