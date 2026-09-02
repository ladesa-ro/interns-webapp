import { useId } from "react";
import FieldWrapper from "./FieldWrapper";
import styles from "./Field.module.css";

export default function Textarea({
  id,
  label,
  hint,
  error,
  required = false,
  rows = 4,
  className = "",
  fieldClassName = "",
  ...rest
}) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;

  return (
    <FieldWrapper
      id={textareaId}
      label={label}
      hint={hint}
      error={error}
      required={required}
      className={fieldClassName}
    >
      {({ describedBy, invalid }) => (
        <textarea
          id={textareaId}
          rows={rows}
          className={[
            styles.control,
            styles.textarea,
            invalid ? styles.invalid : "",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          required={required}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          {...rest}
        />
      )}
    </FieldWrapper>
  );
}
