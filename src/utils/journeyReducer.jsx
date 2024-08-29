export const initialState = {
  isModalOpen: false,
  modalType: null,
  jourenyData: null,
};

export const modalActionTypes = {
  OPEN_MODAL: "OPEN_MODAL",
  CLOSE_MODAL: "CLOSE_MODAL",
};

export const modalReducer = (state, action) => {
  switch (action.type) {
    case modalActionTypes.OPEN_MODAL:
      return {
        ...state,
        isModalOpen: true,
        modalType: action.payload.modalType,
        jourenyData: action.payload.data,
      };
    case modalActionTypes.CLOSE_MODAL:
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
