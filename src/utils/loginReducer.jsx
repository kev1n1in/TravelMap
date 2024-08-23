export const initialState = {
  email: "",
  password: "",
  error: null,
  isLoggedIn: false,
};
export function loginReducer(state, action) {
  switch (action.type) {
    case "SET_FIELD":
      return {
        ...state,
        [action.field]: action.value,
      };
    case "LOGIN":
      if (state.email === "admin@example" && state.password === "password") {
        return {
          ...state,
          isLoggedIn: true,
          error: null,
        };
      } else {
        return {
          isLoggedIn: false,
          error: "帳號或密碼錯誤",
        };
      }
    default:
      return state;
  }
}
