export type Tuple<TItem, TLength extends number> = [TItem, ...TItem[]] & { length: TLength };
export interface Point2D{
  x: number;
  y: number
}

export enum PhotoGrid{
  VERTICAL = 'VERTICAL',
  HORIZONTAL = 'HORIZONTAL'
}