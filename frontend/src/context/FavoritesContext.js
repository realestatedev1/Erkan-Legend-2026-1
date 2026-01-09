import React, { createContext, useContext, useState, useEffect } from 'react';

const FavoritesContext = createContext();

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);

  // LocalStorage'dan favorileri yükle
  useEffect(() => {
    const savedFavorites = localStorage.getItem('legendcities_favorites');
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (e) {
        console.error('Failed to parse favorites:', e);
        setFavorites([]);
      }
    }
  }, []);

  // Favoriler değiştiğinde localStorage'a kaydet
  useEffect(() => {
    localStorage.setItem('legendcities_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const addFavorite = (property) => {
    setFavorites(prev => {
      if (prev.find(p => p.id === property.id)) {
        return prev; // Zaten ekli
      }
      return [...prev, property];
    });
  };

  const removeFavorite = (propertyId) => {
    setFavorites(prev => prev.filter(p => p.id !== propertyId));
  };

  const toggleFavorite = (property) => {
    if (isFavorite(property.id)) {
      removeFavorite(property.id);
    } else {
      addFavorite(property);
    }
  };

  const isFavorite = (propertyId) => {
    return favorites.some(p => p.id === propertyId);
  };

  const clearFavorites = () => {
    setFavorites([]);
  };

  return (
    <FavoritesContext.Provider value={{
      favorites,
      addFavorite,
      removeFavorite,
      toggleFavorite,
      isFavorite,
      clearFavorites,
      favoritesCount: favorites.length
    }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export default FavoritesContext;
