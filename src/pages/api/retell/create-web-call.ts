import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const apiKey = process.env.RETELL_API_KEY;
    const agentId = process.env.RETELL_AGENT_ID;

    if (!apiKey) {
      console.error('RETELL_API_KEY is not configured');
      return res.status(500).json({ error: 'RETELL_API_KEY is not configured' });
    }

    if (!agentId) {
      console.error('RETELL_AGENT_ID is not configured');
      return res.status(500).json({ error: 'RETELL_AGENT_ID is not configured' });
    }

    console.log('Creating web call with agent:', agentId);

    // Create a web call using Retell API
    const response = await fetch('https://api.retellai.com/v2/create-web-call', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        agent_id: agentId,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Retell API error:', response.status, errorText);
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText };
      }
      return res.status(response.status).json(errorData);
    }

    const data = await response.json();
    console.log('Web call created successfully:', data);
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error creating web call:', error);
    res.status(500).json({ error: 'Failed to create web call', details: error instanceof Error ? error.message : String(error) });
  }
}
