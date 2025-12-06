import React, { useState, useEffect } from "react";
import ChatInterface from "../components/chat/ChatInterface";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function ChatPage() {
    const navigate = useNavigate();
    const [patientData, setPatientData] = useState(null);

    useEffect(() => {
        const storedData = sessionStorage.getItem("patient_data");
        if (storedData) {
            setPatientData(JSON.parse(storedData));
        } else {
            navigate(createPageUrl("Home"));
        }
    }, [navigate]);

    if (!patientData) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
            </div>
        );
    }

    return (
        <div className="h-full p-4 md:p-8 flex flex-col">
            <ChatInterface 
                agentName="nutrimed_assistant"
                patientName={patientData.full_name}
            />
        </div>
    );
}