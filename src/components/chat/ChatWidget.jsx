import React, { useState } from 'react';
import { Bot, X, MessageCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import ChatInterface from "./ChatInterface";
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function ChatWidget({ patientName }) {
    const [isOpen, setIsOpen] = useState(false);
    const isMobile = window.innerWidth < 768;

    return (
        <>
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                    <Button
                        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-xl bg-emerald-600 hover:bg-emerald-700 text-white p-0 z-50 transition-transform hover:scale-105"
                        size="icon"
                    >
                        <Bot className="h-8 w-8" />
                        <span className="sr-only">Abrir Asistente</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[85vh] p-0 rounded-t-2xl sm:max-w-md sm:mx-auto sm:right-6 sm:bottom-0 sm:h-[600px] sm:rounded-t-xl border-t border-x border-gray-200 shadow-2xl">
                    <div className="h-full flex flex-col">
                        <div className="flex items-center justify-between p-4 border-b bg-emerald-50/50">
                            <div className="flex items-center gap-2">
                                <Bot className="w-5 h-5 text-emerald-600" />
                                <span className="font-semibold text-gray-800">Asistente NutriMed</span>
                            </div>
                            {/* Close button is handled by Sheet default, but we can add custom header if needed */}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <ChatInterface
                                agentName="nutrimed_assistant"
                                patientName={patientName}
                            />
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </>
    );
}
