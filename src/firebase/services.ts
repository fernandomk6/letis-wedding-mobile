import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  setDoc,
  query,
  orderBy,
  runTransaction,
  serverTimestamp,
  type DocumentSnapshot,
  type Transaction
} from 'firebase/firestore';
import { db } from './config';
import { STATUS, getProductStatus, type Product, type ProductStatus, type CoupleSettings } from '../utils/status';

/* Paths: todos os dados ficam sob users/{ownerUid}/... */
const productsCol = (ownerUid: string) => collection(db, 'users', ownerUid, 'products');
const productDoc = (ownerUid: string, productId: string) => doc(db, 'users', ownerUid, 'products', productId);
const namesDoc = (ownerUid: string) => doc(db, 'users', ownerUid, 'settings', 'names');

/* User profile operations */
export const userService = {
  // Cria o perfil users/{uid} no primeiro login
  async ensureProfile(user: { uid: string; displayName?: string | null; email?: string | null }) {
    const userRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      await setDoc(userRef, {
        displayName: user.displayName || '',
        email: user.email || '',
        createdAt: serverTimestamp()
      });
    }
  }
};

/* Product operations */
const toProduct = (snap: DocumentSnapshot): Product => {
  const data = snap.data()!;
  return {
    ...(data as Omit<Product, 'id'>),
    id: snap.id,
    createdAt: data.createdAt?.toDate(),
    updatedAt: data.updatedAt?.toDate(),
    reservedAt: data.reservedAt?.toDate(),
    paidAt: data.paidAt?.toDate(),
    receivedAt: data.receivedAt?.toDate()
  };
};

// Lê o produto dentro de uma transação e valida o status atual
const getForTransition = async (
  transaction: Transaction,
  ownerUid: string,
  productId: string,
  allowedStatuses: ProductStatus[],
  errorMessage: string
) => {
  const productRef = productDoc(ownerUid, productId);
  const snap = await transaction.get(productRef);
  if (!snap.exists()) throw new Error('Produto não encontrado');
  const data = snap.data();
  if (!allowedStatuses.includes(getProductStatus(data))) throw new Error(errorMessage);
  return { productRef, data };
};

// Volta o produto ao estado inicial: disponível, sem doador e sem comentário
const clearedDonor = () => ({
  status: STATUS.AVAILABLE,
  reservedBy: null,
  reservedAt: null,
  paidAt: null,
  receivedAt: null,
  comment: null,
  updatedAt: serverTimestamp()
});

const requireName = (name?: string) => {
  const trimmed = (name || '').trim();
  if (!trimmed) throw new Error('Informe o nome do doador');
  return trimmed;
};

