import styled from "styled-components";
import PropTypes from "prop-types";

const StyledButton = styled.button`
  padding: ${(props) => props.padding || "8px 16px"};
  background: ${(props) => props.background || "#007bff"};
  color: ${(props) => props.color || "white"};
  border: none;
  border-radius: ${(props) => props.radius || "4px"};
  font-size: ${(props) => props.fontSize || "16px"};
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background: ${(props) => props.hoverBackground || "#0056b3"};
  }

  &:disabled {
    background: ${(props) => props.disabledBackground || "#ccc"};
    cursor: not-allowed;
  }
`;

const Button = ({ children, type = "button", ...props }) => (
  <StyledButton type={type} {...props}>
    {children}
  </StyledButton>
);

Button.propTypes = {
  children: PropTypes.node,
  type: PropTypes.string,
  padding: PropTypes.string,
  background: PropTypes.string,
  color: PropTypes.string,
  radius: PropTypes.string,
  fontSize: PropTypes.string,
  hoverBackground: PropTypes.string,
  disabledBackground: PropTypes.string,
};
export default Button;
