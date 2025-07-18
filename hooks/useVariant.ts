function useVariant() {
  return process.env.NEXT_PUBLIC_VARIANT === "SCIX" ? "SciX" : "ADS";
}

export default useVariant;
