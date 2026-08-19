import React, { useState } from 'react';
import styles from './StarRating.module.css';

const StarRating = ({ value, onChange, readOnly = false }) => {
  const [hover, setHover] = useState(0);

  return (
    <div className={styles.starRating}>
      {[...Array(5)].map((_, index) => {
        const ratingValue = index + 1;
        return (
          <label key={index} className={styles.starLabel}>
            <input
              type="radio"
              name="rating"
              value={ratingValue}
              onClick={() => !readOnly && onChange(ratingValue)}
              className={styles.radioInput}
              disabled={readOnly}
            />
            <svg
              className={`${styles.star} ${ratingValue <= (hover || value) ? styles.active : ''}`}
              onMouseEnter={() => !readOnly && setHover(ratingValue)}
              onMouseLeave={() => !readOnly && setHover(0)}
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
          </label>
        );
      })}
    </div>
  );
};

export default StarRating;
