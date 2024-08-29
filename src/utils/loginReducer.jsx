export const initialState = {
  userId: "",
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
      if (
        state.email === "admin@example.com" &&
        state.password === "password"
      ) {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userId", state.userId);
        return {
          ...state,
          isLoggedIn: true,
          error: null,
        };
      } else {
        return {
          ...state,
          isLoggedIn: false,
          error: "帳號或密碼錯誤",
        };
      }

    case "LOGOUT":
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("userId");
      return {
        ...initialState,
      };
    default:
      return state;
  }
}
