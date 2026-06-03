export const ROUTES = {
  home:'/',shop:'/shop',cart:'/cart',search:'/search',
  about:'/about',contact:'/contact',
  product:(h:string)=>`/products/${h}`,
  login:'/auth/login',register:'/auth/register',
  account:'/account',orders:'/account/orders',
} as const
