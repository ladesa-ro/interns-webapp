import { useId } from "react";
import FieldWrapper from "./FieldWrapper";
import styles from "./Field.module.css";

export default function Input({
  id,
  label,
  hint,
  error,
  required = false,
  className = "",
  fieldClassName = "",
  ...rest
}) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <FieldWrapper
      id={inputId}
      label={label}
      hint={hint}
      error={error}
      required={required}
      className={fieldClassName}
    >
      {({ describedBy, invalid }) => (
        <input
          id={inputId}
          className={[styles.control, invalid ? styles.invalid : "", className]
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
