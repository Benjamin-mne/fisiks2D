import { Fisiks2DVector } from "./Fisiks2DVector";

const vectorA = new Fisiks2DVector(5, 3);
const vectorB = new Fisiks2DVector(2, 1);

const sum = Fisiks2DVector.Add(vectorA, vectorB);
const diff = Fisiks2DVector.Difference(vectorA, vectorB);
const scaMul = Fisiks2DVector.ScalarMultiplication(5, vectorA);

console.log(sum, diff, scaMul);
