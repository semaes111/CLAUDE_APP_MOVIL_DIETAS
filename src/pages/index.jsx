import Layout from "./Layout.jsx";

import PatientDashboard from "./PatientDashboard";

import DoctorDashboard from "./DoctorDashboard";

import Home from "./Home";

import PatientAccess from "./PatientAccess";

import MealDetails from "./MealDetails";

import Chat from "./Chat";

import ProfessionalAccess from "./ProfessionalAccess";

import RecipeSuggestions from "./RecipeSuggestions";

import Subscription from "./Subscription";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

import { SubscriptionProvider } from '@/contexts/SubscriptionContext';

const PAGES = {

    PatientDashboard: PatientDashboard,

    DoctorDashboard: DoctorDashboard,

    Home: Home,

    PatientAccess: PatientAccess,

    MealDetails: MealDetails,

    Chat: Chat,

    ProfessionalAccess: ProfessionalAccess,

    RecipeSuggestions: RecipeSuggestions,

    Subscription: Subscription,

}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<PatientDashboard />} />
                
                
                <Route path="/PatientDashboard" element={<PatientDashboard />} />
                
                <Route path="/DoctorDashboard" element={<DoctorDashboard />} />
                
                <Route path="/Home" element={<Home />} />
                
                <Route path="/PatientAccess" element={<PatientAccess />} />
                
                <Route path="/MealDetails" element={<MealDetails />} />
                
                <Route path="/Chat" element={<Chat />} />
                
                <Route path="/ProfessionalAccess" element={<ProfessionalAccess />} />
                
                <Route path="/RecipeSuggestions" element={<RecipeSuggestions />} />

                <Route path="/Subscription" element={<Subscription />} />

                <Route path="/subscription/success" element={<Subscription />} />

                <Route path="/subscription/cancel" element={<Subscription />} />

            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <SubscriptionProvider>
                <PagesContent />
            </SubscriptionProvider>
        </Router>
    );
}