export const productService = {
  async getAllProducts(ownerUid: string) {
    try {
      const q = query(productsCol(ownerUid), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(toProduct);
    } catch (error) {
      console.error('Error getting products:', error);
      throw error;
    }
  },

  async getProduct(ownerUid: string, productId: string) {
    try {
      const productSnap = await getDoc(productDoc(ownerUid, productId));
      return productSnap.exists() ? toProduct(productSnap) : null;
    } catch (error) {
      console.error('Error getting product:', error);
      throw error;
    }
  },

  async createProduct(ownerUid: string, productData: Record<string, unknown>) {
    try {
      const docRef = await addDoc(productsCol(ownerUid), {
        ...productData,
        status: STATUS.AVAILABLE,
        reservedBy: null,
        reservedAt: null,
        comment: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  // Só itens disponíveis podem ser editados
  async updateProduct(ownerUid: string, productId: string, updateData: Record<string, unknown>) {
    try {
      await runTransaction(db, async (transaction) => {
        const { productRef } = await getForTransition(
          transaction, ownerUid, productId, [STATUS.AVAILABLE],
          'Só é possível editar presentes disponíveis'
        );
        transaction.update(productRef, { ...updateData, updatedAt: serverTimestamp() });
      });
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  // Só itens disponíveis podem ser excluídos
  async deleteProduct(ownerUid: string, productId: string) {
    try {
      await runTransaction(db, async (transaction) => {
        const { productRef } = await getForTransition(
          transaction, ownerUid, productId, [STATUS.AVAILABLE],
          'Só é possível excluir presentes disponíveis'
        );
        transaction.delete(productRef);
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

  // Convidado reserva (available -> reserved)
  async reserveProduct(ownerUid: string, productId: string, donorName: string) {
    try {
      await runTransaction(db, async (transaction) => {
        const { productRef } = await getForTransition(
          transaction, ownerUid, productId, [STATUS.AVAILABLE], 'Produto já foi reservado'
        );
        transaction.update(productRef, {
          status: STATUS.RESERVED,
          reservedBy: requireName(donorName),
          reservedAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      });
      return { success: true };
    } catch (error) {
      console.error('Error reserving product:', error);
      throw error;
    }
  },

  // Convidado paga via Pix (available -> paid)
  async payProduct(ownerUid: string, productId: string, donorName: string) {
    try {
      await runTransaction(db, async (transaction) => {
        const { productRef } = await getForTransition(
          transaction, ownerUid, productId, [STATUS.AVAILABLE], 'Produto já foi reservado'
        );
        transaction.update(productRef, {
          status: STATUS.PAID,
          reservedBy: requireName(donorName),
          reservedAt: serverTimestamp(),
          paidAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      });
      return { success: true };
    } catch (error) {
      console.error('Error paying product:', error);
      throw error;
    }
  },

  // Comentário do convidado (as regras só permitem gravar uma vez)
  async addComment(ownerUid: string, productId: string, comment: string) {
    try {
      const text = (comment || '').trim().slice(0, 500);
      if (!text) return;
      await updateDoc(productDoc(ownerUid, productId), {
        comment: text,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  },

  // Admin vincula doador (available -> reserved)
  async assignDonor(ownerUid: string, productId: string, donorName: string) {
    try {
      await runTransaction(db, async (transaction) => {
        const { productRef } = await getForTransition(
          transaction, ownerUid, productId, [STATUS.AVAILABLE], 'Produto não está disponível'
        );
        transaction.update(productRef, {
          status: STATUS.RESERVED,
          reservedBy: requireName(donorName),
          reservedAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      });
      return { success: true };
    } catch (error) {
      console.error('Error assigning donor:', error);
      throw error;
    }
  },

  // Admin marca como recebido (available exige nome; reserved/paid mantêm o doador)
  async markReceived(ownerUid: string, productId: string, donorName: string) {
    try {
      await runTransaction(db, async (transaction) => {
        const { productRef, data } = await getForTransition(
          transaction, ownerUid, productId,
          [STATUS.AVAILABLE, STATUS.RESERVED, STATUS.PAID], 'Produto já foi recebido'
        );
        const update: Record<string, unknown> = {
          status: STATUS.RECEIVED,
          receivedAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        if (getProductStatus(data) === STATUS.AVAILABLE) {
          update.reservedBy = requireName(donorName);
          update.reservedAt = serverTimestamp();
        }
        transaction.update(productRef, update);
      });
      return { success: true };
    } catch (error) {
      console.error('Error marking as received:', error);
      throw error;
    }
  },

  // Desvincular (reserved) / Estornar (paid): volta a disponível, sem doador
  async releaseProduct(ownerUid: string, productId: string) {
    try {
      await runTransaction(db, async (transaction) => {
        const { productRef } = await getForTransition(
          transaction, ownerUid, productId, [STATUS.RESERVED, STATUS.PAID],
          'Produto não está reservado nem pago'
        );
        transaction.update(productRef, clearedDonor());
      });
      return { success: true };
    } catch (error) {
      console.error('Error releasing product:', error);
      throw error;
    }
  },

  // Devolver (received): volta a disponível, sem doador
  async returnProduct(ownerUid: string, productId: string) {
    try {
      await runTransaction(db, async (transaction) => {
        const { productRef } = await getForTransition(
          transaction, ownerUid, productId, [STATUS.RECEIVED], 'Produto não está recebido'
        );
        transaction.update(productRef, clearedDonor());
      });
      return { success: true };
    } catch (error) {
      console.error('Error returning product:', error);
      throw error;
    }
  },

  // Corrige o nome do doador de uma reserva (admin)
  async transferReservation(ownerUid: string, productId: string, newDonorName: string) {
    try {
      await runTransaction(db, async (transaction) => {
        const { productRef } = await getForTransition(
          transaction, ownerUid, productId, [STATUS.RESERVED], 'Produto não está reservado'
        );
        transaction.update(productRef, {
          reservedBy: requireName(newDonorName),
          reservedAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      });
      return { success: true };
    } catch (error) {
      console.error('Error transferring reservation:', error);
      throw error;
    }
  }
};

/* Couple Settings operations */
export const updateCoupleNames = async (
  ownerUid: string,
  brideName: string,
  groomName: string,
  pixKey: string,
  weddingDate: string,
  publicMessage: string,
  paletteId = 'azul-classico'
) => {
  try {
    await setDoc(namesDoc(ownerUid), {
      brideName: brideName.trim(),
      groomName: groomName.trim(),
      pixKey: pixKey.trim(),
      weddingDate: weddingDate,
      publicMessage: publicMessage.trim(),
      paletteId: paletteId,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error('Error updating couple names:', error);
    throw error;
  }
};

export const getCoupleNames = async (ownerUid: string): Promise<CoupleSettings | null> => {
  try {
    const docSnap = await getDoc(namesDoc(ownerUid));
    return docSnap.exists() ? (docSnap.data() as CoupleSettings) : null;
  } catch (error) {
    // Silenciosamente falha - os nomes do casal são opcionais
    return null;
  }
};
