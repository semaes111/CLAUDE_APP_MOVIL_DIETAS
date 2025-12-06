import express from 'express';

const router = express.Router();

// Mock database for messages
let messages = [];

// Get chat history
router.get('/:conversationId', (req, res) => {
    // In a real app, fetch from DB
    res.json({ messages });
});

// Send message
router.post('/', (req, res) => {
    const { message, conversationId, role } = req.body;

    const newMessage = {
        id: Date.now().toString(),
        conversationId,
        role: role || 'user',
        content: message,
        timestamp: new Date().toISOString()
    };

    messages.push(newMessage);

    // Simulate AI response
    setTimeout(() => {
        const aiResponse = {
            id: (Date.now() + 1).toString(),
            conversationId,
            role: 'assistant',
            content: `Recibido: "${message}". Como asistente de NutriMed, estoy aquí para ayudarte.`,
            timestamp: new Date().toISOString()
        };
        messages.push(aiResponse);
    }, 1000);

    res.status(201).json(newMessage);
});

export default router;
