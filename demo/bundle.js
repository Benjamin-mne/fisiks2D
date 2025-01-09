// src/Fisiks2DVector.ts
var _Fisiks2DVector = class _Fisiks2DVector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  static Add(addent, otherAddent) {
    return new _Fisiks2DVector(addent.x + otherAddent.x, addent.y + otherAddent.y);
  }
  static Difference(minuend, subtrahend) {
    return new _Fisiks2DVector(minuend.x - subtrahend.x, minuend.y - subtrahend.y);
  }
  static ScalarMultiplication(scalar, vector) {
    return new _Fisiks2DVector(scalar * vector.x, scalar * vector.y);
  }
  static Normalize(vector) {
    const magnitude = vector.GetMagnitude();
    return new _Fisiks2DVector(vector.x / magnitude, vector.y / magnitude);
  }
  static Distance(vector, otherVector) {
    const dx = otherVector.x - vector.x;
    const dy = otherVector.y - vector.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  static SquaredDistance(vector, otherVector) {
    const dx = otherVector.x - vector.x;
    const dy = otherVector.y - vector.y;
    return dx * dx + dy * dy;
  }
  static Transform(vector, transform) {
    const relativeVector = new _Fisiks2DVector(
      vector.x - transform.positionX,
      vector.y - transform.positionY
    );
    const rotationVector = new _Fisiks2DVector(
      transform.cos * relativeVector.x - transform.sin * relativeVector.y,
      transform.sin * relativeVector.x + transform.cos * relativeVector.y
    );
    return new _Fisiks2DVector(rotationVector.x + transform.positionX, rotationVector.y + transform.positionY);
  }
  static DotProduct(vector, otherVector) {
    return vector.x * otherVector.x + vector.y * otherVector.y;
  }
  static CrossProduct(vector, otherVector) {
    return vector.x * otherVector.y - vector.y * otherVector.x;
  }
  GetMagnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
  GetSquaredMagnitude() {
    return this.x * this.x + this.y * this.y;
  }
  AreEquals(otherVector) {
    return this.x === otherVector.x && this.y === otherVector.y;
  }
};
_Fisiks2DVector.Zero = new _Fisiks2DVector(0, 0);
var Fisiks2DVector = _Fisiks2DVector;

// src/FisiksAABB.ts
var FisiksAxisAlignedBoundingBox = class {
  constructor(min, max) {
    this.min = min;
    this.max = max;
  }
};

// src/FisiksShape.ts
var ShapeType = /* @__PURE__ */ ((ShapeType2) => {
  ShapeType2[ShapeType2["Box"] = 0] = "Box";
  ShapeType2[ShapeType2["Circle"] = 1] = "Circle";
  return ShapeType2;
})(ShapeType || {});
var FisiksShape = class {
  static DrawCircle(context, position, color, radius) {
    context.beginPath();
    context.arc(position.x, position.y, radius, 0, 2 * Math.PI);
    context.fillStyle = color;
    context.fill();
  }
  static DrawBox(context, position, color, width, height) {
    context.beginPath();
    context.rect(position.x, position.y, width, height);
    context.fillStyle = color;
    context.fill();
  }
  static DrawVertices(context, vertices, color, AABB) {
    for (const vertex of vertices) {
      context.beginPath();
      context.arc(vertex.x, vertex.y, 3, 0, 2 * Math.PI);
      context.fillStyle = color;
      context.fill();
    }
    let AABBVertices = [AABB.max, AABB.min];
    for (const vertex of AABBVertices) {
      context.beginPath();
      context.arc(vertex.x, vertex.y, 3, 0, 2 * Math.PI);
      context.fillStyle = "orange";
      context.fill();
    }
  }
  static DrawPoints(context, points) {
    for (const point of points) {
      context.beginPath();
      context.arc(point.x, point.y, 3, 0, 2 * Math.PI);
      context.fillStyle = "green";
      context.fill();
    }
  }
  static DrawAxis(context, axis, position) {
    context.beginPath();
    context.moveTo(position.x, position.y);
    context.lineTo(position.x + axis.x * 50, position.y + axis.y * 50);
    context.strokeStyle = "red";
    context.lineWidth = 2;
    context.stroke();
  }
  static DrawPolygon(context, vertices, color) {
    if (vertices.length < 3) {
      throw new Error("A polygon needs at least three vertices.");
    }
    context.beginPath();
    context.moveTo(vertices[0].x, vertices[0].y);
    for (let i = 1; i < vertices.length; i++) {
      context.lineTo(vertices[i].x, vertices[i].y);
    }
    context.closePath();
    context.fillStyle = color;
    context.fill();
  }
};

// src/FisiksTransform.ts
var _FisiksTransform = class _FisiksTransform {
  constructor(position, angle) {
    this.positionX = position.x;
    this.positionY = position.y;
    this.sin = Math.sin(angle);
    this.cos = Math.cos(angle);
  }
};
_FisiksTransform.Zero = new _FisiksTransform(Fisiks2DVector.Zero, 0);
var FisiksTransform = _FisiksTransform;

