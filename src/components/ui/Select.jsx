import { useId } from "react";
import FieldWrapper from "./FieldWrapper";
import styles from "./Field.module.css";

export default function Select({
  id,
  label,
  hint,
  error,
  required = false,
  placeholder,
  options,
  children,
  className = "",
  fieldClassName = "",
  ...rest
}) {
  const generatedId = useId();
  const selectId = id ?? generatedId;

  return (
    <FieldWrapper
      id={selectId}
      label={label}
      hint={hint}
      error={error}
      required={required}
      className={fieldClassName}
    >
      {({ describedBy, invalid }) => (
        <select
          id={selectId}
          className={[
            styles.control,
            styles.select,
            invalid ? styles.invalid : "",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          required={required}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options
            ? options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))
            : children}
        </select>
      )}
    </FieldWrapper>
  );
}
