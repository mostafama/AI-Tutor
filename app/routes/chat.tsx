// Import necessary functions from Remix
import { json, LoaderFunction, ActionFunction } from '@remix-run/node';

const OPENAI_API_KEY = process.env.OPEN_API_KEY; // Corrected to match the .env file

async function runCompletion(messages: string) {
    try {
        const response = await fetch("https://api.openai-proxy.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: "gpt-4",
                messages: [{ role: "user", content: messages }],
            }),
        });

        const data = await response.json();

        if (response.ok && data.choices && data.choices.length > 0) {
            return data.choices[0].message.content;
        } else {
            console.error("Unexpected response format or error:", data);
            return "An error occurred: Unexpected response format or API error.";
        }
    } catch (error) {
        console.error("An error occurred:", error);
        return "An error occurred: " + (error as Error).message;
    }
}

export const loader: LoaderFunction = async ({ request }) => {
    const url = new URL(request.url);
    const text = url.searchParams.get("text") || '';
    const response = await runCompletion(text);
    return json({ response });
};

// Example action function for saving a question and its response
export const action: ActionFunction = async ({ request }) => {
    // Example implementation, adjust based on your actual data model and requirements
    const formData = await request.formData();
    const title = formData.get("title");
    const body = formData.get("body");

    // Validate input
    if (typeof title !== "string" || title.length === 0) {
        return json({ errors: { title: "Title is required" } }, { status: 400 });
    }
    if (typeof body !== "string" || body.length === 0) {
        return json({ errors: { body: "Body is required" } }, { status: 400 });
    }

    // Save the note (implement createNote accordingly)
    // const note = await createNote({
    //     title,
    //     body,
    //     userId: await requireUserId(request), // If authentication is needed
    // });

    // Return a success response or redirect
    return json({ success: true });
};
