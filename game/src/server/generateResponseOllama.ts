import ollama from "ollama";
import { CONVO_MODEL } from "./workflow.conversation";
import { sleep } from "@livestack/core";

export async function generateResponseOllama(prompt: string) {
  try {
    const response = await ollama.chat({
      options: {
        temperature: 0.8,
      },
      stream: true,
      model: CONVO_MODEL,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });
    let message = "";
    // process.stdout.write("Response:  ");
    console.log("Response:  ");
    for await (const part of response) {
      process.stdout.write(
        part.message.content.replace("\n", " ").replace("\r", " ")
      );
      message += part.message.content;
    }
    // erase all of what was written
    // Move the cursor to the beginning of the line
    process.stdout.write("\r");
    // process.stdout.write("\r\n");
    // Clear the entire line
    process.stdout.write("\x1b[2K");
    return message;
  } catch (e) {
    console.log(e);
    await sleep(200);
    return null;
  }
}
