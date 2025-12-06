
import React, { useState, useEffect, useRef } from "react";
import { agentSDK } from "@/agents";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User } from "lucide-react";
import MessageBubble from "./MessageBubble";

export default function ChatInterface({ agentName, patientName }) {
    const [conversation, setConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(true);
    const scrollAreaRef = useRef(null);

    useEffect(() => {
        const initializeConversation = async () => {
            try {
                // Obtener datos del paciente desde sessionStorage
                const patientData = JSON.parse(sessionStorage.getItem("patient_data") || "{}");
                
                const conv = await agentSDK.createConversation({
                    agent_name: agentName,
                    metadata: {
                        name: `Conversación con ${patientName}`,
                        patient_id: patientData.id
                    }
                });
                setConversation(conv);
                setMessages(conv.messages || []);
                
                // El mensaje inicial con contexto del paciente ya no es necesario aquí.
                // El contexto se adjuntará a cada mensaje del usuario.
            } catch (error) {
                console.error("Error creating conversation:", error);
            } finally {
                setLoading(false);
            }
        };
        initializeConversation();
    }, [agentName, patientName]);

    useEffect(() => {
        if (!conversation) return;

        const unsubscribe = agentSDK.subscribeToConversation(conversation.id, (data) => {
            setMessages(data.messages);
        });

        return () => unsubscribe();
    }, [conversation]);
    
    useEffect(() => {
        if (scrollAreaRef.current) {
            setTimeout(() => {
                const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
                if(viewport) {
                    viewport.scrollTop = viewport.scrollHeight;
                }
            }, 100);
        }
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || !conversation) return;

        const messageContent = input;
        setInput("");
        
        // Obtener datos del paciente para incluir contexto
        const patientData = JSON.parse(sessionStorage.getItem("patient_data") || "{}");
        
        // Adjuntar el contexto del ID del paciente de forma clara y consistente.
        const contentWithContext = `${messageContent}\n\n[CONTEXTO DEL PACIENTE - ID: ${patientData.id}]`;

        await agentSDK.addMessage(conversation, {
            role: "user",
            content: contentWithContext,
        });
    };

    if (loading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center h-full bg-white rounded-2xl shadow-lg">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                <p className="mt-4 text-gray-600">Iniciando asistente...</p>
            </div>
        );
    }

    // Filtra los mensajes que contienen el contexto del paciente para que no se muestren en la UI.
    const visibleMessages = messages.filter(msg => 
        !msg.content.includes('[CONTEXTO DEL PACIENTE - ID:')
    );

    return (
        <div className="flex-1 flex flex-col h-full bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <header className="p-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                        <Bot className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                        <h2 className="font-bold text-lg text-gray-900">NutriBot</h2>
                        <p className="text-sm text-gray-500">Asistente de Nutrición y Salud Personalizado</p>
                    </div>
                </div>
            </header>
            
            <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                <div className="max-w-4xl mx-auto w-full space-y-4">
                    {visibleMessages.length === 0 && (
                        <div className="text-center py-8">
                            <Bot className="w-16 h-16 text-emerald-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                ¡Hola, {patientName}!
                            </h3>
                            <p className="text-gray-500 mb-4">
                                Soy tu asistente personal de nutrición y salud. Puedo ayudarte con:
                            </p>
                            <div className="bg-emerald-50 rounded-lg p-4 text-left">
                                <ul className="text-sm text-emerald-800 space-y-1">
                                    <li>• Información sobre tu medicación actual</li>
                                    <li>• Detalles sobre tu dieta prescrita</li>
                                    <li>• Seguimiento de tu progreso de peso</li>
                                    <li>• Responder dudas sobre nutrición</li>
                                    <li>• Explicar conceptos de salud</li>
                                </ul>
                            </div>
                            <p className="text-xs text-gray-400 mt-4">
                                Tengo acceso a tu información médica para darte respuestas personalizadas
                            </p>
                        </div>
                    )}
                    {visibleMessages.map((message, index) => (
                        <MessageBubble key={index} message={message} />
                    ))}
                </div>
            </ScrollArea>
            
            <footer className="p-4 border-t border-gray-200 bg-white">
                <form onSubmit={handleSendMessage} className="flex items-center gap-3 max-w-4xl mx-auto">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Pregúntame sobre tu dieta, medicación o progreso..."
                        className="h-12"
                    />
                    <Button type="submit" size="icon" className="h-12 w-12 shrink-0">
                        <Send className="w-5 h-5" />
                    </Button>
                </form>
            </footer>
        </div>
    );
}
