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
    // Create a bounding box from touch data coordinates
    if (!touchData || !touchData.touches || touchData.touches.length === 0) {
      // Default bounding box if no touch data
      const min = new Vector3(-1, -1, -1);
      const max = new Vector3(1, 1, 1);
      return new BoundingBox(min, max);
    }

    // Calculate bounding box from touch coordinates
    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;

    for (const touch of touchData.touches) {
      minX = Math.min(minX, touch.clientX);
      minY = Math.min(minY, touch.clientY);
      maxX = Math.max(maxX, touch.clientX);
      maxY = Math.max(maxY, touch.clientY);
    }

    // Convert 2D screen coordinates to 3D bounding box
    const min = new Vector3(minX, minY, -1);
    const max = new Vector3(maxX, maxY, 1);
    return new BoundingBox(min, max);
  }
}
