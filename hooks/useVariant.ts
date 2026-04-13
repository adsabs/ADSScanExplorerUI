import { useVariantContext } from "../providers/VariantProvider";

function useVariant() {
  return useVariantContext();
}

export default useVariant;