// src/utils/utils.ts
function generateId() {
  const segment = () => Math.random().toString(36).substring(2, 6);
  return `${segment()}-${segment()}-${segment()}-${segment()}`;
}
var Segment = class {
  constructor(pointA, pointB) {
    this.pointA = pointA;
    this.pointB = pointB;
  }
  getDistance() {
    const distance = Fisiks2DVector.Difference(this.pointA, this.pointB);
    return distance;
  }
};

// src/FisiksBody.ts
var FisiksBody = class {
  constructor(context, position) {
    this.id = generateId();
    this.previousPosition = Fisiks2DVector.Zero;
    this.center = Fisiks2DVector.Zero;
    this.color = "white";
    this.linearVelocity = Fisiks2DVector.Zero;
    this.previousVelocity = Fisiks2DVector.Zero;
    this.previousRotation = 0;
    this.rotationalVelocity = Fisiks2DVector.Zero;
    this.angle = 0;
    this.angularVelocity = 0;
    this.inertia = 0;
    this.force = Fisiks2DVector.Zero;
    this.isColliding = false;
    this.area = 0;
    this.density = 0;
    this.mass = 0;
    this.restitution = 0.5;
    this.isStatic = false;
    this.context = context;
    this.position = position;
  }
  setPreviousVelocity(velocity) {
    this.previousVelocity = velocity;
  }
  getPreviousVelocity() {
    return this.previousVelocity;
  }
  setPreviousPosition(position) {
    this.previousPosition = position;
  }
  getPreviousPosition() {
    return this.previousPosition;
  }
  setPreviousRotation(amount) {
    this.previousRotation = amount;
  }
  getPreviousRotation() {
    return this.previousRotation;
  }
  getId() {
    return this.id;
  }
  getContext() {
    return this.context;
  }
  setPosition(position) {
    this.position = position;
  }
  getPosition() {
    return this.position;
  }
  setCenter(center) {
    this.center = center;
  }
  getCenter() {
    return this.center;
  }
  setColor(color) {
    this.color = color;
  }
  getColor() {
    return this.color;
  }
  setArea(area) {
    this.area = area;
  }
  setMass(mass) {
    this.mass = mass;
  }
  getMass() {
    return this.mass;
  }
  setDensity(density) {
    this.density = density;
  }
  setRestitution(restitution) {
    this.restitution = restitution;
  }
  getRestitution() {
    return this.restitution;
  }
  setStatic(condition) {
    this.isStatic = condition;
  }
  getStatic() {
    return this.isStatic;
  }
  setInertia(inertia) {
    this.inertia = inertia;
  }
  getInertia() {
    return this.inertia;
  }
  setLinearVelocity(linearVelocity) {
    this.linearVelocity = linearVelocity;
  }
  getLinearVelocity() {
    return this.linearVelocity;
  }
  setRotationalVelocity(rotationalVelocity) {
    this.rotationalVelocity = this.rotationalVelocity;
  }
  getRotationalVelocity() {
    return this.rotationalVelocity;
  }
  setAngularVelocity(angularVelocity) {
    this.angularVelocity = angularVelocity;
  }
  getAngularVelocity() {
    return this.angularVelocity;
  }
  setAngle(angle) {
    this.angle = angle;
  }
  getAngle() {
    return this.angle;
  }
  setForce(amount) {
    this.force = amount;
  }
  getForce() {
    return this.force;
  }
  Rotate(amount) {
  }
  Draw() {
  }
  Step(time, gravity) {
  }
  Move(amount) {
  }
  MoveTo(position) {
  }
  drawVertices() {
  }
  drawAABB() {
  }
  getAABB() {
    return new Error("Not init.");
  }
  ApplyForce(amount) {
    this.force = amount;
  }
};
var FisiksBodyCircle = class extends FisiksBody {
  constructor(context, position, radius) {
    super(context, position);
    this.radius = radius;
    const AREA_MASS_DENSITY = Math.PI * Math.pow(radius, 2);
    const INERTIA = 0.5 * AREA_MASS_DENSITY * Math.pow(this.radius, 2);
    this.setCenter(position);
    this.setArea(AREA_MASS_DENSITY);
    this.setDensity(AREA_MASS_DENSITY);
    this.setMass(AREA_MASS_DENSITY);
    this.setInertia(INERTIA);
  }
  setPosition(position) {
    super.setPosition(position);
    this.setCenter(position);
  }
  getRadius() {
    return this.radius;
  }
  Draw() {
    const context = this.getContext();
    if (context instanceof CanvasRenderingContext2D) {
      FisiksShape.DrawCircle(context, this.getPosition(), this.getColor(), this.radius);
    } else {
      throw new Error("No context provided.");
    }
  }
  drawVertices() {
    const context = super.getContext();
    if (context instanceof CanvasRenderingContext2D) {
      FisiksShape.DrawPoints(context, [this.getPosition()]);
    } else {
      throw new Error("No context provided.");
    }
  }
  drawAABB() {
    const context = this.getContext();
    const AABB = this.getAABB();
    if (context instanceof CanvasRenderingContext2D) {
      FisiksShape.DrawPoints(context, [AABB.min, AABB.max]);
    } else {
      throw new Error("No context provided.");
    }
  }
  getAABB() {
    let max = new Fisiks2DVector(Number.MIN_VALUE, Number.MIN_VALUE);
    let min = new Fisiks2DVector(Number.MAX_VALUE, Number.MAX_VALUE);
    min = new Fisiks2DVector(
      this.getCenter().x - this.radius,
      this.getCenter().y - this.radius
    );
    max = new Fisiks2DVector(
      this.getCenter().x + this.radius,
      this.getCenter().y + this.radius
    );
    return new FisiksAxisAlignedBoundingBox(min, max);
  }
  MoveTo(position) {
    this.setPosition(position);
    this.setCenter(position);
  }
  Move(amount) {
    const newPosition = Fisiks2DVector.Add(this.getPosition(), amount);
    this.setPosition(newPosition);
    const newCenter = Fisiks2DVector.Add(this.getCenter(), amount);
    this.setCenter(newCenter);
  }
  Step(time, gravity) {
    if (this.getStatic()) return;
    if (this.getMass() === 0) return;
    const gravityEffect = Fisiks2DVector.ScalarMultiplication(time, gravity);
    const newLinearVelocity = Fisiks2DVector.Add(this.getLinearVelocity(), gravityEffect);
    this.setLinearVelocity(newLinearVelocity);
    const newPosition = Fisiks2DVector.Add(this.getPosition(), Fisiks2DVector.ScalarMultiplication(time, this.getLinearVelocity()));
    this.setPosition(newPosition);
    const newCenter = Fisiks2DVector.Add(this.getCenter(), Fisiks2DVector.ScalarMultiplication(time, this.getLinearVelocity()));
    this.setCenter(newCenter);
    const newAngle = this.getAngle() + this.getAngularVelocity() * time;
    this.setAngle(newAngle);
    this.setForce(Fisiks2DVector.Zero);
  }
};
var FisiksBodyBox = class extends FisiksBody {
  constructor(context, position, width, height) {
    super(context, position);
    this.width = 100;
    this.height = 100;
    this.vertices = [];
    this.transformedVertices = [];
    this.width = width;
    this.height = height;
    const CENTER = new Fisiks2DVector(position.x + width / 2, position.y + height / 2);
    const AREA_MASS_DENSITY = width * height;
    this.setCenter(CENTER);
    this.setArea(AREA_MASS_DENSITY);
    this.setMass(AREA_MASS_DENSITY);
    this.setDensity(AREA_MASS_DENSITY);
    const INERTIA = 1 / 12 * this.getMass() * (Math.pow(this.height, 2) + Math.pow(this.width, 2));
    this.setInertia(INERTIA);
    if (this.transformedVertices.length === 0) {
      this.vertices = this.CreateBoxVertices(width, height);
    } else {
      this.vertices = this.transformedVertices;
    }
  }
  getHeight() {
    return this.height;
  }
  getWidth() {
    return this.width;
  }
  getVertices() {
    return this.vertices;
  }
  setPosition(position) {
    super.setPosition(position);
    const newCenter = new Fisiks2DVector(position.x + this.width / 2, position.y + this.height / 2);
    this.setCenter(newCenter);
    const newVertices = this.CreateBoxVertices(this.width, this.height);
    this.vertices = newVertices;
  }
  Draw() {
    const context = this.getContext();
    if (context instanceof CanvasRenderingContext2D) {
      FisiksShape.DrawPolygon(context, this.vertices, this.getColor());
    } else {
      throw new Error("No context provided.");
    }
  }
  drawVertices() {
    const context = this.getContext();
    if (context instanceof CanvasRenderingContext2D) {
      FisiksShape.DrawPoints(context, this.vertices.concat([this.getCenter()]));
    } else {
      throw new Error("No context provided.");
    }
  }
  drawAABB() {
    const context = this.getContext();
    const AABB = this.getAABB();
    if (context instanceof CanvasRenderingContext2D) {
      FisiksShape.DrawPoints(context, [AABB.min, AABB.max]);
    } else {
      throw new Error("No context provided.");
    }
  }
  getAABB() {
    let max = new Fisiks2DVector(Number.MIN_VALUE, Number.MIN_VALUE);
    let min = new Fisiks2DVector(Number.MAX_VALUE, Number.MAX_VALUE);
    this.vertices.forEach((vertex) => {
      if (vertex.x > max.x) {
        max = new Fisiks2DVector(
          vertex.x,
          max.y
        );
      }
      if (vertex.y > max.y) {
        max = new Fisiks2DVector(
          max.x,
          vertex.y
        );
      }
      if (vertex.x < min.x) {
        min = new Fisiks2DVector(
          vertex.x,
          min.y
        );
      }
      if (vertex.y < min.y) {
        min = new Fisiks2DVector(
          min.x,
          vertex.y
        );
      }
    });
    return new FisiksAxisAlignedBoundingBox(min, max);
  }
  CreateBoxVertices(width, height) {
    let vertices = [];
    let left = this.getPosition().x;
    let right = this.getPosition().x + width;
    let bottom = this.getPosition().y + height;
    let top = this.getPosition().y;
    vertices[0] = new Fisiks2DVector(left, top);
    vertices[1] = new Fisiks2DVector(right, top);
    vertices[2] = new Fisiks2DVector(right, bottom);
    vertices[3] = new Fisiks2DVector(left, bottom);
    return vertices;
  }
  GetTranformedVertices() {
    for (let i = 0; i < this.vertices.length; i++) {
      const vertex = this.vertices[i];
      const transform = new FisiksTransform(this.getCenter(), this.getAngle());
      const rotatedVertex = Fisiks2DVector.Transform(vertex, transform);
      this.transformedVertices[i] = rotatedVertex;
    }
    return this.transformedVertices;
  }
  MoveTo(position) {
    this.setPosition(position);
    const newCenter = new Fisiks2DVector(position.x + this.width / 2, position.y + this.height / 2);
    this.setCenter(newCenter);
    this.vertices = this.CreateBoxVertices(this.width, this.height);
  }
  Move(amount) {
    const newPosition = Fisiks2DVector.Add(this.getPosition(), amount);
    this.setPosition(newPosition);
    const newCenter = Fisiks2DVector.Add(this.getCenter(), amount);
    this.setCenter(newCenter);
    for (let i = 0; i < this.vertices.length; i++) {
      this.vertices[i] = Fisiks2DVector.Add(this.vertices[i], amount);
    }
  }
  Rotate(amount) {
    this.setAngle(amount);
    const newVertices = this.GetTranformedVertices();
    this.vertices = newVertices;
    this.setAngle(0);
  }
  Step(time, gravity) {
    if (this.getStatic()) return;
    if (this.getMass() === 0) return;
    const gravityEffect = Fisiks2DVector.ScalarMultiplication(time, gravity);
    const newLinearVelocity = Fisiks2DVector.Add(this.getLinearVelocity(), gravityEffect);
    this.setLinearVelocity(newLinearVelocity);
    const newPosition = Fisiks2DVector.Add(this.getPosition(), Fisiks2DVector.ScalarMultiplication(time, this.getLinearVelocity()));
    this.setPosition(newPosition);
    const newCenter = Fisiks2DVector.Add(this.getCenter(), Fisiks2DVector.ScalarMultiplication(time, this.getLinearVelocity()));
    this.setCenter(newCenter);
    const newAngle = this.getAngle() + this.getAngularVelocity() * time;
    this.setAngle(newAngle);
    for (let i = 0; i < this.vertices.length; i++) {
      this.vertices[i] = Fisiks2DVector.Add(this.vertices[i], Fisiks2DVector.ScalarMultiplication(time, this.getLinearVelocity()));
    }
    this.setForce(Fisiks2DVector.Zero);
  }
};

