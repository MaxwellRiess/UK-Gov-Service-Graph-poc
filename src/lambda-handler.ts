import { Handler, Context } from "aws-lambda";
import {
  BedrockAgentCoreGatewayTargetHandler,
  StdioServerAdapterRequestHandler,
} from "@aws/run-mcp-servers-with-aws-lambda";

import path from "path";

const serverParams = {
  command: "node",
  args: [path.join(process.env.LAMBDA_TASK_ROOT ?? ".", "dist/graph-server.mjs")],
};

const requestHandler = new BedrockAgentCoreGatewayTargetHandler(
  new StdioServerAdapterRequestHandler(serverParams)
);

export const handler: Handler = async (
  event: Record<string, unknown>,
  context: Context
): Promise<Record<string, unknown>> => {
  return requestHandler.handle(event, context);
};