import React, { Component } from "react";

/**
 * TextInput component renders a labeled input field with optional placeholder text
 * and helper text below the field. It can be used in forms to dynamically generate input fields.
 *
 * @param {string} name - The name of the input field (used in the label and id attributes).
 * @param {string} fieldType - The type of the input field (e.g., "text", "password").
 * @param {string} [exampleText=""] - The placeholder text displayed in the input field. Defaults to name passed in.
 * @param {string} [helperText=""] - Optional helper text displayed below the input field. If provided, it will be shown in red.
 *
 * @returns {JSX.Element} The input field with a label, optional placeholder, and helper text if provided.
 */
const TextInput = ({
  name,
  fieldType,
  changeHandler,
  exampleText = "",
  helperText = "",
}) => {
  return (
    <div>
      <label htmlFor={name}>{name}</label>
      <input
        className="form-control"
        type={fieldType}
        placeholder={exampleText || name}
        id={name}
        onChange={changeHandler}
        required
      ></input>
      {helperText && <small style={{ color: "red" }}>{helperText}</small>}
    </div>
  );
};

export default TextInput;
