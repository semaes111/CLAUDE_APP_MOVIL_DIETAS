/**
 * Agent SDK para el chat con IA
 * Proporciona la interfaz para interactuar con el asistente de nutrición
 */

import { InvokeLLM } from '@/api/integrations';

// Almacén de conversaciones
const conversations = new Map();
const subscribers = new Map();

/**
 * SDK del agente de chat
 */
export const agentSDK = {
  /**
   * Crear una nueva conversación
   */
  async createConversation({ agent_name, metadata = {} }) {
    const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const conversation = {
      id: conversationId,
      agent_name,
      metadata,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    conversations.set(conversationId, conversation);

    return conversation;
  },

  /**
   * Suscribirse a actualizaciones de una conversación
   */
  subscribeToConversation(conversationId, callback) {
    if (!subscribers.has(conversationId)) {
      subscribers.set(conversationId, new Set());
    }
    subscribers.get(conversationId).add(callback);

    // Devolver función de desuscripción
    return () => {
      const subs = subscribers.get(conversationId);
      if (subs) {
        subs.delete(callback);
      }
    };
  },

  /**
   * Notificar a los suscriptores de una conversación
   */
  _notifySubscribers(conversationId) {
    const conversation = conversations.get(conversationId);
    const subs = subscribers.get(conversationId);

    if (conversation && subs) {
      subs.forEach(callback => {
        callback(conversation);
      });
    }
  },

  /**
   * Añadir un mensaje a la conversación
   */
  async addMessage(conversation, message) {
    const conv = conversations.get(conversation.id);

    if (!conv) {
      throw new Error('Conversación no encontrada');
    }

    // Añadir mensaje del usuario
    const userMessage = {
      id: `msg_${Date.now()}`,
      role: message.role,
      content: message.content,
      timestamp: new Date().toISOString()
    };

    conv.messages.push(userMessage);
    conv.updatedAt = new Date().toISOString();

    // Notificar actualización
    this._notifySubscribers(conversation.id);

    // Si es un mensaje del usuario, generar respuesta del asistente
    if (message.role === 'user') {
      await this._generateAssistantResponse(conversation.id);
    }

    return userMessage;
  },

  /**
   * Generar respuesta del asistente usando LLM
   */
  async _generateAssistantResponse(conversationId) {
    const conv = conversations.get(conversationId);

    if (!conv) return;

    // Preparar el contexto para el LLM
    const systemPrompt = `Eres NutriBot, un asistente de nutrición y salud especializado de NutriMed.
Tu objetivo es ayudar a los pacientes con:
- Información sobre su medicación y tratamiento
- Detalles sobre su plan de dieta personalizado
- Seguimiento de su progreso de peso
- Responder dudas sobre nutrición y alimentación saludable
- Explicar conceptos de salud de forma clara y accesible

Reglas importantes:
- Sé empático y profesional
- Usa un tono cercano pero informado
- Si no tienes información específica del paciente, ofrece consejos generales
- Siempre recomienda consultar con el médico para cambios importantes
- Responde en español
- Sé conciso pero completo en tus respuestas`;

    // Construir el historial de mensajes
    const messageHistory = conv.messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    try {
      // Añadir mensaje de "pensando"
      const thinkingMessage = {
        id: `msg_${Date.now()}_thinking`,
        role: 'assistant',
        content: '...',
        isThinking: true,
        timestamp: new Date().toISOString()
      };

      conv.messages.push(thinkingMessage);
      this._notifySubscribers(conversationId);

      // Llamar al LLM
      const response = await InvokeLLM({
        prompt: JSON.stringify(messageHistory),
        system_prompt: systemPrompt,
        response_json_schema: null,
        add_context_from_knowledge_base: true
      });

      // Remover mensaje de "pensando"
      conv.messages = conv.messages.filter(m => !m.isThinking);

      // Añadir respuesta del asistente
      const assistantMessage = {
        id: `msg_${Date.now()}_response`,
        role: 'assistant',
        content: response || 'Lo siento, no pude procesar tu mensaje. Por favor, intenta de nuevo.',
        timestamp: new Date().toISOString()
      };

      conv.messages.push(assistantMessage);
      conv.updatedAt = new Date().toISOString();

      this._notifySubscribers(conversationId);
    } catch (error) {
      console.error('Error generando respuesta:', error);

      // Remover mensaje de "pensando" si existe
      conv.messages = conv.messages.filter(m => !m.isThinking);

      // Añadir mensaje de error
      const errorMessage = {
        id: `msg_${Date.now()}_error`,
        role: 'assistant',
        content: 'Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo más tarde.',
        timestamp: new Date().toISOString(),
        isError: true
      };

      conv.messages.push(errorMessage);
      this._notifySubscribers(conversationId);
    }
  },

  /**
   * Obtener una conversación por ID
   */
  getConversation(conversationId) {
    return conversations.get(conversationId);
  },

  /**
   * Eliminar una conversación
   */
  deleteConversation(conversationId) {
    conversations.delete(conversationId);
    subscribers.delete(conversationId);
  },

  /**
   * Limpiar mensajes de una conversación
   */
  clearConversation(conversationId) {
    const conv = conversations.get(conversationId);
    if (conv) {
      conv.messages = [];
      conv.updatedAt = new Date().toISOString();
      this._notifySubscribers(conversationId);
    }
  }
};

export default agentSDK;
