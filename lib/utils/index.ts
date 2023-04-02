import { PHASE_PRODUCTION_BUILD, PHASE_PRODUCTION_SERVER } from "next/constants";
import { IS_VERCEL, LOCAL_DEVELOPMENT_ERROR, VERCEL_URL } from "./constants";
import { extractApiRoute } from "./sanitize-input";

export const isProduction = (phase: any) => [PHASE_PRODUCTION_BUILD, PHASE_PRODUCTION_SERVER].includes(phase);

export const buildCronTarget = (localTarget?: string) => {
    if (!IS_VERCEL) {
      if (!localTarget) {
        throw new Error(LOCAL_DEVELOPMENT_ERROR)
      }
      return localTarget
    } 
    return `https://${VERCEL_URL}/${extractApiRoute(__filename)}`
  }