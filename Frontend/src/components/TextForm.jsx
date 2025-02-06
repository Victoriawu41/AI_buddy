import TextInput from "./TextInput";

/**
 * TextForm component renders a dynamic form based on the provided `formArray` prop.
 * It maps over each field in `formArray` and renders a `TextInput` component for each one.
 *
 * The button click handler (`clickHandler`) should be provided from the parent component
 * to handle form submission logic.
 *
 * @param {Object[]} formArray - An array of form field objects. Each object should contain:
 *   - name {string} - The name of the field (used in label and id attributes).
 *   - fieldType {string} - The type of the input field (e.g., "text", "password").
 *   - exampleText {string} - Placeholder text for the input field.
 *   - helperText {string} - Helper text displayed below the input field (optional).
 * @param {string} buttonText - The text to display on the submit button.
 * @param {function} clickHandler - The function to handle form submission (passed from the parent).
 *
 * @returns {JSX.Element} The form UI with dynamic input fields and a submit button.
 */
const TextForm = ({ formArray, buttonText, clickHandler }) => {
  return (
    <div>
      <form
        onSubmit={
          //must be handled in parent component
          clickHandler
        }
      >
        {formArray.map((field) => (
          <TextInput
            key={field.name}
            name={field.name}
            fieldType={field.fieldType}
            changeHandler={field.changeHandler}
            exampleText={field.exampleText}
            helperText={field.helperText}
          />
        ))}
        <button type="submit" className="btn btn-primary">
          {buttonText}
        </button>
      </form>
    </div>
  );
};

export default TextForm;
