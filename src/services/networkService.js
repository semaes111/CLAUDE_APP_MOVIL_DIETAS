/**
 * Servicio de red y conectividad
 * Maneja el estado de conexión y sincronización de datos
 */

import { Network } from '@capacitor/network';
import { SyncQueue, SyncUtils } from './offlineStorage';

// Estado de conexión actual
let isConnected = true;
let connectionType = 'unknown';
const connectionListeners = new Set();

/**
 * Inicializar el servicio de red
 */
export async function initNetworkService() {
  try {
    // Obtener estado inicial
    const status = await Network.getStatus();
    isConnected = status.connected;
    connectionType = status.connectionType;

    // Escuchar cambios de conexión
    Network.addListener('networkStatusChange', async (status) => {
      const wasConnected = isConnected;
      isConnected = status.connected;
      connectionType = status.connectionType;

      console.log('[NetworkService] Estado de conexión:', {
        connected: isConnected,
        type: connectionType
      });

      // Notificar a todos los listeners
      connectionListeners.forEach(listener => {
        listener({
          connected: isConnected,
          type: connectionType,
          wasConnected
        });
      });

      // Si volvió la conexión, intentar sincronizar
      if (isConnected && !wasConnected) {
        await syncPendingChanges();
      }
    });

    console.log('[NetworkService] Inicializado:', {
      connected: isConnected,
      type: connectionType
    });

    return { connected: isConnected, type: connectionType };
  } catch (error) {
    console.error('[NetworkService] Error al inicializar:', error);
    // Fallback al API del navegador
    isConnected = navigator.onLine;
    return { connected: isConnected, type: 'unknown' };
  }
}

/**
 * Obtener estado actual de conexión
 */
export function getConnectionStatus() {
  return {
    connected: isConnected,
    type: connectionType
  };
}

/**
 * Verificar si hay conexión
 */
export function isOnline() {
  return isConnected;
}

/**
 * Suscribirse a cambios de conexión
 */
export function onConnectionChange(callback) {
  connectionListeners.add(callback);

  // Devolver función para desuscribirse
  return () => {
    connectionListeners.delete(callback);
  };
}

/**
 * Sincronizar cambios pendientes con el servidor
 */
export async function syncPendingChanges() {
  if (!isConnected) {
    console.log('[NetworkService] Sin conexión, omitiendo sincronización');
    return { success: false, reason: 'offline' };
  }

  const pendingItems = await SyncQueue.getAll();

  if (pendingItems.length === 0) {
    console.log('[NetworkService] No hay cambios pendientes');
    return { success: true, synced: 0 };
  }

  console.log(`[NetworkService] Sincronizando ${pendingItems.length} cambios pendientes`);

  let syncedCount = 0;
  let failedCount = 0;
  const errors = [];

  for (const item of pendingItems) {
    try {
      // Verificar que todavía hay conexión
      if (!isConnected) {
        break;
      }

      // Procesar según el tipo de operación
      await processSyncItem(item);

      // Eliminar de la cola si fue exitoso
      await SyncQueue.remove(item.id);
      syncedCount++;
    } catch (error) {
      console.error('[NetworkService] Error sincronizando item:', item.id, error);

      // Incrementar contador de reintentos
      await SyncQueue.incrementRetry(item.id);

      // Si ha fallado muchas veces, registrar error pero no eliminar
      if (item.retryCount >= 5) {
        errors.push({
          id: item.id,
          error: error.message,
          item
        });
      }

      failedCount++;
    }
  }

  console.log(`[NetworkService] Sincronización completada: ${syncedCount} exitosos, ${failedCount} fallidos`);

  return {
    success: failedCount === 0,
    synced: syncedCount,
    failed: failedCount,
    errors
  };
}

/**
 * Procesar un item de la cola de sincronización
 */
async function processSyncItem(item) {
  const { entityType, action, data } = item;

  // Importar dinámicamente las entidades para evitar dependencias circulares
  const { default: entities } = await import('@/api/entities');

  const entityMap = {
    patient: entities.Patient,
    dietPlan: entities.DietPlan,
    weightRecord: entities.WeightRecord,
    recipe: entities.Recipe,
    medication: entities.Medication
  };

  const Entity = entityMap[entityType];

  if (!Entity) {
    throw new Error(`Tipo de entidad desconocido: ${entityType}`);
  }

  switch (action) {
    case 'create':
      await Entity.create(data);
      break;
    case 'update':
      await Entity.update(data.id, data);
      break;
    case 'delete':
      await Entity.delete(data.id);
      break;
    default:
      throw new Error(`Acción desconocida: ${action}`);
  }
}

/**
 * Ejecutar una operación con soporte offline
 * Guarda en cola si no hay conexión
 */
export async function executeWithOfflineSupport(operation, options = {}) {
  const {
    entityType,
    action,
    data,
    localStore,
    onlineFirst = true
  } = options;

  // Si hay conexión y preferimos online primero
  if (isConnected && onlineFirst) {
    try {
      const result = await operation();

      // Guardar también localmente si hay un store
      if (localStore && result) {
        await localStore.save(result);
      }

      return { success: true, data: result, source: 'online' };
    } catch (error) {
      console.error('[NetworkService] Error en operación online:', error);

      // Si falla, intentar guardar para sincronización posterior
      if (entityType && action && data) {
        await SyncQueue.add(entityType, action, data);
      }

      throw error;
    }
  }

  // Modo offline: guardar localmente y encolar para sincronización
  if (localStore && data) {
    await localStore.save(data);
  }

  if (entityType && action && data) {
    await SyncQueue.add(entityType, action, data);
  }

  return { success: true, data, source: 'offline' };
}

/**
 * Hook para React que proporciona estado de conexión
 */
export function useNetworkStatus() {
  const [status, setStatus] = React.useState({
    connected: isConnected,
    type: connectionType
  });

  React.useEffect(() => {
    const unsubscribe = onConnectionChange((newStatus) => {
      setStatus({
        connected: newStatus.connected,
        type: newStatus.type
      });
    });

    return unsubscribe;
  }, []);

  return status;
}

// Importar React solo si está disponible (para el hook)
let React;
try {
  React = await import('react');
} catch {
  React = null;
}

export default {
  initNetworkService,
  getConnectionStatus,
  isOnline,
  onConnectionChange,
  syncPendingChanges,
  executeWithOfflineSupport
};
