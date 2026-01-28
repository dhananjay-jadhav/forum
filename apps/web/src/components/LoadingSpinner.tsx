/**
 * Loading Spinner Component
 */

import styles from './LoadingSpinner.module.css';

interface LoadingSpinnerProps {
    size?: 'small' | 'medium' | 'large';
}

export function LoadingSpinner({ size = 'medium' }: Readonly<LoadingSpinnerProps>) {
    return (
        <div className={`${styles.spinner} ${styles[size]}`}>
            <div className={styles.bounce1}></div>
            <div className={styles.bounce2}></div>
            <div className={styles.bounce3}></div>
        </div>
    );
}
