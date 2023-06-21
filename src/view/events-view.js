import { createElement } from '../render';

const createEventsTemplate = () => (
  `<ul class="trip-events__list">
  </ul>`
);

export default class EventsView {
  get Template () {
    return createEventsTemplate;
  }
}
