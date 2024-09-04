export const initialState = {
  isModalOpen: false,
  modalType: null,
  journeyData: null,
  sortedJourney: [],
};

export const actionTypes = {
  SET_SORTED_JOURNEY: "SET_SORTED_JOURNEY",
  OPEN_MODAL: "OPEN_MODAL",
  CLOSE_MODAL: "CLOSE_MODAL",
};

export const journeyReducer = (state, action) => {
  switch (action.type) {
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
        journeyData: action.payload.data,
      };
    case actionTypes.CLOSE_MODAL:
      return {
        ...state,
        isModalOpen: false,
        modalType: null,
        journeyData: null,
      };
    default:
      return state;
  }
};
