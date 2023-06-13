import TripEventsView from '../view/events-view.js';
import SortView from '../view/sort.js';
import EmptyEventsView from '../view/empty-events-view.js';
import EventPresenter from './event-presenter.js';
import { render, remove, RenderPosition } from '../framework/render.js';
import LoadingView from '../view/loading-view.js';
import { SORT_TYPES, UPDATE_TYPES, USER_ACTIONS, FILTER_TYPES, sortByPrice, sortByDuration, sortByDate, filter } from '../utils.js';
import NewEventPresenter from './new-event-presenter';

export default class TripEventsPresenter {
  #rootContainer;
  #eventsModel;
  #filterModel;
  #sortComponent = null;
  #loadingComponent = new LoadingView();
  #isLoading = true;
  #eventsList = new TripEventsView();
  #emptyList = null;
  #eventPresenter = new Map();
  #newEventPresenter;
  #currentSortType = SORT_TYPES.DEFAULT;
  #filterType = FILTER_TYPES.EVERYTHING;

  constructor(rootContainer, eventsModel, filterModel) {
    this.#rootContainer = rootContainer;
    this.#eventsModel = eventsModel;
    this.#filterModel = filterModel;
    this.#newEventPresenter = new NewEventPresenter(this.#eventsList.element, this.#actionHandler);
    this.#eventsModel.addObserver(this.#modelEventHandler);
    this.#filterModel.addObserver(this.#modelEventHandler);
  }

  get offers() {
    return this.#eventsModel.offers;
  }

  get destinations() {
    return this.#eventsModel.destinations;
  }


  init = () => {
    this.#render();
  };

  get events() {
    this.#filterType = this.#filterModel.filter;
    const events = this.#eventsModel.events;
    const filteredEvents = filter[this.#filterType](events);

    switch (this.#currentSortType) {
      case SORT_TYPES.PRICE:
        return filteredEvents.sort(sortByPrice);
      case SORT_TYPES.TIME:
        return filteredEvents.sort(sortByDuration);
      default:
        return filteredEvents.sort(sortByDate);
    }
  }

  createEvent = (callback) => {
    this.#currentSortType = SORT_TYPES.DEFAULT;
    this.#filterModel.setFilter(UPDATE_TYPES.MAJOR, FILTER_TYPES.EVERYTHING);
    this.#newEventPresenter.init(callback);
  };

  #renderEvents = (events) => {
    events.forEach((event) => this.#renderEvent(event));
  };

  #renderEvent = (event) => {
    const eventPresenter = new EventPresenter(this.#eventsList.element,
      this.#actionHandler, this.#switchModeHandler);
    eventPresenter.init(event, this.offers, this.destinations);
    this.#eventPresenter.set(event.id, eventPresenter);
  };

  #actionHandler = (actionType, updateType, update) => {
    switch (actionType) {
      case USER_ACTIONS.UPDATE:
        this.#eventsModel.updateEvent(updateType, update);
        break;
      case USER_ACTIONS.ADD:
        this.#eventsModel.addEventt(updateType, update);
        break;
      case USER_ACTIONS.DELETE:
        this.#eventsModel.deleteEvent(updateType, update);
        break;
      case UPDATE_TYPES.INIT:
        this.#isLoading = false;
        remove(this.#loadingComponent);
        this.#render();
        break;
      default:
        throw new Error(`Action Type ${actionType} is undefined.`);
    }
  };

  #modelEventHandler = (updateType, data) => {
    switch (updateType) {
      case UPDATE_TYPES.PATCH:
        this.#eventPresenter.get(data.id).init(data);
        break;
      case UPDATE_TYPES.MINOR:
        this.#clear();
        this.#render();
        break;
      case UPDATE_TYPES.MAJOR:
        this.#clear({ resetSortType: true });
        this.#render();
        break;
      default:
        throw new Error(`Update Type ${updateType} is undefined.`);
    }
  };

  #sortHandler = (sortType) => {
    if (this.#currentSortType === sortType) {
      return;
    }
    this.#currentSortType = sortType;
    this.#clear();
    this.#render();
  };

  #switchModeHandler = () => {
    this.#newEventPresenter.destroy();
    this.#eventPresenter.forEach((presenter) => presenter.updateView());
  };

  #renderSort = () => {
    if (this.#sortComponent instanceof SortView) {
      remove(this.#sortComponent);
    }
    this.#sortComponent = new SortView(this.#currentSortType);
    render(this.#sortComponent, this.#rootContainer, RenderPosition.AFTERBEGIN);
    this.#sortComponent.setSortHandler(this.#sortHandler);
  };

  #renderEmptyList = () => {
    this.#emptyList = new EmptyEventsView(this.#filterType);
    render(this.#emptyList, this.#rootContainer);
  }

  #render = () => {
    const events = this.events;
    render(this.#eventsList, this.#rootContainer);
    if (this.#isLoading) {
      this.#renderLoading();
      return;
    }

    if (!events.length) {
      this.#renderEmptyList();
      return;
    }
    this.#renderSort();
    this.#renderEvents(events);
  };

  #renderLoading = () => {
    render(this.#loadingComponent, this.#rootContainer);
  };

  #clear = ({ resetSortType = false } = {}) => {
    this.#newEventPresenter.destroy();
    this.#eventPresenter.forEach((presenter) => presenter.destroy());
    this.#eventPresenter.clear();

    remove(this.#sortComponent);
    remove(this.#emptyList);
    remove(this.#loadingComponent);

    if (this.#emptyList) {
      remove(this.#emptyList);
    }

    if (resetSortType) {
      this.#currentSortType = SORT_TYPES.DEFAULT;
    }
  };
}
