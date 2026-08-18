export const FAVORITES_STORAGE_KEY = "hbs-home-favorites-v1";
export const FAVORITES_VERSION = 1 as const;
/** Garde-fou : un utilisateur n'accumule pas plus de 200 favoris en local. */
export const FAVORITES_MAX_ITEMS = 200;
export const FAVORITES_QUERY_KEY = ["favorites"] as const;
export const FAVORITES_UPDATED_EVENT = "hbs-home:favorites-updated";