// src/FisiksBodyController.ts
var keys = {
  a: false,
  s: false,
  d: false,
  w: false
};
document.addEventListener("keydown", (event) => {
  if (event.key in keys) {
    keys[event.key] = true;
  }
});
document.addEventListener("keyup", (event) => {
  if (event.key in keys) {
    keys[event.key] = false;
  }
});
function FisiksBodyController(body, secondsPassed, forceMagnitude = 400) {
  let dx = 0;
  let dy = 0;
  if (keys.a) dx -= 1;
  if (keys.d) dx += 1;
  if (keys.w) dy -= 1;
  if (keys.s) dy += 1;
  if (dx !== 0 || dy !== 0) {
    const forceDirection = Fisiks2DVector.Normalize(new Fisiks2DVector(dx, dy));
    const force = Fisiks2DVector.ScalarMultiplication(forceMagnitude, forceDirection);
    body.ApplyForce(force);
  }
}

// src/FisiksCollisions.ts
var FisiksCollisions = class {
  static BroadPhase(A, B) {
    if (A.max.x <= A.min.x || B.max.x <= A.min.x || A.max.y <= A.min.y || B.max.y <= A.min.y) {
      return false;
    }
    return true;
  }
  static NarrowPashe(BodyA, BodyB) {
    if (BodyA instanceof FisiksBodyCircle && BodyB instanceof FisiksBodyCircle) {
      return this.IntersectCircles(BodyA, BodyB);
    }
    if (BodyA instanceof FisiksBodyBox && BodyB instanceof FisiksBodyBox) {
      return this.IntersectPolygons(BodyA, BodyB);
    }
    if (BodyA instanceof FisiksBodyCircle && BodyB instanceof FisiksBodyBox) {
      return this.IntersectCirclePolygon(BodyA, BodyB);
    }
    if (BodyA instanceof FisiksBodyBox && BodyB instanceof FisiksBodyCircle) {
      return this.IntersectCirclePolygon(BodyB, BodyA);
    }
  }
  static SolveCollision(bodyA, bodyB, normal) {
    let inverseMassA = bodyA.getStatic() ? 0 : 1 / bodyA.getMass();
    let inverseMassB = bodyB.getStatic() ? 0 : 1 / bodyB.getMass();
    let restitution = Math.min(bodyA.getRestitution(), bodyB.getRestitution());
    let relativeVelocity = Fisiks2DVector.Difference(bodyB.getLinearVelocity(), bodyA.getLinearVelocity());
    if (Fisiks2DVector.DotProduct(relativeVelocity, normal) > 0) return;
    let impulseNumerator = -(1 + restitution) * Fisiks2DVector.DotProduct(relativeVelocity, normal);
    let impulseDenominator = inverseMassA + inverseMassB;
    if (impulseDenominator === 0) return;
    let impulseMag = impulseNumerator / impulseDenominator;
    let impulse = Fisiks2DVector.ScalarMultiplication(impulseMag, normal);
    const newLinearVelocityA = Fisiks2DVector.Add(
      bodyA.getLinearVelocity(),
      Fisiks2DVector.ScalarMultiplication(-inverseMassA, impulse)
    );
    const newLinearVelocityB = Fisiks2DVector.Add(
      bodyB.getLinearVelocity(),
      Fisiks2DVector.ScalarMultiplication(inverseMassB, impulse)
    );
    bodyA.setLinearVelocity(newLinearVelocityA);
    bodyB.setLinearVelocity(newLinearVelocityB);
  }
  static SolveCollisionWithRotation(contact) {
    const { bodyA, bodyB, normal } = contact;
    const inverseMassA = bodyA.getStatic() ? 0 : 1 / bodyA.getMass();
    const inverseMassB = bodyB.getStatic() ? 0 : 1 / bodyB.getMass();
    const restitution = Math.min(bodyA.getRestitution(), bodyB.getRestitution());
    const inverseInertiaA = bodyA.getInertia() === 0 ? 0 : 1 / bodyA.getInertia();
    const inverseInertiaB = bodyB.getInertia() === 0 ? 0 : 1 / bodyB.getInertia();
    let contactList = contact.contactPoints;
    let impulseList = [];
    let raList = [];
    let rbList = [];
    for (let i = 0; i < contactList.length; i++) {
      impulseList[i] = Fisiks2DVector.Zero;
      raList[i] = Fisiks2DVector.Zero;
      rbList[i] = Fisiks2DVector.Zero;
    }
    for (let i = 0; i < contactList.length; i++) {
      const ra = Fisiks2DVector.Difference(contactList[i], bodyA.getCenter());
      const rb = Fisiks2DVector.Difference(contactList[i], bodyB.getCenter());
      raList[i] = ra;
      rbList[i] = rb;
      const raPerp = new Fisiks2DVector(-ra.y, ra.x);
      const rbPerp = new Fisiks2DVector(-rb.y, rb.x);
      const angularLinearVelocityA = Fisiks2DVector.ScalarMultiplication(bodyA.getAngularVelocity(), raPerp);
      const angularLinearVelocityB = Fisiks2DVector.ScalarMultiplication(bodyB.getAngularVelocity(), rbPerp);
      const relativeVelocity = Fisiks2DVector.Difference(
        Fisiks2DVector.Add(bodyB.getLinearVelocity(), angularLinearVelocityB),
        Fisiks2DVector.Add(bodyA.getLinearVelocity(), angularLinearVelocityA)
      );
      const contactVelocityMag = Fisiks2DVector.DotProduct(relativeVelocity, normal);
      if (Math.abs(contactVelocityMag) < 1e-4) continue;
      const raPerpDotN = Fisiks2DVector.DotProduct(raPerp, normal);
      const rbPerpDotN = Fisiks2DVector.DotProduct(rbPerp, normal);
      const impulseDenominator = inverseMassA + inverseMassB + raPerpDotN * raPerpDotN * inverseInertiaA + rbPerpDotN * rbPerpDotN * inverseInertiaB;
      const impulseNumerator = -(1 + restitution) * contactVelocityMag;
      const impulseMag = impulseNumerator / impulseDenominator;
      const impulse = Fisiks2DVector.ScalarMultiplication(impulseMag, normal);
      impulseList[i] = impulse;
    }
    for (let i = 0; i < contactList.length; i++) {
      const impulse = impulseList[i];
      const ra = raList[i];
      const rb = rbList[i];
      const newlinearVelocityA = Fisiks2DVector.Add(
        bodyA.getLinearVelocity(),
        Fisiks2DVector.ScalarMultiplication(-inverseMassA, impulse)
      );
      bodyA.setLinearVelocity(newlinearVelocityA);
      const newlinearVelocityB = Fisiks2DVector.Add(
        bodyB.getLinearVelocity(),
        Fisiks2DVector.ScalarMultiplication(inverseMassB, impulse)
      );
      bodyB.setLinearVelocity(newlinearVelocityB);
      const newAngularVelocityA = bodyA.getAngularVelocity() - Fisiks2DVector.CrossProduct(ra, impulse) * inverseInertiaA;
      bodyA.setAngularVelocity(newAngularVelocityA);
      const newAngularVelocityB = bodyB.getAngularVelocity() + Fisiks2DVector.CrossProduct(rb, impulse) * inverseInertiaB;
      bodyB.setAngularVelocity(newAngularVelocityB);
    }
  }
  static SeparateBodies(bodyA, bodyB, normal, depth) {
    if (bodyA.getStatic() && bodyB.getStatic()) {
      return;
    }
    ;
    if (bodyA.getStatic()) {
      bodyB.Move(Fisiks2DVector.ScalarMultiplication(depth, normal));
    } else if (bodyB.getStatic()) {
      bodyA.Move(Fisiks2DVector.ScalarMultiplication(-depth, normal));
    } else {
      let halfDepth = depth / 2;
      bodyA.Move(Fisiks2DVector.ScalarMultiplication(-halfDepth, normal));
      bodyB.Move(Fisiks2DVector.ScalarMultiplication(halfDepth, normal));
    }
  }
  static IntersectPolygons(PolygonA, PolygonB) {
    const verticesA = PolygonA.getVertices();
    const verticesB = PolygonB.getVertices();
    let normal = Fisiks2DVector.Zero;
    let depth = Number.MAX_VALUE;
    for (let i = 0; i < verticesA.length; i++) {
      const VertexA = verticesA[i];
      const VertexB = verticesA[(i + 1) % verticesA.length];
      const edge = Fisiks2DVector.Difference(VertexB, VertexA);
      let axis = new Fisiks2DVector(edge.y * -1, edge.x);
      axis = Fisiks2DVector.Normalize(axis);
      const projA = this.ProjectVertices(verticesA, axis);
      const projB = this.ProjectVertices(verticesB, axis);
      if (projA.min >= projB.max || projB.min >= projA.max) {
        return;
      }
      const axisDepth = Math.min(projB.max - projA.min, projA.max - projB.min);
      if (axisDepth < depth) {
        depth = axisDepth;
        normal = axis;
      }
    }
    for (let i = 0; i < verticesB.length; i++) {
      const VertexA = verticesB[i];
      const VertexB = verticesB[(i + 1) % verticesB.length];
      const edge = Fisiks2DVector.Difference(VertexB, VertexA);
      let axis = new Fisiks2DVector(edge.y * -1, edge.x);
      axis = Fisiks2DVector.Normalize(axis);
      const projA = this.ProjectVertices(verticesA, axis);
      const projB = this.ProjectVertices(verticesB, axis);
      if (projA.min >= projB.max || projB.min >= projA.max) {
        return;
      }
      const axisDepth = Math.min(projB.max - projA.min, projA.max - projB.min);
      if (axisDepth < depth) {
        depth = axisDepth;
        normal = axis;
      }
    }
    let direction = Fisiks2DVector.Difference(PolygonB.getCenter(), PolygonA.getCenter());
    if (Fisiks2DVector.DotProduct(direction, normal) < 0) {
      normal = Fisiks2DVector.ScalarMultiplication(-1, normal);
    }
    const contactPoints = this.FindContactsPointsPolygons(PolygonA, PolygonB);
    const Details = {
      bodyA: PolygonA,
      bodyB: PolygonB,
      normal,
      depth,
      contactPoints
    };
    return Details;
  }
  static FindContactsPointsPolygons(PolygonA, PolygonB) {
    let minDistanceSq = Number.MAX_VALUE;
    let contactPoints = [];
    const epsilon = 1e-6;
    const findContacts = (sourcePolygon, targetPolygon) => {
      for (let i = 0; i < sourcePolygon.getVertices().length; i++) {
        const point = sourcePolygon.getVertices()[i];
        for (let j = 0; j < targetPolygon.getVertices().length; j++) {
          const currentVertex = targetPolygon.getVertices()[j];
          const nextVertex = targetPolygon.getVertices()[(j + 1) % targetPolygon.getVertices().length];
          const segment = new Segment(currentVertex, nextVertex);
          const { contactPoint, distanceSq } = this.FindDistancePointSegment(point, segment);
          if (distanceSq < minDistanceSq - epsilon) {
            minDistanceSq = distanceSq;
            contactPoints = [contactPoint];
          } else if (Math.abs(distanceSq - minDistanceSq) < epsilon) {
            contactPoints.push(contactPoint);
          }
        }
      }
    };
    findContacts(PolygonA, PolygonB);
    findContacts(PolygonB, PolygonA);
    return contactPoints;
  }
  static IntersectCirclePolygon(Circle, Polygon) {
    const vertices = Polygon.getVertices();
    let normal = Fisiks2DVector.Zero;
    let depth = Number.MAX_VALUE;
    let axis = Fisiks2DVector.Zero;
    const epsilon = 1e-6;
    for (let i = 0; i < vertices.length; i++) {
      const VertexA = vertices[i];
      const VertexB = vertices[(i + 1) % vertices.length];
      const edge = Fisiks2DVector.Difference(VertexB, VertexA);
      if (edge.GetMagnitude() < epsilon) continue;
      axis = Fisiks2DVector.Normalize(new Fisiks2DVector(edge.y * -1, edge.x));
      const { min: minA2, max: maxA2 } = this.ProjectVertices(vertices, axis);
      const { min: minB2, max: maxB2 } = this.ProjectCircle(Circle, axis);
      if (minA2 > maxB2 + epsilon || minB2 > maxA2 + epsilon) {
        return;
      }
      const axisDepth2 = Math.min(maxB2 - minA2, maxA2 - minB2);
      if (axisDepth2 < depth) {
        depth = axisDepth2;
        normal = axis;
      }
    }
    const closesPointIndex = this.FindClosesPointIndex(Circle, vertices);
    if (closesPointIndex === -1) return;
    const closesPoint = vertices[closesPointIndex];
    axis = Fisiks2DVector.Normalize(Fisiks2DVector.Difference(closesPoint, Circle.getPosition()));
    const { min: minA, max: maxA } = this.ProjectVertices(vertices, axis);
    const { min: minB, max: maxB } = this.ProjectCircle(Circle, axis);
    if (minA > maxB + epsilon || minB > maxA + epsilon) {
      return;
    }
    const axisDepth = Math.min(maxB - minA, maxA - minB);
    if (axisDepth < depth) {
      depth = axisDepth;
      normal = axis;
    }
    const magnitude = normal.GetMagnitude();
    if (magnitude < epsilon) return;
    depth = depth / magnitude;
    normal = Fisiks2DVector.Normalize(normal);
    if (!Polygon.getCenter() || !Circle.getPosition()) return;
    let direction = Fisiks2DVector.Difference(Polygon.getCenter(), Circle.getPosition());
    if (direction.GetMagnitude() < epsilon) return;
    if (Fisiks2DVector.DotProduct(direction, normal) < 0) {
      normal = Fisiks2DVector.ScalarMultiplication(-1, normal);
    }
    let contact = Fisiks2DVector.Zero;
    let minDistanceSq = Number.MAX_VALUE;
    for (let i = 0; i < vertices.length; i++) {
      const vertexA = vertices[i];
      const vertexB = vertices[(i + 1) % vertices.length];
      const segment = new Segment(vertexA, vertexB);
      const { distanceSq, contactPoint } = this.FindDistancePointSegment(Circle.getPosition(), segment);
      if (distanceSq < minDistanceSq) {
        minDistanceSq = distanceSq;
        contact = contactPoint;
      }
    }
    const Details = {
      bodyA: Circle,
      bodyB: Polygon,
      normal,
      depth,
      contactPoints: [contact]
    };
    return Details;
  }
  static IntersectCircles(CircleA, CircleB) {
    let normal = Fisiks2DVector.Zero;
    let depth = 0;
    let distance = Fisiks2DVector.Distance(CircleA.getPosition(), CircleB.getPosition());
    let radii = CircleA.getRadius() + CircleB.getRadius();
    if (distance >= radii) {
      return;
    }
    let contactPoint = Fisiks2DVector.Add(
      CircleA.getPosition(),
      Fisiks2DVector.ScalarMultiplication(
        CircleA.getRadius(),
        Fisiks2DVector.Normalize(Fisiks2DVector.Difference(CircleB.getPosition(), CircleA.getPosition()))
      )
    );
    normal = Fisiks2DVector.Normalize(Fisiks2DVector.Difference(CircleB.getPosition(), CircleA.getPosition()));
    depth = radii - distance;
    const Details = {
      bodyA: CircleA,
      bodyB: CircleB,
      normal,
      depth,
      contactPoints: [contactPoint]
    };
    return Details;
  }
  static FindDistancePointSegment(point, segment) {
    let contactPoint;
    const AB = Fisiks2DVector.Difference(segment.pointB, segment.pointA);
    const AP = Fisiks2DVector.Difference(point, segment.pointA);
    const ABMagnitudeSquared = AB.GetSquaredMagnitude();
    if (ABMagnitudeSquared === 0) {
      contactPoint = segment.pointA;
    } else {
      const projection = Fisiks2DVector.DotProduct(AP, AB);
      const t = projection / ABMagnitudeSquared;
      if (t <= 0) {
        contactPoint = segment.pointA;
      } else if (t >= 1) {
        contactPoint = segment.pointB;
      } else {
        contactPoint = Fisiks2DVector.Add(
          segment.pointA,
          Fisiks2DVector.ScalarMultiplication(t, AB)
        );
      }
    }
    const distanceSquared = Fisiks2DVector.SquaredDistance(point, contactPoint);
    return {
      distanceSq: distanceSquared,
      contactPoint
    };
  }
  static ProjectVertices(vertices, axis) {
    let min = Number.MAX_VALUE;
    let max = Number.MIN_VALUE;
    for (let i = 0; i < vertices.length; i++) {
      const vertex = vertices[i];
      const projection = Fisiks2DVector.DotProduct(vertex, axis);
      if (projection < min) {
        min = projection;
      }
      if (projection > max) {
        max = projection;
      }
    }
    return { min, max };
  }
  static ProjectCircle(circle, axis) {
    let direction = Fisiks2DVector.Normalize(axis);
    let directionRadius = Fisiks2DVector.ScalarMultiplication(circle.getRadius(), direction);
    let point1 = Fisiks2DVector.Add(circle.getPosition(), directionRadius);
    let point2 = Fisiks2DVector.Difference(circle.getPosition(), directionRadius);
    const min = Math.min(Fisiks2DVector.DotProduct(point1, axis), Fisiks2DVector.DotProduct(point2, axis));
    const max = Math.max(Fisiks2DVector.DotProduct(point1, axis), Fisiks2DVector.DotProduct(point2, axis));
    return { min, max };
  }
  static FindClosesPointIndex(Circle, vertices) {
    let result = -1;
    let minDistance = Number.MAX_VALUE;
    for (let i = 0; i < vertices.length; i++) {
      const vertex = vertices[i];
      const distance = Fisiks2DVector.Distance(vertex, Circle.getPosition());
      if (distance < minDistance) {
        minDistance = distance;
        result = i;
      }
    }
    return result;
  }
};

