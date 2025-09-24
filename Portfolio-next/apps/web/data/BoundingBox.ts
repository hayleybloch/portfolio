import { Vector3 } from "three";

export class BoundingBox {
  constructor(
    public min: Vector3,
    public max: Vector3,
  ) { }

  public get size(): Vector3 {
    return this.max.clone().sub(this.min);
  }

  public get center(): Vector3 {
    return this.min.clone().add(this.size.divideScalar(2));
  }

  public diagonal(): number {
    return this.size.length();
  }

  public static fromTouchData(touchData: any): BoundingBox {
    // Create a simple bounding box from touch data
    // This is a placeholder implementation
    const min = new Vector3(-1, -1, -1);
    const max = new Vector3(1, 1, 1);
    return new BoundingBox(min, max);
  }
}
