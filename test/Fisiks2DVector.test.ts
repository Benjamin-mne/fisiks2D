import { describe, it, expect } from 'vitest';
import { Fisiks2DVector } from '../src/Fisiks2DVector';

describe('Fisiks2DVector', () => {
  it('should create a vector with correct x and y values', () => {
    const vector = new Fisiks2DVector(1, 2);
    expect(vector.x).toBe(1);
    expect(vector.y).toBe(2);
  });

  it('should return the zero vector', () => {
    expect(Fisiks2DVector.Zero.x).toBe(0);
    expect(Fisiks2DVector.Zero.y).toBe(0);
  });

  it('should add two vectors correctly', () => {
    const v1 = new Fisiks2DVector(1, 2);
    const v2 = new Fisiks2DVector(3, 4);
    const result = Fisiks2DVector.Add(v1, v2);
    expect(result.x).toBe(4);
    expect(result.y).toBe(6);
  });

  it('should calculate the difference of two vectors', () => {
    const v1 = new Fisiks2DVector(5, 7);
    const v2 = new Fisiks2DVector(2, 4);
    const result = Fisiks2DVector.Difference(v1, v2);
    expect(result.x).toBe(3);
    expect(result.y).toBe(3);
  });

  it('should calculate scalar multiplication', () => {
    const vector = new Fisiks2DVector(2, 3);
    const result = Fisiks2DVector.ScalarMultiplication(3, vector);
    expect(result.x).toBe(6);
    expect(result.y).toBe(9);
  });

  it('should normalize a vector', () => {
    const vector = new Fisiks2DVector(3, 4);
    const result = Fisiks2DVector.Normalize(vector);
    expect(result.x).toBeCloseTo(0.6);
    expect(result.y).toBeCloseTo(0.8);
  });

  it('should calculate the distance between two vectors', () => {
    const v1 = new Fisiks2DVector(1, 1);
    const v2 = new Fisiks2DVector(4, 5);
    const distance = Fisiks2DVector.Distance(v1, v2);
    expect(distance).toBeCloseTo(5);
  });

  it('should calculate the dot product of two vectors', () => {
    const v1 = new Fisiks2DVector(1, 2);
    const v2 = new Fisiks2DVector(3, 4);
    const dotProduct = Fisiks2DVector.DotProduct(v1, v2);
    expect(dotProduct).toBe(11);
  });

  it('should calculate the cross product of two vectors', () => {
    const v1 = new Fisiks2DVector(1, 2);
    const v2 = new Fisiks2DVector(3, 4);
    const crossProduct = Fisiks2DVector.CrossProduct(v1, v2);
    expect(crossProduct).toBe(-2);
  });

  it('should calculate the magnitude of a vector', () => {
    const vector = new Fisiks2DVector(3, 4);
    const magnitude = vector.GetMagnitude();
    expect(magnitude).toBe(5);
  });

  it('should compare two vectors for equality', () => {
    const v1 = new Fisiks2DVector(1, 1);
    const v2 = new Fisiks2DVector(1, 1);
    const v3 = new Fisiks2DVector(2, 2);
    expect(v1.AreEquals(v2)).toBe(true);
    expect(v1.AreEquals(v3)).toBe(false);
  });
});
