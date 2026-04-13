import { createContext, ReactNode, useContext } from "react";

type Variant = "ADS" | "SciX";

const VariantContext = createContext<Variant>("ADS");

export function resolveVariant(host: string | undefined): Variant {
  if (host && host.toLowerCase().includes("scixplorer")) {
    return "SciX";
  }
  return process.env.NEXT_PUBLIC_VARIANT?.toUpperCase() === "SCIX" ? "SciX" : "ADS";
}

interface Props {
  variant: Variant;
  children: ReactNode;
}

export default function VariantProvider({ variant, children }: Props) {
  return (
    <VariantContext.Provider value={variant}>
      {children}
    </VariantContext.Provider>
  );
}

export function useVariantContext(): Variant {
  return useContext(VariantContext);
}
