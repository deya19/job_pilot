import Browserbase from '@browserbasehq/sdk'
import { Stagehand } from '@browserbasehq/stagehand'

export async function createBrowserbaseSession() {
  const bb = new Browserbase({
    apiKey: process.env.BROWSERBASE_API_KEY!,
  })

  return bb.sessions.create({
    projectId: process.env.BROWSERBASE_PROJECT_ID!,
    timeout: 120,
  })
}

export function createStagehand(browserbaseSessionID: string) {
  return new Stagehand({
    env: 'BROWSERBASE',
    apiKey: process.env.BROWSERBASE_API_KEY!,
    projectId: process.env.BROWSERBASE_PROJECT_ID!,
    browserbaseSessionID,
    model: {
      modelName: 'openai/gpt-4o',
      apiKey: process.env.OPENAI_API_KEY!,
    },
    disablePino: true,
  })
}
