import Head from "next/head";
import useVariant from "../../../hooks/useVariant";

/**
 * Renders metadata.
 */
const Meta = () => {
  const variant = useVariant();
  return (
    <Head>
      <title>{`${variant} Scan Explorer`}</title>
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href={`${process.env.NEXT_PUBLIC_BASE_PATH}/favicon/${
          variant === "ADS" ? "ads" : "scix"
        }-apple-touch-icon.png`}
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href={`${process.env.NEXT_PUBLIC_BASE_PATH}/favicon/${
          variant === "ADS" ? "ads" : "scix"
        }-favicon-16x16.png`}
      />

      <meta name="description" content={`${variant} Scan Explorer`} />
    </Head>
  );
};

export default Meta;
