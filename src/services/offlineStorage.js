/**
 * Servicio de almacenamiento offline usando IndexedDB
 * Proporciona persistencia local para datos de la aplicación
 */

import { openDB } from 'idb';

const DB_NAME = 'nutrimed-offline';
const DB_VERSION = 1;

// Almacenes de datos
const STORES = {
  PATIENTS: 'patients',
  DIET_PLANS: 'dietPlans',
  WEIGHT_RECORDS: 'weightRecords',
  RECIPES: 'recipes',
  MEDICATIONS: 'medications',
  PENDING_SYNC: 'pendingSync',
  USER_PREFERENCES: 'userPreferences',
  SUBSCRIPTION: 'subscription'
};

/**
 * Inicializar la base de datos IndexedDB
 */
async function initDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion, transaction) {
      // Crear almacenes si no existen

      // Pacientes
      if (!db.objectStoreNames.contains(STORES.PATIENTS)) {
        const patientStore = db.createObjectStore(STORES.PATIENTS, {
          keyPath: 'id'
        });
        patientStore.createIndex('by_code', 'access_code');
        patientStore.createIndex('by_doctor', 'assigned_doctor');
      }

      // Planes de dieta
      if (!db.objectStoreNames.contains(STORES.DIET_PLANS)) {
        const dietStore = db.createObjectStore(STORES.DIET_PLANS, {
          keyPath: 'id'
        });
        dietStore.createIndex('by_patient', 'patient_id');
        dietStore.createIndex('by_type', 'diet_type');
      }

      // Registros de peso
      if (!db.objectStoreNames.contains(STORES.WEIGHT_RECORDS)) {
        const weightStore = db.createObjectStore(STORES.WEIGHT_RECORDS, {
          keyPath: 'id'
        });
        weightStore.createIndex('by_patient', 'patient_id');
        weightStore.createIndex('by_date', 'date');
      }

      // Recetas
      if (!db.objectStoreNames.contains(STORES.RECIPES)) {
        const recipeStore = db.createObjectStore(STORES.RECIPES, {
          keyPath: 'id'
        });
        recipeStore.createIndex('by_diet_type', 'diet_type');
        recipeStore.createIndex('by_meal_type', 'meal_type');
      }

      // Medicamentos
      if (!db.objectStoreNames.contains(STORES.MEDICATIONS)) {
        const medStore = db.createObjectStore(STORES.MEDICATIONS, {
          keyPath: 'id'
        });
        medStore.createIndex('by_patient', 'patient_id');
      }

      // Cola de sincronización pendiente
      if (!db.objectStoreNames.contains(STORES.PENDING_SYNC)) {
        const syncStore = db.createObjectStore(STORES.PENDING_SYNC, {
          keyPath: 'id',
          autoIncrement: true
        });
        syncStore.createIndex('by_entity', 'entityType');
        syncStore.createIndex('by_action', 'action');
        syncStore.createIndex('by_timestamp', 'timestamp');
      }

      // Preferencias de usuario
      if (!db.objectStoreNames.contains(STORES.USER_PREFERENCES)) {
        db.createObjectStore(STORES.USER_PREFERENCES, {
          keyPath: 'key'
        });
      }

      // Información de suscripción
      if (!db.objectStoreNames.contains(STORES.SUBSCRIPTION)) {
        db.createObjectStore(STORES.SUBSCRIPTION, {
          keyPath: 'userId'
        });
      }
    }
  });
}

// Instancia de la base de datos
let dbPromise = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = initDB();
  }
  return dbPromise;
}

/**
 * Clase para manejar el almacenamiento offline
 */
class OfflineStorage {
  /**
   * Guardar un elemento en un almacén
   */
  async save(storeName, item) {
    const db = await getDB();
    const tx = db.transaction(storeName, 'readwrite');
    await tx.store.put({
      ...item,
      _lastUpdated: new Date().toISOString()
    });
    await tx.done;
    return item;
  }

  /**
   * Guardar múltiples elementos
   */
  async saveMany(storeName, items) {
    const db = await getDB();
    const tx = db.transaction(storeName, 'readwrite');
    const timestamp = new Date().toISOString();

    for (const item of items) {
      await tx.store.put({
        ...item,
        _lastUpdated: timestamp
      });
    }

    await tx.done;
    return items;
  }

  /**
   * Obtener un elemento por ID
   */
  async get(storeName, id) {
    const db = await getDB();
    return db.get(storeName, id);
  }

