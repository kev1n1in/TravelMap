import { useEffect, useReducer } from "react";
import { useNavigate } from "react-router-dom";
import { initialState, loginReducer } from "../../utils/loginReducer";
import styled from "styled-components";

const Login = () => {
  const [state, dispatch] = useReducer(loginReducer, initialState);
  const { userId, email, password, error, isLoggedIn } = state;
  const navigate = useNavigate();

  const handleInputChange = (event) => {
    dispatch({
      type: "SET_FIELD",
      field: event.target.name,
      value: event.target.value,
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    dispatch({ type: "LOGIN" });
  };

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/home");
    }
  }, [isLoggedIn, navigate]);

  return (
    <Container onSubmit={handleSubmit}>
      <FieldWrapper>
        <Label htmlFor="userId">使用者 ID：</Label>
        <Input
          id="userId"
          name="userId"
          type="text"
          value={userId}
          onChange={handleInputChange}
          required
        />
      </FieldWrapper>
      <FieldWrapper>
        <Label htmlFor="email">帳號：</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={email}
          onChange={handleInputChange}
          required
        />
      </FieldWrapper>
      <FieldWrapper>
        <Label htmlFor="password">密碼：</Label>
        <Input
          id="password"
          name="password"
          type="password"
          value={password}
          onChange={handleInputChange}
          required
        />
      </FieldWrapper>
      <Button type="submit">登入</Button>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {isLoggedIn && <SuccessMessage>登入成功！</SuccessMessage>}
    </Container>
  );
};

const Container = styled.form``;
const Input = styled.input``;
const Button = styled.button``;
const Label = styled.label``;
const FieldWrapper = styled.div``;
const ErrorMessage = styled.p``;
const SuccessMessage = styled.p``;

export default Login;
