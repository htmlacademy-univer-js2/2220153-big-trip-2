import FiltersView from './view/filter-view';
import TripEventsPresenter from './presenter/trip';
import { render, RenderPosition } from './render';

const filterContainer = document.querySelector('.trip-main');
const tripContaier = document.querySelector('.trip-events');
const tripPresenter = new TripEventsPresenter();

render(new FiltersView(), filterContainer.querySelector('.trip-controls__filters'), RenderPosition.BEFOREEND);

tripPresenter.init(tripContaier);
