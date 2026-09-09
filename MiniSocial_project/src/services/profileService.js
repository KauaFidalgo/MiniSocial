// Frontend-only mock service: local in-memory data
export const CURRENT_USER_ID = 1;

const users = [
  {
    id: 1,
    name: 'Késsia Milena',
    username: 'kessia.milena',
    bio: 'Desenvolvedora e entusiasta de tecnologia. Compartilhando projetos e aprendizados.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&q=80',
    followers: [2],
    following: [2],
    favoritePosts: [1, 3],
  },
  {
    id: 2,
    name: 'Ana Souza',
    username: 'ana.souza',
    bio: 'Product designer apaixonada por interfaces claras e acessíveis.',
    avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=500&q=80',
    followers: [1],
    following: [1],
    favoritePosts: [],
  },
];

const posts = [
  { id: 1, userId: 1, image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1000&q=80', text: 'Jornada de aprendizado' },
  { id: 2, userId: 1, image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1000&q=80', text: 'Momento de foco' },
  { id: 3, userId: 1, image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1000&q=80', text: 'Inspiração diária' },
  { id: 4, userId: 1, image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1000&q=80', text: 'Organizando ideias' },
  { id: 5, userId: 1, image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1000&q=80', text: 'Rotina produtiva' },
  { id: 6, userId: 2, image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1000&q=80', text: 'Design que comunica' },
  { id: 7, userId: 1, image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1000&q=80', text: 'Ambientes inspiradores' },
];

function delay(result, ms = 200) {
  return new Promise((res) => setTimeout(() => res(result), ms));
}

export async function fetchUserById(userId) {
  const u = users.find((x) => x.id === Number(userId));
  return delay(u ? { ...u } : null);
}

export async function fetchPostsByUser(userId) {
  return delay(posts.filter((p) => p.userId === Number(userId)).map((p) => ({ ...p })));
}

export async function fetchAllPosts() {
  return delay(posts.map((p) => ({ ...p })));
}

export async function fetchCurrentUserProfile(userId) {
  const user = users.find((u) => u.id === Number(userId));
  if (!user) return delay(null);
  const userPosts = posts.filter((p) => p.userId === user.id);
  return delay({ ...user, postsCount: userPosts.length });
}

export async function updateUserProfile(userId, updates) {
  const idx = users.findIndex((u) => u.id === Number(userId));
  if (idx === -1) return delay(null);
  users[idx] = { ...users[idx], ...updates };
  return delay({ ...users[idx] });
}

export async function updateFavoritePosts(userId, favoritePosts) {
  const idx = users.findIndex((u) => u.id === Number(userId));
  if (idx === -1) return delay(null);
  users[idx].favoritePosts = [...favoritePosts];
  return delay({ ...users[idx] });
}

export async function fetchAllUsers() {
  return delay(users.map((u) => ({ ...u })));
}

export async function toggleFollowRelationship(currentUserId, targetUserId, shouldFollow) {
  const current = users.find((u) => u.id === Number(currentUserId));
  const target = users.find((u) => u.id === Number(targetUserId));
  if (!current || !target) return delay(null);

  const curFollowing = new Set(current.following || []);
  const tarFollowers = new Set(target.followers || []);

  if (shouldFollow) {
    curFollowing.add(Number(targetUserId));
    tarFollowers.add(Number(currentUserId));
  } else {
    curFollowing.delete(Number(targetUserId));
    tarFollowers.delete(Number(currentUserId));
  }

  current.following = Array.from(curFollowing);
  target.followers = Array.from(tarFollowers);

  return delay({ currentUser: { ...current }, targetUser: { ...target } });
}
