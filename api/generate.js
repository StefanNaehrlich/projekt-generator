// This is the backend function that runs on Vercel.
// Vercel automatically detects files in the 'api' directory.
// It securely calls the Google AI API with the secret API key.

// The 'fetch' function is available globally in Vercel's Node.js environment.

// Vercel's handler function signature is different from Netlify's.
// It takes 'request' and 'response' objects, similar to Express.js.
export default async function handler(request, response) {
  // Only allow POST requests.
  if (request.method !== 'POST') {
    response.status(405).send('Method Not Allowed');
    return;
  }

  // Get the secret API key from environment variables.
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    response.status(500).json({ error: 'API key is not configured on the server.' });
    return;
  }

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

  try {
    // The request body from the frontend is already parsed in 'request.body'.
    const requestBody = request.body;

    const googleAiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    
    const responseData = await googleAiResponse.json();

    if (!googleAiResponse.ok) {
        console.error('Google AI API Error:', responseData);
        // Forward the error message from Google's API to the frontend.
        response.status(googleAiResponse.status).json({ error: `Google AI API Error: ${responseData.error.message}` });
        return;
    }
    
    // Extract the text content from the complex response structure.
    const text = responseData.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Send the extracted text back to the frontend.
    response.status(200).json({ text: text });

  } catch (error) {
    console.error('Error in Vercel function:', error);
    response.status(500).json({ error: 'An internal server error occurred.' });
  }
}