  /**
   * Obtener todos los elementos de un almacén
   */
  async getAll(storeName) {
    const db = await getDB();
    return db.getAll(storeName);
  }

  /**
   * Obtener elementos por índice
   */
  async getByIndex(storeName, indexName, value) {
    const db = await getDB();
    return db.getAllFromIndex(storeName, indexName, value);
  }

  /**
   * Eliminar un elemento
   */
  async delete(storeName, id) {
    const db = await getDB();
    await db.delete(storeName, id);
  }

  /**
   * Limpiar un almacén completo
   */
  async clear(storeName) {
    const db = await getDB();
    await db.clear(storeName);
  }

  /**
   * Contar elementos en un almacén
   */
  async count(storeName) {
    const db = await getDB();
    return db.count(storeName);
  }
}

// Instancia singleton
const offlineStorage = new OfflineStorage();

/**
 * Almacenamiento de pacientes
 */
export const PatientStore = {
  async save(patient) {
    return offlineStorage.save(STORES.PATIENTS, patient);
  },

  async saveMany(patients) {
    return offlineStorage.saveMany(STORES.PATIENTS, patients);
  },

  async get(id) {
    return offlineStorage.get(STORES.PATIENTS, id);
  },

  async getByCode(accessCode) {
    const patients = await offlineStorage.getByIndex(
      STORES.PATIENTS,
      'by_code',
      accessCode
    );
    return patients[0] || null;
  },

  async getByDoctor(doctorEmail) {
    return offlineStorage.getByIndex(STORES.PATIENTS, 'by_doctor', doctorEmail);
  },

  async getAll() {
    return offlineStorage.getAll(STORES.PATIENTS);
  },

  async delete(id) {
    return offlineStorage.delete(STORES.PATIENTS, id);
  }
};

/**
 * Almacenamiento de planes de dieta
 */
export const DietPlanStore = {
  async save(plan) {
    return offlineStorage.save(STORES.DIET_PLANS, plan);
  },

  async saveMany(plans) {
    return offlineStorage.saveMany(STORES.DIET_PLANS, plans);
  },

  async get(id) {
    return offlineStorage.get(STORES.DIET_PLANS, id);
  },

  async getByPatient(patientId) {
    return offlineStorage.getByIndex(STORES.DIET_PLANS, 'by_patient', patientId);
  },

  async getByType(dietType) {
    return offlineStorage.getByIndex(STORES.DIET_PLANS, 'by_type', dietType);
  },

  async getAll() {
    return offlineStorage.getAll(STORES.DIET_PLANS);
  },

  async delete(id) {
    return offlineStorage.delete(STORES.DIET_PLANS, id);
  }
};

/**
 * Almacenamiento de registros de peso
 */
export const WeightRecordStore = {
  async save(record) {
    return offlineStorage.save(STORES.WEIGHT_RECORDS, record);
  },

  async saveMany(records) {
    return offlineStorage.saveMany(STORES.WEIGHT_RECORDS, records);
  },

  async get(id) {
    return offlineStorage.get(STORES.WEIGHT_RECORDS, id);
  },

  async getByPatient(patientId) {
    return offlineStorage.getByIndex(STORES.WEIGHT_RECORDS, 'by_patient', patientId);
  },

  async getAll() {
    return offlineStorage.getAll(STORES.WEIGHT_RECORDS);
  },

  async delete(id) {
    return offlineStorage.delete(STORES.WEIGHT_RECORDS, id);
  }
};

/**
 * Almacenamiento de recetas
 */
export const RecipeStore = {
  async save(recipe) {
    return offlineStorage.save(STORES.RECIPES, recipe);
  },

  async saveMany(recipes) {
    return offlineStorage.saveMany(STORES.RECIPES, recipes);
  },

  async get(id) {
    return offlineStorage.get(STORES.RECIPES, id);
  },

  async getByDietType(dietType) {
    return offlineStorage.getByIndex(STORES.RECIPES, 'by_diet_type', dietType);
  },

  async getByMealType(mealType) {
    return offlineStorage.getByIndex(STORES.RECIPES, 'by_meal_type', mealType);
  },

  async getAll() {
    return offlineStorage.getAll(STORES.RECIPES);
  },

  async delete(id) {
    return offlineStorage.delete(STORES.RECIPES, id);
  }
};

/**
 * Almacenamiento de medicamentos
 */
