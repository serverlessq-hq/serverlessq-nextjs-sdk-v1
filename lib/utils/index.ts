import { PHASE_PRODUCTION_BUILD, PHASE_PRODUCTION_SERVER } from "next/constants";

export const isProduction = (phase: any) => [PHASE_PRODUCTION_BUILD, PHASE_PRODUCTION_SERVER].includes(phase);
