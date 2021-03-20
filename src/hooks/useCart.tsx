import { error } from 'node:console';
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
      const stock = await api.get<Stock>(`/stock/${productId}`)

      const productHaveOnCart = cart.filter(product => product.id === productId)

      if (productHaveOnCart.length === 0) {
        if (stock.data.amount < 1) {
          throw toast.error('Quantidade solicitada fora de estoque');
        } else {

          await api.get<Product>(`/products/${productId}`).then(response => {
            const addProductOnCart = [...cart, {
              ...response.data,
              amount: response.data.amount = 1
            }]

            setCart(addProductOnCart)

            localStorage.setItem('@RocketShoes:cart', JSON.stringify(addProductOnCart))
          })

        }

      }

      if (productHaveOnCart.length === 1) {

        if (productHaveOnCart[0].amount + 1 > stock.data.amount) {
          throw toast.error('Quantidade solicitada fora de estoque');
        } else {

          const addProductOnCart = cart.map(product =>
            product.id === productId ?
              {
                id: product.id,
                title: product.title,
                image: product.image,
                price: product.price,
                amount: product.amount + 1
              } : product)

          setCart(addProductOnCart)
          localStorage.setItem('@RocketShoes:cart', JSON.stringify(addProductOnCart))
        }

      }

    } catch {
      // TODO
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      // TODO
      const product = cart.filter(product => product.id === productId)
      if (product.length === 0) {
        throw toast
      }

      if (product.length === 1) {
        const otherProducts = cart.filter(product => product.id !== productId)
        setCart(otherProducts)
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(otherProducts))
      }


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
        throw toast.error('Quantidade solicitada fora de estoque');
      }

      if (amount < 1) {
        throw toast
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
