/**** Tech Debt **
The API key is hard-coded in the function. It is recommended to securely manage API keys, possibly using environment variables.
****/
const fetchOpenAIChat = async (messages) => {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer sk-bOQ573PYHhuZFIscVuhAACuRa6TJxCF36IAbuqcfEcT3BlbkFJxmk57F-14LH1ZoG6SJU7WZi6IPKql8Mn3u-vaom3AA` // Replace with your OpenAI API key
        },
        body: JSON.stringify({
            model: 'gpt-3.5-turbo', // Specify the model you want to use
            messages: messages
        })
    });

    if (!response.ok) {
        throw new Error('Network response was not ok');
    }

    const data = await response.json();
    return data.choices[0].message.content; // Return the assistant's message as a string
};

async function getTechDebt(fileContent) {
    try {
      // Define the messages required for the OpenAI chat
      const messages = [
        {
          "role": "system",
        },
        {
          "role": "user",
          "content": fileContent
        }
      ];
  
      // Call the fetchOpenAIChat function with the prepared messages
      const response = await fetchOpenAIChat(messages);
  
      // Return the result as a string
      return response;
    } catch (error) {
      console.error('Error fetching tech debt analysis:', error);
      throw error;
    }
}

module.exports = { fetchOpenAIChat, getTechDebt };