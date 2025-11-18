export interface Topic {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  iconColor: string;
  webhookUrl: string;
}

export async function sendTopicWebhook(topic: Topic, userId: string) {
  try {
    const response = await fetch(topic.webhookUrl, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify({
        userId,
        topic: topic.id,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error(`Webhook call failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error calling topic webhook:", error);
    throw error;
  }
}
