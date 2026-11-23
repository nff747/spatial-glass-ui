/**
 * Memory buffer and ring structures for Spatial Glass Ui
 */

export interface MemorySlabDescriptor {
  readonly offset: number;
  readonly byteLength: number;
  readonly isAligned64: boolean;
}

export interface RingSlotMetadata {
  readonly sequence: bigint;
  readonly length: number;
  readonly flags: number;
}
