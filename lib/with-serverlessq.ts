import { CronDetector } from "./cron/cron-detector.js";
import { isProduction } from './utils/index.js';
import { NextConfig } from 'next'
import { PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD, PHASE_PRODUCTION_SERVER } from "next/constants";

const watchModePhases = [PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD, PHASE_PRODUCTION_SERVER]

async function registerCron(phase: any) {
    const __IS_PROD__ = isProduction(phase);
    const detector = new CronDetector(__IS_PROD__);
    await detector.awaitReady();
  
    if(__IS_PROD__) {
      await detector.close();
    }

    return;
}

export const withServerlessQ = (nextConfig: NextConfig) => async (phase: any) => {
  if(watchModePhases.includes(phase)){
        await registerCron(phase);
      }
  return {
    ...nextConfig,
  }
}