export const MedicationStore = {
  async save(medication) {
    return offlineStorage.save(STORES.MEDICATIONS, medication);
  },

  async saveMany(medications) {
    return offlineStorage.saveMany(STORES.MEDICATIONS, medications);
  },

  async get(id) {
    return offlineStorage.get(STORES.MEDICATIONS, id);
  },

  async getByPatient(patientId) {
    return offlineStorage.getByIndex(STORES.MEDICATIONS, 'by_patient', patientId);
  },

  async getAll() {
    return offlineStorage.getAll(STORES.MEDICATIONS);
  },

  async delete(id) {
    return offlineStorage.delete(STORES.MEDICATIONS, id);
  }
};

/**
 * Cola de sincronización para operaciones pendientes
 */
export const SyncQueue = {
  /**
   * Añadir operación a la cola
   */
  async add(entityType, action, data) {
    const db = await getDB();
    const tx = db.transaction(STORES.PENDING_SYNC, 'readwrite');
    await tx.store.add({
      entityType,
      action, // 'create', 'update', 'delete'
      data,
      timestamp: new Date().toISOString(),
      retryCount: 0
    });
    await tx.done;
  },

  /**
   * Obtener todas las operaciones pendientes
   */
  async getAll() {
    return offlineStorage.getAll(STORES.PENDING_SYNC);
  },

  /**
   * Obtener operaciones por tipo de entidad
   */
  async getByEntity(entityType) {
    return offlineStorage.getByIndex(STORES.PENDING_SYNC, 'by_entity', entityType);
  },

  /**
   * Eliminar operación completada
   */
  async remove(id) {
    return offlineStorage.delete(STORES.PENDING_SYNC, id);
  },

  /**
   * Limpiar toda la cola
   */
  async clear() {
    return offlineStorage.clear(STORES.PENDING_SYNC);
  },

  /**
   * Obtener cantidad de operaciones pendientes
   */
  async count() {
    return offlineStorage.count(STORES.PENDING_SYNC);
  },

  /**
   * Incrementar contador de reintentos
   */
  async incrementRetry(id) {
    const db = await getDB();
    const item = await db.get(STORES.PENDING_SYNC, id);
    if (item) {
      item.retryCount = (item.retryCount || 0) + 1;
      item.lastRetry = new Date().toISOString();
      await db.put(STORES.PENDING_SYNC, item);
    }
  }
};

/**
 * Preferencias de usuario
 */
export const UserPreferences = {
  async set(key, value) {
    const db = await getDB();
    await db.put(STORES.USER_PREFERENCES, { key, value });
  },

  async get(key, defaultValue = null) {
    const db = await getDB();
    const item = await db.get(STORES.USER_PREFERENCES, key);
    return item?.value ?? defaultValue;
  },

  async remove(key) {
    const db = await getDB();
    await db.delete(STORES.USER_PREFERENCES, key);
  },

  async getAll() {
    const db = await getDB();
    const items = await db.getAll(STORES.USER_PREFERENCES);
    return items.reduce((acc, item) => {
      acc[item.key] = item.value;
      return acc;
    }, {});
  }
};

/**
 * Almacenamiento de suscripción
 */
export const SubscriptionStore = {
  async save(subscription) {
    const db = await getDB();
    await db.put(STORES.SUBSCRIPTION, {
      ...subscription,
      _lastUpdated: new Date().toISOString()
    });
  },

  async get(userId) {
    const db = await getDB();
    return db.get(STORES.SUBSCRIPTION, userId);
  },

  async delete(userId) {
    const db = await getDB();
    await db.delete(STORES.SUBSCRIPTION, userId);
  },

  async getAll() {
    const db = await getDB();
    return db.getAll(STORES.SUBSCRIPTION);
  }
};

/**
 * Utilidades de sincronización
 */
export const SyncUtils = {
  /**
   * Verificar si hay conexión a internet
   */
  isOnline() {
    return navigator.onLine;
  },

  /**
   * Registrar listener para cambios de conexión
   */
  onConnectionChange(callback) {
    window.addEventListener('online', () => callback(true));
    window.addEventListener('offline', () => callback(false));
  },

  /**
   * Solicitar sincronización en segundo plano
   */
  async requestBackgroundSync() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        if ('sync' in registration) {
          await registration.sync.register('sync-data');
          return true;
        }
      } catch (error) {
        console.error('Error registrando background sync:', error);
        return false;
      }
    }
    return false;
  }
};

export default {
  PatientStore,
  DietPlanStore,
  WeightRecordStore,
  RecipeStore,
  MedicationStore,
  SyncQueue,
  UserPreferences,
  SubscriptionStore,
  SyncUtils,
  STORES
};
