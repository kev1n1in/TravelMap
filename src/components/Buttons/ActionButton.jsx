import PropTypes from "prop-types";
import { motion } from "framer-motion";
import createImg from "./create.png";
import saveImg from "./save.png";

const buttonStyle = {
  width: "50px",
  height: "50px",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: "none",
  backgroundColor: "#fff",
  color: "#fff",
  cursor: "pointer",
  outline: "none",
};

const ActionButton = ({ isCreating, onClick }) => {
  const iconSrc = isCreating ? createImg : saveImg;

  return (
    <motion.button
      style={buttonStyle}
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9, rotate: 15 }}
    >
      <motion.img
        src={iconSrc}
        alt={isCreating ? "Create" : "Save"}
        whileHover={{ rotate: 10 }}
      />
    </motion.button>
  );
};

ActionButton.propTypes = {
  isCreating: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default ActionButton;
