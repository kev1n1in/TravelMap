export const initialState = {
  isModalOpen: false,
  modalType: null,
  jourenyData: null,
  polylinePath: [],
  sortedJourney: [],
};

export const actionTypes = {
  SET_POLYLINE_PATH: "SET_POLYLINE_PATH",
  SET_SORTED_JOURNEY: "SET_SORTED_JOURNEY",
  OPEN_MODAL: "OPEN_MODAL",
  CLOSE_MODAL: "CLOSE_MODAL",
};

export const journeyReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_POLYLINE_PATH:
      return {
        ...state,
        polylinePath: action.payload,
      };
    case actionTypes.SET_SORTED_JOURNEY:
      return {
        ...state,
        sortedJourney: action.payload,
      };
    case actionTypes.OPEN_MODAL:
      return {
        ...state,
        isModalOpen: true,
        modalType: action.payload.modalType,
        jourenyData: action.payload.data,
      };
    case actionTypes.CLOSE_MODAL:
      return {
        ...state,
        isModalOpen: false,
        modalType: null,
        jourenyData: null,
      };
    default:
      return state;
  }
};
