const vscode = require("vscode");

const fetchOpenAIChat = async (messages) => {
  try {
    const apiKey = vscode.workspace
      .getConfiguration("context-menu-extension")
      .get("apiKey");
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`, // Use configuration setting
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo", // Specify the model you want to use
        messages: messages,
      }),
    });

    if (!response.ok) {
      const errorDetails = await response.json();
      throw new Error(
        `Error ${response.status}: ${response.statusText} - ${errorDetails.error.message}`
      );
    }

    const data = await response.json();
    return data.choices[0].message.content; // Return the assistant's message as a string
  } catch (error) {
    console.error("An error occurred while fetching data from OpenAI:", error);

    // Additional logging can be added here as needed
    throw new Error(`Failed to fetch OpenAI chat completion: ${error.message}`);
  }
};

async function getTechDebt(fileContent) {
  try {
    // Define the messages required for the OpenAI chat
    const messages = [
      {
        role: "system",
        content: `You are an AI expert in identifying technical debt in JavaScript and TypeScript code. 
              When provided with code, analyze it carefully for common tech debt issues, 
              such as poor structure, obsolete patterns, performance issues, and any maintenance challenges. 
              Mark each instance directly in the code using the following inline-comment structure:
              "\n\n/**** Tech Debt **\nExplanation of tech debt\n****/\n\n"
              Always return the complete original file, annotated in place, do not add any additional markup, 
              with explanations for each identified area of tech debt. Maintain the file's original structure, 
              focusing only on inserting relevant tech debt comments where necessary.
              Return only the annotated code without any additional formatting or language markers.`,
      },
      {
        role: "user",
        content: fileContent,
      },
    ];

    // Call the fetchOpenAIChat function with the prepared messages
    const response = await fetchOpenAIChat(messages);

    // Remove any line with "```" in the response
    const cleanedResponse = response
      .split("\n")
      .filter((line) => !line.includes("```"))
      .join("\n");

    // Return the cleaned result as a string
    return cleanedResponse;
  } catch (error) {
    console.error("Error fetching tech debt analysis:", error);
    throw error;
  }
}

module.exports = { fetchOpenAIChat, getTechDebt };
