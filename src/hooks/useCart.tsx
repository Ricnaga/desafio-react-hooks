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

      if (responseProduct.data.amount > responseStock.data.amount) {
        toast.error('Quantidade solicitada fora de estoque');
        return
      }
      
      const productHaveOnCart = cart.filter(product => product.id === productId)

      if (productHaveOnCart.length > 0) {
        const addProductOnCart = cart.map(product => 
          product.id === productId ? 
          {
            id:product.id,
            title:product.title,
            image:product.image,
            price:product.price,
            amount:product.amount+1
          } : product)

          setCart(addProductOnCart)
          console.log(addProductOnCart)
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



    } catch {
      // TODO
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      // TODO
      const otherProducts = cart.filter(product => product.id !== productId)
      setCart(otherProducts)
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(otherProducts))

    } catch {
      // TODO
      toast.error('Erro na remoção do produto')
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
      const responseStock = await api.get(`/stock/${productId}`)
      
      if (amount > responseStock.data.amount) {
        toast.error('Quantidade solicitada fora de estoque');
      }

      const productHaveOnCart = cart.map(product =>
        product.id === productId ?
          {
            id: product.id,
            title: product.title,
            image: product.image,
            price: product.price,
            amount,
          }
          : product)

      setCart(productHaveOnCart)

      localStorage.setItem('@RocketShoes:cart', JSON.stringify(productHaveOnCart))
      
    } catch {
      // TODO
      toast.error('Erro na alteração de quantidade do produto');
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
