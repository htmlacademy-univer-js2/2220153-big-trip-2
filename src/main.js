import TripEventsPresenter from './presenter/trip';
import MenuView from './view/menu';
import PointsModel from './model/point-model';
import TripInfoView from './view/trip-info-view';
import NewEventButtonView from './view/new-event-btn-view';
import FilterPresenter from './presenter/filter-presenter.js';
import FilterModel from './model/filter-model';
import { render, RenderPosition } from './framework/render';
import EventsApiService from './events-api-service.js';

const AUTHORIZATION = 'Basic by2t8unK3gCMhlK';
const END_POINT = 'https://18.ecmascript.pages.academy/big-trip';

const headerElement = document.querySelector('.page-header');
const mainElement = document.querySelector('.page-main');

const tripMainElement = document.querySelector('.trip-main');
const navigationElement = headerElement.querySelector('.trip-controls__navigation');
const filtersElement = headerElement.querySelector('.trip-controls__filters');
const contentElement = mainElement.querySelector('.trip-events');
const filterModel = new FilterModel();
const eventsModel = new PointsModel(new EventsApiService(END_POINT, AUTHORIZATION));
const routePresenter = new TripEventsPresenter(contentElement, eventsModel, filterModel);
const filterPresenter = new FilterPresenter(filtersElement, filterModel, eventsModel);
const newEventButtonComponent = new NewEventButtonView();


const closeNewEventFormHandler = () => {
  newEventButtonComponent.element.disabled = false;
};

const openNewEventFormHandler = () => {
  routePresenter.createEvent(closeNewEventFormHandler);
  newEventButtonComponent.element.disabled = true;
};

render(newEventButtonComponent, tripMainElement);
newEventButtonComponent.setClickHandler(openNewEventFormHandler);

filterPresenter.init();
routePresenter.init();
eventsModel.init()
  .finally(() => {
    render(newEventButtonComponent, tripMainElement);
    newEventButtonComponent.setClickHandler(openNewEventFormHandler);
  });
render(new MenuView(), navigationElement);
render(new TripInfoView(), tripMainElement, RenderPosition.AFTERBEGIN);
