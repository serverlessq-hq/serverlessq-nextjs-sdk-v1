import { SlsqDetector } from "./slsq-detector";
import { isProduction } from './utils';
import { NextConfig } from 'next'
import { PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD, PHASE_PRODUCTION_SERVER } from "next/constants";

const watchModePhases = [PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD, PHASE_PRODUCTION_SERVER]

/**
 * Registers the cron/queue detector
 * @param phase Next.js phase to determine if we're in production or not
 */
async function registerDetector(phase: any) {
    const __IS_PROD__ = isProduction(phase);
    const detector = new SlsqDetector(__IS_PROD__);
    await detector.awaitReady();
  
    if(__IS_PROD__) {
      await detector.close();
    }

    return;
}

export const withServerlessQ = (nextConfig: NextConfig) => async (phase: any) => {
  if(watchModePhases.includes(phase)){
        await registerDetector(phase);
      }
  return {
    ...nextConfig,
  }
}