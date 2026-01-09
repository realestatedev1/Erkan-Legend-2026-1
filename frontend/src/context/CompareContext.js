import React, { createContext, useContext, useState, useEffect } from 'react';

const CompareContext = createContext();

export const useCompare = () => {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
};

export const CompareProvider = ({ children }) => {
  const [compareList, setCompareList] = useState([]);
  const MAX_COMPARE = 3; // Maximum 3 ilan karşılaştırılabilir

  // LocalStorage'dan karşılaştırma listesini yükle
  useEffect(() => {
    const savedCompare = localStorage.getItem('legendcities_compare');
    if (savedCompare) {
      try {
        setCompareList(JSON.parse(savedCompare));
      } catch (e) {
        console.error('Failed to parse compare list:', e);
        setCompareList([]);
      }
    }
  }, []);

  // Liste değiştiğinde localStorage'a kaydet
  useEffect(() => {
    localStorage.setItem('legendcities_compare', JSON.stringify(compareList));
  }, [compareList]);

  const addToCompare = (property) => {
    if (compareList.length >= MAX_COMPARE) {
      return { success: false, message: `En fazla ${MAX_COMPARE} ilan karşılaştırabilirsiniz` };
    }
    if (compareList.find(p => p.id === property.id)) {
      return { success: false, message: 'Bu ilan zaten karşılaştırma listesinde' };
    }
    setCompareList(prev => [...prev, property]);
    return { success: true, message: 'İlan karşılaştırma listesine eklendi' };
  };

  const removeFromCompare = (propertyId) => {
    setCompareList(prev => prev.filter(p => p.id !== propertyId));
  };

  const toggleCompare = (property) => {
    if (isInCompare(property.id)) {
      removeFromCompare(property.id);
      return { success: true, message: 'İlan karşılaştırma listesinden çıkarıldı' };
    } else {
      return addToCompare(property);
    }
  };

  const isInCompare = (propertyId) => {
    return compareList.some(p => p.id === propertyId);
  };

  const clearCompare = () => {
    setCompareList([]);
  };

  return (
    <CompareContext.Provider value={{
      compareList,
      addToCompare,
      removeFromCompare,
      toggleCompare,
      isInCompare,
      clearCompare,
      compareCount: compareList.length,
      maxCompare: MAX_COMPARE,
      canAddMore: compareList.length < MAX_COMPARE
    }}>
      {children}
    </CompareContext.Provider>
  );
};

export default CompareContext;
