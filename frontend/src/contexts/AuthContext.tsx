import { createContext, useState, useEffect, useContext } from "react";
import { supabase } from "../supabaseClient";

export interface Profile {
  id: string;
  name: string;
  username: string;
}

export type TimeBlock = {
  id: string;
  start: Date;
  end: Date;
  summary: string;
  color: string;
  googleId?: string;
}

export interface FriendRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: "pending" | "accepted" | "rejected";
}

export interface AuthContextType {
  session: any | null;
  userProfile: Profile | null;
  friends: Profile[];
  pendingFriendRequests: FriendRequest[];
  allProfiles: Profile[];
  syncBlocks: TimeBlock[];
  searchFriends: (query: string) => Promise<Profile[]>;
  sendFriendRequest: (receiverId: string) => Promise<void>;
  removeFriend: (friendId: string) => Promise<void>;
  acceptFriendRequest: (requestId: string) => Promise<void>;
  rejectFriendRequest: (requestId: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadFriends: (userId: string) => Promise<void>;           
  loadPendingFriendRequests: (userId: string) => Promise<void>;
  sync1to1: (friendId: number) => Promise<void>;
  syncMany: (friendsId: number[]) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: any }) => {
  const [session, setSession] = useState<any | null>(null);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [friends, setFriends] = useState<Profile[]>([]);
  const [pendingFriendRequests, setPendingFriendRequests] = useState<FriendRequest[]>([]);
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [syncBlocks, setSyncBlocks] = useState<TimeBlock[]>([]);

  // ------------------- Inicialización -------------------
  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session) await loadUserData(session.user.id);
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        setUserProfile(null);
        setFriends([]);
        setPendingFriendRequests([]);
        setAllProfiles([]);
      } else {
        loadUserData(session.user.id);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // ------------------- Cargar datos del usuario -------------------
  const loadUserData = async (userId: string) => {
    await Promise.all([
      loadUserProfile(userId),
      loadFriends(userId),
      loadPendingFriendRequests(userId),
      loadAllProfiles()
    ]);
  };

  const loadUserProfile = async (userId: string) => {
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (!profile) {
    const { data: user } = await supabase.auth.getUser();
    const email = user?.user?.email || "user";
    const defaultName = email.split("@")[0];
    const defaultUsername = defaultName.replace(/\W/g, "").toLowerCase();

    try {
      const { data: insertData, error: insertError } = await supabase
        .from("profiles")
        .insert([{ id: userId, name: defaultName, username: defaultUsername }])
        .select()
        .single();
      if (insertError) {
        // Si es duplicado, simplemente cargamos el perfil existente
        console.log("Perfil ya existe, se omite inserción");
        setUserProfile(await supabase.from("profiles").select("*").eq("id", userId).single().then(r => r.data));
      } else setUserProfile(insertData);
    } catch (err) {
      console.error("Error al crear perfil:", err);
    }
  } else {
    setUserProfile(profile);
  }
};


  const loadAllProfiles = async () => {
    const { data, error } = await supabase.from("profiles").select("*");
    if (error) console.error("Error al cargar todos los perfiles:", error.message);
    else setAllProfiles(data as Profile[]);
  };

  // ------------------- Cargar solicitudes pendientes -------------------
  const loadPendingFriendRequests = async (userId: string) => {
    const { data, error } = await supabase
      .from("friend_requests")
      .select("*")
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .eq("status", "pending");

    if (error) console.error("Error al cargar solicitudes pendientes:", error.message);
    else setPendingFriendRequests(data as FriendRequest[]);
  };

  // ------------------- Cargar amigos confirmados -------------------
  const loadFriends = async (userId: string) => {
    const { data: friendsData, error } = await supabase
      .from("friends")
      .select("*")
      .or(`user_id.eq.${userId},friend_id.eq.${userId}`); // bidireccional

    if (error) {
      console.error("Error al cargar amigos:", error.message);
      return;
    }

    if (Array.isArray(friendsData)) {
      const friendProfiles = await Promise.all(
        friendsData.map(async (f: any) => {
          const friendId = f.friend_id === userId ? f.user_id : f.friend_id;
          const { data: profileData } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", friendId)
            .single();
          return profileData ? (profileData as Profile) : null;
        })
      );
      setFriends(friendProfiles.filter(Boolean) as Profile[]);
    }
  };

  // ------------------- Funciones -------------------
  const login = async (email: string, password: string) => {
    try {
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (loginError) throw loginError;

      setSession(loginData.session);
      const userId = loginData.user?.id;
      if (userId) await loadUserData(userId);
    } catch (err: any) {
      console.error("Error al iniciar sesión:", err.message);
      alert("Error al iniciar sesión: " + err.message);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUserProfile(null);
    setFriends([]);
    setPendingFriendRequests([]);
    setAllProfiles([]);
  };

  const searchFriends = async (query: string) => {
    if (!query) return [];

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .or(`name.ilike.${query}%,username.ilike.${query}%`);

    if (error) {
      console.error("Error al buscar amigos:", error.message);
      return [];
    }

    return (data || []).filter(u => u.id !== session?.user.id) as Profile[];
  };

 const sendFriendRequest = async (receiverId: string) => {
  if (!session) return;
  const senderId = session.user.id;
  if (!receiverId || receiverId === senderId) return;

  try {
    const { error } = await supabase
      .from("friend_requests")
      .insert([{ sender_id: senderId, receiver_id: receiverId, status: "pending" }]);

    if (error) {
      // Si el error es conflict (duplicado), ignorarlo
      if (error.code === "PGRST116" || error.message.includes("duplicate key value")) {
        console.log("Solicitud ya existe, no se inserta de nuevo");
      } else {
        throw error;
      }
    }

    await loadPendingFriendRequests(senderId);

  } catch (err: any) {
    console.error("Error al enviar solicitud:", err.message);
    throw err;
  }
};








  const removeFriend = async (friendId: string) => {
  if (!session) return;
  const userId = session.user.id;

  try {
    // Eliminar amistad (simétrica)
    const [user1, user2] = [userId, friendId].sort();
    await supabase
      .from("friends")
      .delete()
      .eq("user_id", user1)
      .eq("friend_id", user2);

    // Refrescar listas
    await loadFriends(userId);
    await loadPendingFriendRequests(userId);

  } catch (err: any) {
    console.error("Error al eliminar amigo:", err.message);
    alert("Error al eliminar amigo: " + err.message);
  }
};




 const acceptFriendRequest = async (requestId: string) => {
  if (!session) return;
  const req = pendingFriendRequests.find(r => r.id === requestId);
  if (!req) return;

  try {
    // Actualizar solicitud
    await supabase
      .from("friend_requests")
      .update({ status: "accepted" })
      .eq("id", requestId);

    // Insertar amistad una sola vez (simétrica)
    const [user1, user2] = [session.user.id, req.sender_id].sort();
    const { error } = await supabase
      .from("friends")
      .insert([{ user_id: user1, friend_id: user2 }]);
    if (error) throw error;

    // Actualizar estados locales
    setPendingFriendRequests(prev => prev.filter(r => r.id !== requestId));
    const friendProfile = allProfiles.find(p => p.id === req.sender_id);
    if (friendProfile) setFriends(prev => [...prev, friendProfile]);

  } catch (err: any) {
    console.error("Error al aceptar solicitud:", err.message);
  }
};




  const rejectFriendRequest = async (requestId: string) => {
    const req = pendingFriendRequests.find(r => r.id === requestId);
    if (!req) return;
    try {
      const { error } = await supabase
        .from("friend_requests")
        .update({ status: "rejected" })
        .eq("id", requestId);
      if (error) throw error;
      setPendingFriendRequests(prev => prev.filter(r => r.id !== requestId));
      alert("Solicitud rechazada");
    } catch (err: any) {
      console.error("Error al rechazar solicitud:", err.message);
      alert("Error al rechazar solicitud: " + err.message);
    }
  };




  const sync1to1 = async (friendId: number) => {
    if (!session) return;
    try {
      const userId = session.user.id;
      const syncAux = await supabase.rpc('sync', {userId, friendId})
      // comento para q funcione en render setSyncBlocks(syncAux);
    } catch (err: any) {
      console.error("Error al sincronizar 1 a 1:", err.message);
    }
  }




  const syncMany = async (friendsId: number[]) => {
    if (!session) return;
    try {
      const userId = session.user.id;
      const syncAux = await supabase.rpc('sync_many', {...friendsId, userId})
      // comento para q funcione en render setSyncBlocks(syncAux);
    } catch (err: any) {
      console.error("Error al sincronizar varios:", err.message);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        userProfile,
        friends,
        pendingFriendRequests,
        allProfiles,
        syncBlocks,
        searchFriends,
        sendFriendRequest,
        removeFriend,
        acceptFriendRequest,
        rejectFriendRequest,
        login,
        logout,
        loadFriends,          
        loadPendingFriendRequests,
        sync1to1,
        syncMany
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuthContext debe usarse dentro de AuthProvider");
  return context;
};
