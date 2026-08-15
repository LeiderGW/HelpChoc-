import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Shield, Edit2, Save, X, Camera } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/common/Button';
import { toast } from 'sonner';

const ProfilePage: React.FC = () => {
  const { appUser, user, updateUser, signOut } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: appUser?.full_name || '',
    phone: appUser?.phone || '',
  });
  const [loading, setLoading] = useState(false);

  if (!appUser || !user) {
    navigate('/login');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateUser(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
            <div className="flex items-center">
              <div className="relative">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                  <User className="w-10 h-10" />
                </div>
                <button className="absolute bottom-0 right-0 bg-white rounded-full p-1 text-blue-600 hover:bg-gray-100 transition-colors">
                  <Camera size={16} />
                </button>
              </div>
              <div className="ml-4">
                <h2 className="text-xl font-bold">{appUser.full_name}</h2>
                <p className="text-white/80 text-sm">{appUser.email}</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre completo
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button type="submit" loading={loading} className="flex-1">
                    <Save className="mr-2" size={16} />
                    Guardar cambios
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                {/* Profile Info */}
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <User className="text-gray-400 mt-0.5" size={18} />
                    <div>
                      <p className="text-sm text-gray-500">Nombre completo</p>
                      <p className="font-medium">{appUser.full_name}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Mail className="text-gray-400 mt-0.5" size={18} />
                    <div>
                      <p className="text-sm text-gray-500">Correo electrónico</p>
                      <p className="font-medium">{appUser.email}</p>
                    </div>
                  </div>

                  {appUser.phone && (
                    <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Phone className="text-gray-400 mt-0.5" size={18} />
                      <div>
                        <p className="text-sm text-gray-500">Teléfono</p>
                        <p className="font-medium">{appUser.phone}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Shield className="text-gray-400 mt-0.5" size={18} />
                    <div>
                      <p className="text-sm text-gray-500">Rol</p>
                      <p className="font-medium capitalize">{appUser.role}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                  <Button onClick={() => setIsEditing(true)} className="flex-1">
                    <Edit2 className="mr-2" size={16} />
                    Editar perfil
                  </Button>
                  <Button
                    variant="danger"
                    onClick={handleSignOut}
                    className="flex-1"
                  >
                    Cerrar sesión
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;