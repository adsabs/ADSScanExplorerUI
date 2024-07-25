import styles from "./Header.module.css";
import Image from "next/image";
import { Container } from "react-bootstrap";
import useVariant from "../../../hooks/useVariant";

/**
 * Render the header component.
 */
const Header = () => {
  const variant = useVariant();
  return (
    <header className={styles.container}>
      <Container className={styles.titlegroup}>
        <div className={styles.logoContainer}>
          <Image
            className={styles.logo}
            src={`${process.env.NEXT_PUBLIC_BASE_PATH}/assets/${
              variant === "ADS" ? "ads" : "scix"
            }.svg`}
            alt={`${variant === "ADS" ? "ADS" : "SciX"} logotype`}
            width={80}
            height={80}
          />
        </div>
        <p className={styles.titleText}>
          {`${variant === "ADS" ? "ADS" : "SciX"} Scan Explorer`}
        </p>
      </Container>
    </header>
  );
};

export default Header;
