'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface Notification {
  id: string;
  user_id: string;
  message: string;
  read: boolean;
  created_at: string;
}

export default function NotificationsPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        const id = session.session?.user?.id || null;
        setUserId(id);
        
        if (id) {
          setLoading(true);
          const { data: notificationsData, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', id)
            .order('created_at', { ascending: false });
          
          if (error) {
            setError(error.message);
          } else {
            setNotifications(notificationsData || []);
          }
        }
      } catch (error) {
        console.error('Error loading notifications:', error);
        setError('Erro ao carregar notificações');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (!error) {
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === notificationId 
              ? { ...notification, read: true }
              : notification
          )
        );
      }
    } catch (err) {
      console.error('Erro ao marcar notificação como lida:', err);
    }
  };

  const markAllAsRead = async () => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false);

      if (!error) {
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, read: true }))
        );
      }
    } catch (err) {
      console.error('Erro ao marcar todas como lidas:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando notificações...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">Erro ao carregar notificações</div>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Notificações</h1>
        {notifications.some(n => !n.read) && (
          <button
            onClick={markAllAsRead}
            className="bg-rose-600 text-white px-4 py-2 rounded-lg hover:bg-rose-700 transition-colors"
          >
            Marcar todas como lidas
          </button>
        )}
      </div>
      
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500 mb-2">Nenhuma notificação encontrada.</div>
            <p className="text-sm text-gray-400">Você será notificado sobre reservas, atualizações e outras informações importantes.</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg border transition-all ${
                notification.read
                  ? 'bg-gray-50 border-gray-200'
                  : 'bg-white border-rose-200 shadow-md'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  {!notification.read && (
                    <div className="w-2 h-2 bg-rose-500 rounded-full"></div>
                  )}
                  <span className={`text-sm ${
                    notification.read ? 'text-gray-500' : 'text-rose-600 font-medium'
                  }`}>
                    {notification.read ? 'Lida' : 'Nova'}
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(notification.created_at).toLocaleString('pt-BR')}
                </span>
              </div>
              
              <p className={`mb-3 ${
                notification.read ? 'text-gray-700' : 'text-gray-900'
              }`}>
                {notification.message}
              </p>
              
              {!notification.read && (
                <button
                  onClick={() => markAsRead(notification.id)}
                  className="text-sm text-rose-600 hover:text-rose-700 font-medium"
                >
                  Marcar como lida
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
