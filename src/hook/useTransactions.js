import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const useTransactions = (storageKey, initialValue = []) => {
  const [lista, setLista] = useState(initialValue);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const stored = await AsyncStorage.getItem(storageKey);
        setLista(stored ? JSON.parse(stored) : initialValue);
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, [initialValue, storageKey]);

  useEffect(() => {
    if (!loading) {
      AsyncStorage.setItem(storageKey, JSON.stringify(lista));
    }
  }, [lista, loading, storageKey]);

  return {
    lista,
    setLista,
    loading,
  };
};

export { useTransactions };
