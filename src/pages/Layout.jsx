

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Heart, User, UserCheck, Home, Bot } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { User as UserSDK } from "@/api/entities";

const patientNav = [
  { title: "Dashboard", url: createPageUrl("PatientDashboard"), icon: Home },
  { title: "Asistente IA", url: createPageUrl("Chat"), icon: Bot },
];

const doctorNav = [
  { title: "Dashboard", url: createPageUrl("DoctorDashboard"), icon: Home },
];

import ChatWidget from "@/components/chat/ChatWidget";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [userType, setUserType] = React.useState(null);
  const [patientName, setPatientName] = React.useState("");

  React.useEffect(() => {
    if (currentPageName?.includes("Patient") || currentPageName === "Chat") {
      setUserType("patient");
      const data = sessionStorage.getItem("patient_data");
      if (data) {
        const parsed = JSON.parse(data);
        setPatientName(parsed.full_name || "Paciente");
      }
    } else if (currentPageName?.includes("Doctor")) {
      setUserType("doctor");
    }
  }, [currentPageName]);

  const handleLogout = async () => {
    if (userType === 'doctor') {
      await UserSDK.logout();
    }
    // Para ambos casos, limpiar sessionStorage y redirigir a Home
    sessionStorage.removeItem("patient_data");
    window.location.href = createPageUrl("Home");
  };

  const navigationItems = userType === "patient" ? patientNav : doctorNav;
  const gradientClass = userType === "patient"
    ? "from-emerald-50 to-blue-50"
    : "from-blue-50 to-indigo-50";
  const iconColor = userType === "patient" ? "text-emerald-600" : "text-blue-600";

  // No mostrar layout en la página de Home
  if (currentPageName === "Home") {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <div className={`min-h-screen flex w-full bg-gradient-to-br ${gradientClass}`}>
        <Sidebar className="border-r border-white/20 bg-white/80 backdrop-blur-md">
          <SidebarHeader className="border-b border-gray-100 p-6">
            <Link to={createPageUrl("Home")} className="flex items-center gap-3">
              <div className={`w-10 h-10 bg-gradient-to-r ${userType === "patient" ? "from-emerald-500 to-teal-500" : "from-blue-500 to-indigo-500"} rounded-xl flex items-center justify-center shadow-lg`}>
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-lg">NutriMed</h2>
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  {userType === "patient" ? "Portal Paciente" : "Portal Médico"}
                </p>
              </div>
            </Link>
          </SidebarHeader>

          <SidebarContent className="p-4">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        className={`hover:bg-white/50 rounded-xl mb-2 transition-all duration-200 ${location.pathname === item.url ? 'bg-white shadow-md' : ''
                          }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                          <item.icon className={`w-5 h-5 ${iconColor}`} />
                          <span className="font-medium text-gray-700">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-gray-100 p-4">
            <div className="flex items-center gap-3 p-3 bg-white/50 rounded-xl">
              <div className={`w-8 h-8 ${userType === "patient" ? "bg-emerald-100" : "bg-blue-100"} rounded-full flex items-center justify-center`}>
                {userType === "patient" ? (
                  <User className={`w-4 h-4 ${iconColor}`} />
                ) : (
                  <UserCheck className={`w-4 h-4 ${iconColor}`} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm truncate">
                  {userType === "patient" ? "Paciente" : "Profesional"}
                </p>
                <button
                  onClick={handleLogout}
                  className="text-xs text-gray-500 hover:text-red-600 transition-colors"
                >
                  Cerrar sesión
                </button>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col relative">
          <header className="bg-white/60 backdrop-blur-md border-b border-white/20 px-6 py-4 md:hidden">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-white/50 p-2 rounded-lg transition-colors duration-200" />
              <h1 className="text-xl font-bold text-gray-900">NutriMed</h1>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            {children}
          </div>

          {userType === "patient" && (
            <ChatWidget patientName={patientName} />
          )}
        </main>
      </div>
    </SidebarProvider>
  );
}

