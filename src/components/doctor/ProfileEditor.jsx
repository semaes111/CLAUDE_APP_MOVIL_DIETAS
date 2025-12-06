import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User as UserSDK } from "@/api/entities";
import { UserCog, ArrowLeft, Save } from "lucide-react";

export default function ProfileEditor({ user, onUpdate, onCancel }) {
    const [formData, setFormData] = useState({
        dni: user.dni || "",
        specialization: user.specialization || "",
        license_number: user.license_number || "",
        phone: user.phone || "",
        address: user.address || "",
    });
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await UserSDK.updateMyUserData(formData);
            alert("Perfil actualizado correctamente.");
            onUpdate();
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Error al actualizar el perfil. Inténtelo de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="bg-white/80 backdrop-blur-md shadow-xl border-0">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="icon" onClick={onCancel}>
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <CardTitle className="flex items-center gap-3 text-xl">
                        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                            <UserCog className="w-5 h-5 text-purple-600" />
                        </div>
                        Editar Mi Perfil
                    </CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="dni">DNI</Label>
                            <Input id="dni" value={formData.dni} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Teléfono</Label>
                            <Input id="phone" value={formData.phone} onChange={handleInputChange} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="address">Dirección</Label>
                        <Input id="address" value={formData.address} onChange={handleInputChange} />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="specialization">Especialidad</Label>
                            <Input id="specialization" value={formData.specialization} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="license_number">Número de Colegiado</Label>
                            <Input id="license_number" value={formData.license_number} onChange={handleInputChange} />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-6">
                        <Button type="button" variant="outline" onClick={onCancel}>
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {loading ? "Guardando..." : "Guardar Cambios"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}