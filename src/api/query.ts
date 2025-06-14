import { create } from 'zustand';
import { QueryClient, keepPreviousData } from '@tanstack/react-query';
import api from './index';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, //5 mins
      // retry: 2,
    },
  },
});

const fetchProducts = async (q?: string) => {
  const response = await api.get(`user/products${q ?? ''}`);
  return response.data;
};

// useQuery({ queryKey, queryFn})
// useMutation

export const productQuery = (q?: string) => ({
  queryKey: ['products', q],
  queryFn: () => fetchProducts(q),
});

const fetchPosts = async (q?: string) => {
  const response = await api.get(`user/posts/infinite${q ?? ''}`);
  return response.data;
};

export const postQuery = (q?: string) => ({
  queryKey: ['posts', q],
  queryFn: () => fetchPosts(q),
});

const fetchInfinitePosts = async ({ pageParam = null }) => {
  const query = pageParam ? `?limit=6&cursor=${pageParam}` : '?limit=6';
  const response = await api.get(`user/posts/infinite${query}`);
  return response.data;
};

export const postInfiniteQuery = () => ({
  queryKey: ['posts', 'infinite'],
  queryFn: fetchInfinitePosts,
  initialPageParam: null, //Start with no cursor
  getNextPageParam: (lastPage, pages) => lastPage.nextCursor ?? undefined,
  // getPreviousPageParam: (firstPage, pages) => firstPage.prevCursor ?? undefined,
  //maxPages: 6
});

const fetchOnePost = async (id: number) => {
  const post = await api.get(`user/posts/${id}`);

  if (!post) {
    throw new Response('', {
      status: 404,
      statusText: 'Not Found',
    });
  }
  return post.data;
};

export const onePostQuery = (id: number) => ({
  queryKey: ['posts', 'detail', id],
  queryFn: () => fetchOnePost(id),
});

const fetchCategoryType = async () =>
  api.get('user/filter-type').then((res) => res.data);

export const categoryTypeQuery = () => ({
  queryKey: ['category', 'type'],
  queryFn: () => fetchCategoryType(),
});

const fetchInfiniteProducts = async ({
  pageParam = null,
  categories = null,
  types = null,
}: {
  pageParam?: number | null;
  categories: string | null;
  types: string | null;
}) => {
  let query = pageParam ? `?limit=9&cursor=${pageParam}` : '?limit=9';
  if (categories) query += `&category=${categories}`;
  if (types) query += `&type=${types}`;
  const response = await api.get(`user/products${query}`);
  return response.data;
};

export const productInfiniteQuery = (
  categories: string | null = null,
  types: string | null = null
) => ({
  queryKey: [
    'products',
    'infinite',
    categories ?? undefined,
    types ?? undefined,
  ],
  queryFn: ({ pageParam }: { pageParam?: number | null }) =>
    fetchInfiniteProducts({ pageParam, categories, types }),
  placeholderData: keepPreviousData,
  initialPageParam: null, //Start with no cursor
  getNextPageParam: (lastPage, pages) => lastPage.nextCursor ?? undefined,
});

const fetchOneProduct = async (id: number) => {
  const product = await api.get(`user/products/${id}`);

  if (!product) {
    throw new Response('', {
      status: 404,
      statusText: 'Not Found',
    });
  }
  return product.data;
}

export const oneProductQuery = (id: number) => ({
  queryKey: ['products', 'detail', id],
  queryFn: () => fetchOneProduct(id),
});

export const createCheckoutSession = async (products: {
  productId: number;
  quantity: number;
  unit_price: number;
  name: string;
  image?: string;
  currency: string;
}[]) => {
  try {
    const response = await api.post('user/create-checkout-session', {
      products,
    });
    return response.data;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};
