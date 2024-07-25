function useVariant() {
  console.log(process.env.NEXT_PUBLIC_VARIANT);
  return process.env.NEXT_PUBLIC_VARIANT === "SCIX" ? "SciX" : "ADS";
}

export default useVariant;
