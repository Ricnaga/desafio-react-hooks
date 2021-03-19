import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart')

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      // TODO
      const responseProduct = await api.get(`/products/${productId}`)
      const responseStock = await api.get(`/stock/${productId}`)
      const productHaveOnCart = cart.filter(product => product.id === productId)

      if (productHaveOnCart.length > 0) {
        productHaveOnCart[0].amount++

        const addProductOnCart = [...cart.filter(product => product.id !== productId), productHaveOnCart[0]]

        setCart(addProductOnCart)
        
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(addProductOnCart))
      }

      if (productHaveOnCart.length === 0) {

        const addProductOnCart = [...cart, {
          ...responseProduct.data,
          amount: responseProduct.data.amount = 1
        }]

        setCart(addProductOnCart)
        
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(addProductOnCart))
      }

      if (responseProduct.data.amount > responseStock.data.amount) {
        toast.error('Quantidade solicitada fora de estoque');
      }

    } catch {
      // TODO
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
