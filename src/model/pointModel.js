import { points } from '../mocks/points';
import { destination } from '../mocks/destinations';

export default class PointModel {
  constructor() {
    this.point = points;
    this.destination = destination;
  }

  getPoints() {
    return this.points;
  }

  getDestination() {
    return this.destination;
  }
}