// src/FisiksCollisionManifold.ts
var FisiksCollisionManifold = class {
  constructor(bodyA, bodyB, normal, depth, contactPoints) {
    this.bodyA = bodyA;
    this.bodyB = bodyB;
    this.normal = normal;
    this.depth = depth;
    this.contactPoints = contactPoints;
  }
};

// src/FisiksDisplay.ts
var FisiksDisplay = class {
  constructor(width, height) {
    this.oldTimeStamp = 0;
    this.bodyList = [];
    this.bodyMap = /* @__PURE__ */ new Map();
    this.gravity = Fisiks2DVector.Zero;
    this.contactList = /* @__PURE__ */ new Set();
    this.showVertices = false;
    this.showAABB = false;
    this.showContactPoints = false;
    this.externalBehaviors = [];
    this.observers = [];
    this.width = width;
    this.height = height;
    this.canvas = document.createElement("canvas");
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    const ctx = this.canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Could not get the 2D context of the canvas.");
    }
    this.context = ctx;
    this.bodyList = [];
    this.bodyMap.clear();
  }
  setShowVertices(value) {
    this.showVertices = value;
  }
  getShowVertices() {
    return this.showVertices;
  }
  setShowAABB(value) {
    this.showAABB = value;
  }
  getShowAABB() {
    return this.showAABB;
  }
  addObserver(observer) {
    this.observers.push(observer);
  }
  removeObserver(observer) {
    const index = this.observers.indexOf(observer);
    if (index >= 0) {
      this.observers.splice(index, 1);
    }
  }
  notifyObservers(body) {
    for (let observer of this.observers) {
      observer.update(body);
    }
  }
  RegisterBehavior(behavior) {
    this.externalBehaviors.push(behavior);
  }
  GetCanvas() {
    return this.canvas;
  }
  GetContext() {
    return this.context;
  }
  AddBody(body) {
    this.bodyList.push(body);
    this.bodyMap.set(body.getId(), body);
  }
  RemoveBody(id2) {
    this.bodyList = this.bodyList.filter((body) => body.getId() !== id2);
    this.bodyMap.delete(id2);
  }
  GetBody(id2) {
    return this.bodyMap.get(id2);
  }
  SetGravity(amount) {
    this.gravity = amount;
  }
  StartGameLoop() {
    requestAnimationFrame(this.GameLoop.bind(this));
  }
  clearContext() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
  GameLoop(timeStamp) {
    const secondsPassed = (timeStamp - this.oldTimeStamp) / 1e3;
    this.oldTimeStamp = timeStamp;
    this.clearContext();
    const iterations = 30;
    const subStepTime = secondsPassed / iterations;
    for (let step = 0; step < iterations; step++) {
      this.UpdateBodies(subStepTime);
      this.RenderBodies();
      this.HandleCollisions();
    }
    requestAnimationFrame(this.GameLoop.bind(this));
  }
  UpdateBodies(subStepTime) {
    for (let body of this.bodyList) {
      for (const behavior of this.externalBehaviors) {
        behavior(body);
      }
      body.Step(subStepTime, this.gravity);
    }
  }
  RenderBodies() {
    for (let body of this.bodyList) {
      body.Draw();
      if (this.getShowVertices() || this.getShowAABB()) {
        const context = body.getContext();
        if (context instanceof CanvasRenderingContext2D) {
          let points = [body.getCenter()];
          const AABB = body.getAABB();
          if (this.getShowAABB() && AABB instanceof FisiksAxisAlignedBoundingBox) {
            points.push(AABB.min);
            points.push(AABB.max);
          }
          FisiksShape.DrawPoints(context, points);
          if (body instanceof FisiksBodyBox) {
            FisiksShape.DrawPoints(context, body.getVertices());
          }
        }
      }
      this.notifyObservers(body);
    }
  }
  HandleCollisions() {
    this.contactList.clear();
    for (let i = 0; i < this.bodyList.length - 1; i++) {
      const bodyA = this.bodyList[i];
      const bodyAAABB = bodyA.getAABB();
      for (let j = i + 1; j < this.bodyList.length; j++) {
        const bodyB = this.bodyList[j];
        const bodyBAABB = bodyB.getAABB();
        if (bodyAAABB instanceof Error || bodyBAABB instanceof Error) continue;
        if (!FisiksCollisions.BroadPhase(bodyAAABB, bodyBAABB)) continue;
        const Details = FisiksCollisions.NarrowPashe(bodyA, bodyB);
        if (Details) {
          const { bodyA: bodyA2, bodyB: bodyB2, normal, depth, contactPoints } = Details;
          const contact = new FisiksCollisionManifold(
            bodyA2,
            bodyB2,
            normal,
            depth,
            contactPoints
          );
          this.contactList.add(contact);
        }
      }
    }
    for (const contact of this.contactList) {
      const { bodyA, bodyB, normal, depth, contactPoints } = contact;
      if (this.showContactPoints) {
        FisiksShape.DrawPoints(this.GetContext(), contactPoints);
      }
      FisiksCollisions.SeparateBodies(bodyA, bodyB, normal, depth);
      FisiksCollisions.SolveCollision(bodyA, bodyB, normal);
    }
  }
};

// src/FisiksObservers.ts
var FisiksBodyObserver = class {
  update(body) {
  }
};
export {
  Fisiks2DVector,
  FisiksBody,
  FisiksBodyBox,
  FisiksBodyCircle,
  FisiksBodyController,
  FisiksBodyObserver,
  FisiksCollisions,
  FisiksDisplay,
  FisiksShape,
  FisiksTransform,
  ShapeType
};
//# sourceMappingURL=bundle.js.map
