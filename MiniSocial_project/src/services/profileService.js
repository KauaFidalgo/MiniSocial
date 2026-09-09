import { getAPIBaseURL, isValidURL } from '../config/apiConfig';

export const CURRENT_USER_ID = 1;

/**
 * Faz uma requisição GET com tratamento robusto de erros
 */
async function fetchJson(url) {
  const baseUrl = getAPIBaseURL();
  const fullUrl = `${baseUrl}${url}`;

  // Valida a URL antes de tentar fazer fetch
  if (!isValidURL(fullUrl)) {
    throw new Error(`URL inválida: ${fullUrl}`);
  }

  console.log(`[API] GET ${fullUrl}`);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos de timeout

    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`[API] Erro ao buscar ${fullUrl}:`, error.message);

    if (error.name === 'AbortError') {
      throw new Error('Requisição expirou. Servidor não respondeu a tempo.');
    }

    throw error;
  }
}

export async function fetchUserById(userId) {
  return fetchJson(`/users/${userId}`);
}

export async function fetchPostsByUser(userId) {
  return fetchJson(`/posts?userId=${userId}`);
}

export async function fetchAllPosts() {
  return fetchJson('/posts');
}

export async function fetchCurrentUserProfile(userId) {
  const [user, posts] = await Promise.all([
    fetchUserById(userId),
    fetchPostsByUser(userId),
  ]);

  return {
    ...user,
    postsCount: posts.length,
  };
}

export async function updateUserProfile(userId, updates) {
  const baseUrl = getAPIBaseURL();
  const fullUrl = `${baseUrl}/users/${userId}`;

  if (!isValidURL(fullUrl)) {
    throw new Error(`URL inválida: ${fullUrl}`);
  }

  console.log(`[API] PATCH ${fullUrl}`, updates);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(fullUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`[API] Erro ao atualizar perfil:`, error.message);
    throw new Error('Não foi possível salvar as alterações do perfil.');
  }
}

export async function updateFavoritePosts(userId, favoritePosts) {
  const baseUrl = getAPIBaseURL();
  const fullUrl = `${baseUrl}/users/${userId}`;

  if (!isValidURL(fullUrl)) {
    throw new Error(`URL inválida: ${fullUrl}`);
  }

  console.log(`[API] PATCH ${fullUrl}`, { favoritePosts });

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(fullUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ favoritePosts }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`[API] Erro ao atualizar favoritos:`, error.message);
    throw new Error('Não foi possível atualizar os favoritos.');
  }
}

export async function fetchAllUsers() {
  return fetchJson('/users');
}

async function patchJson(url, body) {
  const baseUrl = getAPIBaseURL();
  const fullUrl = `${baseUrl}${url}`;

  if (!isValidURL(fullUrl)) {
    throw new Error(`URL inválida: ${fullUrl}`);
  }

  console.log(`[API] PATCH ${fullUrl}`, body);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(fullUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`[API] Erro ao fazer PATCH ${fullUrl}:`, error.message);
    throw new Error('Não foi possível atualizar os dados do usuário.');
  }
}

export async function toggleFollowRelationship(currentUserId, targetUserId, shouldFollow) {
  const [currentUser, targetUser] = await Promise.all([
    fetchUserById(currentUserId),
    fetchUserById(targetUserId),
  ]);

  const currentFollowing = new Set(currentUser.following ?? []);
  const targetFollowers = new Set(targetUser.followers ?? []);

  if (shouldFollow) {
    currentFollowing.add(targetUserId);
    targetFollowers.add(currentUserId);
  } else {
    currentFollowing.delete(targetUserId);
    targetFollowers.delete(currentUserId);
  }

  const [updatedCurrentUser, updatedTargetUser] = await Promise.all([
    patchJson(`/users/${currentUserId}`, { following: [...currentFollowing] }),
    patchJson(`/users/${targetUserId}`, { followers: [...targetFollowers] }),
  ]);

  return {
    currentUser: updatedCurrentUser,
    targetUser: updatedTargetUser,
  };
}
