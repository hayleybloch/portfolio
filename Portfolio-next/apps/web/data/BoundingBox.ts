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
}
